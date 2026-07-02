require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database/init');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const creditsRoutes = require('./routes/credits');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Important: Webhook routes need raw body, so define them FIRST
app.use('/webhooks', express.raw({type: 'application/json'}), webhookRoutes);

// Then apply JSON parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/credits', creditsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ═══════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════
async function start() {
  try {
    await initDB();
    console.log('✅ Database initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`💳 Payment gateway: ${process.env.PAYMENT_GATEWAY}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
