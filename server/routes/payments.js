const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const PaymentService = require('../services/PaymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../models');

/**
 * POST /api/payments/create-intent
 * Create a payment intent for credit purchase
 */
router.post('/create-intent', requireAuth, async (req, res) => {
  try {
    const { credits, amount } = req.body;

    if (!credits || !amount) {
      return res.status(400).json({ error: 'Credits and amount required' });
    }

    const intent = await PaymentService.createPaymentIntent(req.user.id, credits, amount);

    res.json({
      clientSecret: intent.client_secret,
      intentId: intent.id,
      amount: intent.amount / 100, // Convert from cents
      credits
    });
  } catch (error) {
    console.error('Create intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payments/history
 * Get user payment history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await PaymentService.getPaymentHistory(req.user.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhook
 * Stripe webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await PaymentService.handleWebhookEvent(event);
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/payments/plans
 * Get available credit plans
 */
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'basic',
      name: 'Pacote Básico',
      credits: 10,
      price: 10.00,
      description: '10 créditos = 1 publicação',
      popular: false
    },
    {
      id: 'professional',
      name: 'Pacote Profissional',
      credits: 50,
      price: 45.00,
      description: '50 créditos = 5 publicações + 5 extras',
      popular: true
    },
    {
      id: 'premium',
      name: 'Pacote Premium',
      credits: 100,
      price: 80.00,
      description: '100 créditos = 10 publicações + 15 extras',
      popular: false
    }
  ];

  res.json(plans);
});

/**
 * GET /api/payments/confirm/:intentId
 * Confirm payment intent
 */
router.get('/confirm/:intentId', requireAuth, async (req, res) => {
  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.intentId);

    if (intent.status === 'succeeded') {
      const result = await PaymentService.handlePaymentSuccess(req.params.intentId);
      return res.json({ success: true, credits: result.credits });
    }

    res.json({ status: intent.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
