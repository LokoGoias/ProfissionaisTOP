const mercadopago = require('mercadopago');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.createPreference = async ({ paymentId, credits, price, userEmail }) => {
  try {
    const preference = {
      items: [
        {
          title: `${credits} Créditos - ProfissionaisTOP`,
          description: `Compra de ${credits} créditos para usar na plataforma`,
          unit_price: price,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${FRONTEND_URL}/success?paymentId=${paymentId}`,
        failure: `${FRONTEND_URL}/dashboard`,
        pending: `${FRONTEND_URL}/dashboard`
      },
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/webhooks/mercadopago`,
      auto_return: 'approved',
      external_reference: paymentId,
      metadata: {
        paymentId,
        credits
      }
    };

    const result = await mercadopago.preferences.create(preference);

    return {
      externalId: result.body.id,
      initPoint: result.body.init_point,
      sandboxUrl: result.body.sandbox_init_point
    };
  } catch (err) {
    console.error('MercadoPago error:', err);
    throw err;
  }
};

exports.getPayment = async (paymentId) => {
  try {
    return await mercadopago.payment.findById(paymentId);
  } catch (err) {
    console.error('MercadoPago payment fetch error:', err);
    throw err;
  }
};
