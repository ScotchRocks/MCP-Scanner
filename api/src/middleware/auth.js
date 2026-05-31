import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-secret-in-production';

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      tier: user.subscription_tier || 'free'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware to require authentication
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Use: Authorization: Bearer <token>' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

/**
 * Express middleware to check subscription tier
 */
export function requireSubscription(...tiers) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.tier === 'free') {
      return res.status(403).json({ 
        error: 'Subscription required',
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3001'}/pricing`
      });
    }

    if (tiers.length > 0 && !tiers.includes(req.user.tier)) {
      return res.status(403).json({ 
        error: `This feature requires a ${tiers.join(' or ')} subscription`,
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3001'}/pricing`
      });
    }

    next();
  };
}