import { Router } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, run } from '../db/database.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Subscription tier pricing IDs (set these in Stripe Dashboard)
const PRICE_LOOKUP = {
  basic_pro: process.env.STRIPE_PRICE_BASIC_PRO || 'price_basic_pro',
  team: process.env.STRIPE_PRICE_TEAM || 'price_team',
};

/**
 * POST /api/auth/login — Simple login/register flow
 * Body: { email, name? }
 */
router.post('/auth/login', (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
  
  if (!user) {
    const id = uuidv4();
    run('INSERT INTO users (id, email, name) VALUES (?, ?, ?)', [id, email, name || null]);
    user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
  }

  const token = generateToken(user);
  
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscription_tier,
      status: user.subscription_status,
    },
  });
});

/**
 * GET /api/stripe/prices — Get available subscription plans
 */
router.get('/stripe/prices', async (req, res) => {
  const prices = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: ['Basic CLI scanner', 'Manual scans', 'JSON output', 'Open source'],
      priceId: null,
    },
    {
      id: PRICE_LOOKUP.basic_pro,
      name: 'Basic Pro',
      price: 1900,
      display_price: '$19/mo',
      currency: 'usd',
      interval: 'month',
      features: ['Everything in Free', 'Cloud dashboard', 'Scan history (30 days)', 'CI/CD integration', 'Email support'],
      priceId: PRICE_LOOKUP.basic_pro,
    },
    {
      id: PRICE_LOOKUP.team,
      name: 'Team',
      price: 4900,
      display_price: '$49/mo',
      currency: 'usd',
      interval: 'month',
      features: ['Everything in Basic Pro', 'Unlimited scan history', 'Compliance reports (PDF)', 'Team API keys', 'Priority support', 'SLA guarantee'],
      priceId: PRICE_LOOKUP.team,
    },
  ];

  res.json({ prices });
});

/**
 * POST /api/stripe/create-checkout-session — Create Stripe Checkout session
 * Body: { priceId, userId, successUrl?, cancelUrl? }
 */
router.post('/stripe/create-checkout-session', async (req, res) => {
  const { priceId, userId, successUrl, cancelUrl } = req.body;
  
  if (!priceId || !userId) {
    return res.status(400).json({ error: 'priceId and userId are required' });
  }

  // Dev mode — simulate payment if no Stripe key
  if (!stripe) {
    const tier = priceId === PRICE_LOOKUP.team ? 'team' : 'basic_pro';
    run(
      'UPDATE users SET subscription_tier = ?, subscription_status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [tier, 'active', userId]
    );

    return res.json({
      url: `${process.env.APP_URL || 'http://localhost:3001'}/dashboard?subscription=active&tier=${tier}`,
      message: 'Stripe not configured — running in dev mode with simulated payment',
    });
  }

  try {
    const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      run('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, userId]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.APP_URL || 'http://localhost:3001'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:3001'}/pricing`,
      metadata: { user_id: userId },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/stripe/webhook — Stripe webhook handler
 */
router.post('/stripe/webhook', async (req, res) => {
  if (!stripe) {
    return res.json({ received: true, message: 'Dev mode — webhook simulated' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        run(
          'UPDATE users SET subscription_tier = ?, subscription_status = ?, updated_at = datetime(\'now\') WHERE id = ?',
          ['basic_pro', 'active', userId]
        );
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const user = customerId 
        ? queryOne('SELECT id FROM users WHERE stripe_customer_id = ?', [customerId])
        : null;
      
      if (user) {
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'past_due' ? 'past_due' : 'canceled';
        const tier = subscription.status === 'active' ? 'basic_pro' : 'free';
        
        run(
          'UPDATE users SET subscription_tier = ?, subscription_status = ?, updated_at = datetime(\'now\') WHERE id = ?',
          [tier, status, user.id]
        );
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
