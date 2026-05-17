const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// On Vercel every request enters through their proxy, so X-Forwarded-For is
// the only way to see the real client IP. Without this, the rate limiter
// would bucket every request under one Vercel-internal IP.
app.set('trust proxy', 1);

app.use(helmet());

// Per-client-IP limit. Tracking pages poll every 1.5s so a single 15-min
// session can legitimately exceed a few hundred requests — keep the
// ceiling high enough to never block real usage, low enough to throttle
// brute-force or runaway scripts.
//
// On express-rate-limit v8: we let the library use its default keyGenerator
// (which IPv6-normalizes req.ip correctly). We just opt out of the v7+
// startup validation that crashes the function when `trust proxy=1` is set
// on Vercel — the warning is "could be spoofed" but on Vercel the
// forwarded-for chain is guaranteed.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  // Vercel's own uptime pings + bare /api index don't need to count
  // against the user-visible budget.
  skip: (req) => req.path === '/health' || req.path === '/' || req.path === '/api' || req.path === '/api/',
});
app.use('/api/', limiter);

// CORS allowlist:
//   - the explicit CLIENT_URL env var (when set)
//   - any localhost dev origin
//   - any QuickBite frontend Vercel alias (so eosin / hok-s / preview / git-master all work)
//   - any extra origins from ALLOWED_ORIGINS env var (comma-separated)
const EXPLICIT_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
].filter(Boolean);
const ORIGIN_PATTERN = /^https:\/\/quickbite-frontend(-[a-z0-9-]+)?\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (EXPLICIT_ORIGINS.includes(origin)) return true;
  if (ORIGIN_PATTERN.test(origin)) return true;
  // Allow any Vercel or Netlify deployment for flexibility
  if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) return true;
  return false;
};

app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'QuickBite API is healthy!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to QuickBite API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      orders: '/api/orders',
      reviews: '/api/reviews',
    },
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/coupons',   require('./routes/couponRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
