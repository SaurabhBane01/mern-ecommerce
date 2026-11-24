import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes, { razorpayWebhook } from './routes/payments.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is missing or too short. Set a random secret of at least 32 characters.');
}

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: false
}));

// Razorpay signs the exact raw request bytes. This route must be registered before express.json().
const webhookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: 'draft-7', legacyHeaders: false });
app.post('/api/payments/webhook', webhookLimiter, express.raw({ type: 'application/json', limit: '1mb' }), razorpayWebhook);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', generalLimiter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'mern-ecommerce-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err.message === 'Origin is not allowed by CORS') return res.status(403).json({ message: err.message });
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
try {
  await connectDB();
  app.listen(port, () => console.log(`API running on port ${port}`));
} catch (error) {
  console.error('Database connection failed:', error.message);
  process.exit(1);
}
