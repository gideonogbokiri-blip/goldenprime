require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { setupSwagger } = require('./config/swagger');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const cryptoRoutes = require('./routes/crypto');
const tradingRoutes = require('./routes/trading');
const kycRoutes = require('./routes/kyc');
const depositRoutes = require('./routes/deposit');
const preorderRoutes = require('./routes/preorder');
const p2pRoutes = require('./routes/p2pTrading');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://frontend-eight-beige-32.vercel.app',
    'https://goldenprime-pi.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/gold', preorderRoutes);
app.use('/api/p2p', p2pRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || 'development' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`GoldenPrime API running on port ${PORT}`);
  });
}

module.exports = app;
