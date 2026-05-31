import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { initDatabase } from './db/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Body parsing — JSON for API routes, raw for Stripe webhooks
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Health check (defined before dynamic imports so it always works)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'MCP Security Scanner API',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'dev-mode',
    timestamp: new Date().toISOString(),
  });
});

// Initialize database, then start server
async function start() {
  await initDatabase();
  console.log('  🗄️  Database initialized (sql.js)');

  // Dynamically import routes after DB is ready
  const { default: stripeRoutes } = await import('./routes/stripe.js');
  const { default: scanRoutes } = await import('./routes/scans.js');

  app.use('/api', stripeRoutes);
  app.use('/api', scanRoutes);

  // SEO static files — robots.txt and sitemap.xml (before catch-all)
  const projectRoot = join(__dirname, '..', '..');
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(join(projectRoot, 'robots.txt'));
  });
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(join(projectRoot, 'sitemap.xml'));
  });

  // Serve static dashboard in production
  const dashboardPath = join(__dirname, '..', '..', 'dashboard', 'dist');
  if (existsSync(dashboardPath)) {
    app.use(express.static(dashboardPath));
    app.get('*', (req, res) => {
      res.sendFile(join(dashboardPath, 'index.html'));
    });
  }

  // Error handler
  app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🔐 MCP Scanner API running on http://0.0.0.0:${PORT}`);
    console.log(`  📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`  💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ LIVE' : '⚠️ DEV MODE (simulated payments)'}`);
    console.log();
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});