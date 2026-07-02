const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Create payment session (Stripe or MercadoPago)
router.post('/create-session', auth, paymentController.createPaymentSession);

// Get payment status
router.get('/status/:paymentId', auth, paymentController.getPaymentStatus);

// Confirm payment (manual confirmation)
router.post('/confirm/:paymentId', auth, paymentController.confirmPayment);

// List user payments
router.get('/history', auth, paymentController.getPaymentHistory);

module.exports = router;
