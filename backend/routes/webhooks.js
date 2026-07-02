const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Stripe webhook
router.post('/stripe', webhookController.handleStripeWebhook);

// MercadoPago webhook
router.post('/mercadopago', webhookController.handleMercadopagoWebhook);

module.exports = router;
