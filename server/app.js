import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import variationRoutes from './routes/variationRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

const app = express();

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://annshagifts.nooryak.com',
  'http://annshagifts.nooryak.com',
  'https://www.annshagifts.nooryak.com',
  'http://www.annshagifts.nooryak.com',
  'https://annshagifts.com',
  'https://www.annshagifts.com',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman) or any matching domain
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Allow any subdomain of nooryak.com or annshagifts
    if (/^https?:\/\/([a-z0-9-]+\.)*nooryak\.com(:[0-9]+)?$/i.test(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)*annshagifts\.(com|in)(:[0-9]+)?$/i.test(origin)) {
      return callback(null, true);
    }
    // Permissive callback for storefront
    return callback(null, true);
  },
  credentials: true
}));

// 3. Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// 4. Anti-Hacking Data Sanitizers
app.use(mongoSanitize()); // Prevent NoSQL operator injection ($gt, etc.)
app.use(hpp()); // Prevent HTTP Parameter Pollution

// 5. Static file serving for uploads with caching headers
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '7d',
  immutable: true
}));

// 6. Rate Limiting on General API
app.use('/api', apiLimiter);

// 7. Route Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/revenue', revenueRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/variations', variationRoutes);

// Health check endpoint with Live Database diagnostics
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(200).json({ 
    status: 'ok', 
    service: 'Annsha Global API',
    database: {
      type: 'MongoDB',
      connected: isMongoConnected,
      mode: isMongoConnected ? 'MongoDB Server Live' : 'Embedded Dual-Storage Active (Automatic Persistent JSON Engine)',
      connectionState: mongoose.connection.readyState === 1 ? 'Connected' : 'Dual Storage Fallback Active'
    },
    timestamp: new Date() 
  });
});

// 8. Serve Client Static Files (SPA Fallback)
const possibleFrontendPaths = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), '../annshagifts.nooryak.com'),
  path.join(process.cwd(), '../client/dist'),
  path.join(process.cwd(), 'dist')
];

let staticFrontendPath = null;
for (const p of possibleFrontendPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    staticFrontendPath = p;
    break;
  }
}

if (staticFrontendPath) {
  app.use(express.static(staticFrontendPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticFrontendPath, 'index.html'));
  });
}

// 9. 404 Route Catch-all (for unhandled API routes)
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// 9. Central Error Handler
app.use(errorHandler);

export default app;

