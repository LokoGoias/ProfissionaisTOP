const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const Payment = require('../database/models/Payment');
const CreditTransaction = require('../database/models/CreditTransaction');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ═══════════════════════════════════════════
// STRIPE WEBHOOK
// ═══════════════════════════════════════════
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await confirmPaymentInDB(paymentId);
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════
// MERCADOPAGO WEBHOOK
// ═══════════════════════════════════════════
exports.handleMercadopagoWebhook = async (req, res, next) => {
  try {
    // MercadoPago sends a GET with query params
    const { data, type } = req.query || req.body;

    if (type === 'payment') {
      // Fetch payment details from MercadoPago
      const mpPaymentId = data?.id;
      // Verify webhook token here if needed
      // Then confirm in DB
      console.log('MercadoPago payment webhook:', mpPaymentId);
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════
// HELPER: Confirm Payment in Database
// ═══════════════════════════════════════════
async function confirmPaymentInDB(paymentId) {
  const db = getSequelize();
  const transaction = await db.transaction();

  try {
    const payment = await Payment.findByPk(paymentId, { transaction });

    if (!payment || payment.status !== 'pending') {
      console.log('Payment already processed or not found:', paymentId);
      return;
    }

    const user = await User.findByPk(payment.userId, {
      lock: true,
      transaction
    });

    if (!user) {
      throw new Error('User not found for payment: ' + paymentId);
    }

    // Update user credits
    const newBalance = user.credits + payment.creditsGiven;
    await user.update({ credits: newBalance }, { transaction });

    // Create credit transaction
    await CreditTransaction.create({
      userId: payment.userId,
      type: 'purchase',
      amount: payment.creditsGiven,
      reason: `Purchase: ${payment.creditsGiven} credits`,
      paymentId,
      balance: newBalance
    }, { transaction });

    // Update payment status
    await payment.update(
      { status: 'completed', completedAt: new Date() },
      { transaction }
    );

    await transaction.commit();

    console.log(`✅ Payment confirmed: ${paymentId} | User: ${user.email} | +${payment.creditsGiven} credits`);
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Webhook processing failed:', err);
    throw err;
  }
}
