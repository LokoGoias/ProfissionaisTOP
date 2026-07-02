const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const Payment = require('../database/models/Payment');
const CreditTransaction = require('../database/models/CreditTransaction');
const stripeService = require('../services/stripeService');
const mercadopagoService = require('../services/mercadopagoService');

const GATEWAY = process.env.PAYMENT_GATEWAY || 'mercadopago';

const CREDIT_PACKAGES = {
  '10': { credits: 10, price: 10.00, name: 'Básico' },
  '50': { credits: 50, price: 45.00, name: 'Profissional' },
  '100': { credits: 100, price: 80.00, name: 'Premium' }
};

exports.createPaymentSession = async (req, res, next) => {
  try {
    const { packageKey } = req.body;
    const userId = req.user.id;

    if (!CREDIT_PACKAGES[packageKey]) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    const pkg = CREDIT_PACKAGES[packageKey];
    const user = await User.findByPk(userId);

    // Create payment record
    const payment = await Payment.create({
      userId,
      gateway: GATEWAY,
      externalId: `temp_${Date.now()}`,
      amount: pkg.price,
      creditsGiven: pkg.credits,
      status: 'pending',
      description: `${pkg.credits} créditos - ${pkg.name}`,
      customerEmail: user.email,
      metadata: { packageKey }
    });

    let sessionData;

    if (GATEWAY === 'stripe') {
      sessionData = await stripeService.createCheckoutSession({
        paymentId: payment.id,
        credits: pkg.credits,
        price: pkg.price,
        userEmail: user.email
      });
    } else if (GATEWAY === 'mercadopago') {
      sessionData = await mercadopagoService.createPreference({
        paymentId: payment.id,
        credits: pkg.credits,
        price: pkg.price,
        userEmail: user.email
      });
    }

    // Update payment with external ID
    await payment.update({ externalId: sessionData.externalId });

    res.json({
      paymentId: payment.id,
      ...sessionData
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findByPk(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      credits: payment.creditsGiven,
      completedAt: payment.completedAt
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findByPk(paymentId);
    if (!payment || payment.userId !== userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // This is typically called by webhooks, but allow manual confirmation for testing
    const db = getSequelize();
    const transaction = await db.transaction();

    try {
      // Update user credits
      const user = await User.findByPk(userId, { transaction });
      await user.update(
        { credits: user.credits + payment.creditsGiven },
        { transaction }
      );

      // Create credit transaction
      await CreditTransaction.create({
        userId,
        type: 'purchase',
        amount: payment.creditsGiven,
        reason: payment.description,
        paymentId,
        balance: user.credits + payment.creditsGiven
      }, { transaction });

      // Update payment status
      await payment.update(
        { status: 'completed', completedAt: new Date() },
        { transaction }
      );

      await transaction.commit();

      res.json({
        message: 'Payment confirmed',
        credits: user.credits + payment.creditsGiven
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { userId, status: 'completed' },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(payments.map(p => ({
      id: p.id,
      date: p.createdAt,
      amount: p.amount,
      credits: p.creditsGiven,
      gateway: p.gateway,
      status: p.status
    })));
  } catch (err) {
    next(err);
  }
};
