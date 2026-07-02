const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

exports.createCheckoutSession = async ({ paymentId, credits, price, userEmail }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${credits} Créditos - ProfissionaisTOP`,
            description: `Compra de ${credits} créditos para usar na plataforma`
          },
          unit_amount: Math.round(price * 100) // Stripe uses cents
        },
        quantity: 1
      }],
      customer_email: userEmail,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&paymentId=${paymentId}`,
      cancel_url: `${FRONTEND_URL}/dashboard`,
      metadata: {
        paymentId,
        credits,
        userEmail
      }
    });

    return {
      externalId: session.id,
      checkoutUrl: session.url
    };
  } catch (err) {
    console.error('Stripe error:', err);
    throw err;
  }
};

exports.retrieveSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};
