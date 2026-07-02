# Payment Gateway Comparison: MercadoPago vs Stripe

## Overview

Both are excellent payment processors with strong presence in Brazil. Here's a detailed comparison:

## 📊 Head-to-Head Comparison

| Aspect | MercadoPago | Stripe |
|--------|-------------|--------|
| **Brazilian Market** | 🥇 Native (most popular in Brazil) | 🥈 Growing presence |
| **Setup Difficulty** | ⭐ Easy | ⭐⭐ Moderate |
| **Documentation** | Portuguese available | English + Portuguese |
| **Fees** | 1.99% + R$0.49 (cartão débito/crédito) | 2.99% + R$0.30 (credit card) |
| **Settlement Time** | 1-2 days | 2 days |
| **Webhook Support** | ✅ Yes | ✅ Yes (more robust) |
| **Recurring Payments** | ✅ Yes | ✅ Yes |
| **Refunds** | ✅ Yes | ✅ Yes |
| **Pix Support** | ✅ Native | ✅ Via third-party |
| **Dashboard** | 🟢 Portuguese UI | 🔵 English UI |
| **Support** | Portuguese speakers | English + Portuguese |

---

## 🎯 MercadoPago (Recommended for ProfissionaisTOP)

### ✅ Pros
- **Native to Brazil** — Most users recognize it
- **Pix integration** — Modern Brazilian instant payment method
- **Lower learning curve** — Portuguese documentation
- **Faster setup** — Less compliance friction for small businesses
- **Portal wallet** — Users can save cards in MercadoPago account
- **Best for regional marketplaces**

### ❌ Cons
- **Higher fees** for some payment methods
- **Documentation** can be outdated
- **Webhook reliability** — sometimes inconsistent
- **Less customizable** payment flows

### Pricing (Brazil)
```
Cartão de Crédito/Débito: 1.99% + R$0.49
Transferência Bancária:   1.50% + R$2.00
Pix:                      1.99% + R$0.49
```

### Setup Steps
1. Create account at mercadopago.com.br
2. Verify business (KYC documents)
3. Get Access Token from dashboard
4. Integrate via SDK or API

---

## 💳 Stripe (Better for International Growth)

### ✅ Pros
- **Global reach** — 135+ countries
- **Robust webhooks** — More reliable
- **Better API** — More flexible integrations
- **Advanced features** — Billing, subscriptions, disputes
- **Excellent documentation** — Comprehensive guides
- **Better fraud prevention**

### ❌ Cons
- **Higher initial complexity**
- **English-first documentation**
- **Account review** can take longer
- **Slightly higher fees**
- **Pix support** is newer

### Pricing (Brazil)
```
Cartão Crédito/Débito: 2.99% + R$0.30
Boleto:               1.50% + R$2.00
Pix:                  1.50% + R$0.96 (via 3rd party)
```

### Setup Steps
1. Create account at stripe.com
2. Fill business details
3. Activate test mode
4. Get API keys
5. Integrate SDK

---

## 🔄 Webhook Reliability Comparison

### MercadoPago
```javascript
// GET request with query parameters
https://your-server.com/webhook?data={"id":123}&type=payment

// You need to manually fetch payment details
```

**Issues:**
- GET request (less secure)
- Payload sent as query params
- Requires additional API call to verify

### Stripe
```javascript
// POST request with signed payload
POST https://your-server.com/webhook
Content-Type: application/json
stripe-signature: t=...,v1=...

// Full event data included + signed
```

**Advantages:**
- POST request (more secure)
- Complete data in body
- Cryptographic signature verification
- More reliable retry logic

---

## 🚀 Recommendation for ProfissionaisTOP

### **Use MercadoPago First** 🇧🇷
**Why:**
- Your marketplace is Brazil-focused
- Lower implementation complexity
- Better UX for Brazilian users
- Pix support out of the box
- Faster onboarding

### **Migrate to Stripe Later** 🌍
**Why:**
- When expanding internationally
- Better infrastructure for growth
- More payment methods support
- Superior dashboard and reporting

---

## 📋 Implementation Timeline

### Phase 1: MercadoPago (Week 1-2)
```
✅ Setup MercadoPago credentials
✅ Implement payment creation endpoint
✅ Add webhook handler
✅ Test with sandbox
✅ Deploy to production
```

### Phase 2: Stripe (Month 2-3)
```
✅ Create Stripe account
✅ Implement Stripe checkout
✅ Add Stripe webhooks
✅ Allow users to choose payment method
✅ Gradual migration
```

---

## 🔐 Security Best Practices

### For Both Gateways

1. **Never expose API keys to frontend**
   ```javascript
   // ❌ WRONG - Frontend
   const stripe = Stripe('pk_live_xxx');
   
   // ✅ CORRECT - Backend
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   ```

2. **Always verify webhook signatures**
   ```javascript
   const sig = req.headers['stripe-signature'];
   const event = stripe.webhooks.constructEvent(body, sig, secret);
   ```

3. **Use HTTPS everywhere**
   - Webhook endpoints must use HTTPS
   - All API calls must use HTTPS

4. **Rotate webhook secrets regularly**
   - Generate new secrets every 90 days
   - Keep rotation log

5. **Rate limit payment endpoints**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5 // 5 requests per 15 minutes
   });
   app.post('/api/payments/create-session', limiter, ...);
   ```

---

## 🧪 Testing

### MercadoPago Sandbox
```
Test Card: 4111 1111 1111 1111
Expiry: 11/25
CVC: 123
```

### Stripe Test Cards
```
Visa:           4242 4242 4242 4242
Mastercard:     5555 5555 5555 4444
Amex:           3782 822463 10005
Declined:       4000 0000 0000 0002
```

---

## 📚 Resources

### MercadoPago
- [Official Docs (PT)](https://www.mercadopago.com.br/developers/pt/docs)
- [API Reference](https://www.mercadopago.com.br/developers/pt/reference)
- [Node SDK](https://github.com/mercadopago/sdk-nodejs)

### Stripe
- [Official Docs (EN)](https://stripe.com/docs)
- [Node.js SDK](https://github.com/stripe/stripe-node)
- [Webhook Guide](https://stripe.com/docs/webhooks)

---

## 💡 Conclusion

**Start with MercadoPago** for faster market entry in Brazil. Once you have a stable payment flow and want to expand internationally or offer more payment methods, **add Stripe** alongside it.

The backend architecture in this repository supports both—just set `PAYMENT_GATEWAY=mercadopago` or `PAYMENT_GATEWAY=stripe` in your `.env` file!
