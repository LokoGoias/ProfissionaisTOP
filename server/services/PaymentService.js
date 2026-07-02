const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Credit } = require('../models');

class PaymentService {
  /**
   * Create payment intent for credit purchase
   */
  static async createPaymentIntent(userId, credits, amount) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'brl',
        description: `Purchase ${credits} credits`,
        metadata: {
          userId,
          credits,
          userEmail: user.email
        }
      });

      return intent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(paymentIntentId) {
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const { userId, credits } = intent.metadata;

      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Add credits to user
      user.credits += parseInt(credits);
      await user.save();

      // Log transaction
      await Credit.create({
        userId,
        amount: credits,
        type: 'purchase',
        description: `Purchased ${credits} credits via Stripe`,
        transactionId: paymentIntentId
      });

      return { success: true, credits: user.credits };
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(userId) {
    try {
      const transactions = await Credit.findAll({
        where: {
          userId,
          type: 'purchase'
        },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  static async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          console.warn('Payment failed:', event.data.object.id);
          break;
        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle refunds
   */
  static async handleRefund(charge) {
    try {
      const transaction = await Credit.findOne({
        where: { transactionId: charge.payment_intent }
      });

      if (transaction) {
        const user = await User.findByPk(transaction.userId);
        user.credits -= parseInt(transaction.amount);
        await user.save();

        await Credit.create({
          userId: transaction.userId,
          amount: -parseInt(transaction.amount),
          type: 'refund',
          description: 'Refund for payment',
          transactionId: charge.id
        });
      }
    } catch (error) {
      console.error('Error handling refund:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
