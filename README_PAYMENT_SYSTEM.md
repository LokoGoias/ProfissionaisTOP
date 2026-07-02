# ProfissionaisTOP Payment System

## 🎯 Quick Start

### Backend Setup (5 minutes)

```bash
cd backend
cp .env.example .env

# Edit .env with your credentials:
# - MERCADOPAGO_ACCESS_TOKEN
# - DATABASE_URL
# - JWT_SECRET

npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend Integration (2 minutes)

1. Copy `frontend/api-client.js` to your frontend
2. Update payment function to call `API.createPaymentSession()`
3. Set `FRONTEND_URL` environment variable

---

## 📚 Documentation Files

| File | Purpose |
|------|----------|
| `.env.example` | Environment variables template |
| `server.js` | Express server setup |
| `database/init.js` | Database initialization |
| `database/models/` | Sequelize models (User, Payment, etc) |
| `routes/` | API endpoints |
| `controllers/` | Business logic |
| `services/` | Payment gateway services (Stripe/MercadoPago) |
| `middleware/` | JWT authentication |
| `scripts/` | Database migration scripts |
| `PAYMENT_GATEWAY_COMPARISON.md` | MercadoPago vs Stripe analysis |
| `DATABASE_MIGRATION_GUIDE.md` | localStorage → PostgreSQL migration |
| `FRONTEND_INTEGRATION.md` | How to connect frontend to backend |

---

## 🏗️ Architecture

```
Browser
  ↓ HTTPS (JWT in Authorization header)
Express Backend
  ├─ Route: POST /api/payments/create-session
  ├─ Route: POST /api/users/login
  ├─ Route: POST /api/credits/spend
  └─ Route: POST /webhooks/stripe|mercadopago
  ↓ SQL
PostgreSQL Database
  ├─ users
  ├─ payments
  ├─ credit_transactions
  ├─ jobs
  ├─ ratings
  └─ messages
```

---

## 💳 Supported Payment Methods

### MercadoPago 🇧🇷
- Credit/Debit Cards
- Pix (instant transfer)
- Bank transfers
- Digital wallets

### Stripe 🌍
- Credit/Debit Cards
- Pix (via partner)
- ACH transfers
- Digital wallets

---

## 🔄 Payment Flow

### Step 1: User clicks "Comprar Créditos"
```javascript
await API.createPaymentSession('50')  // 50 credits
```

### Step 2: Backend creates payment session
```
- Save payment record to database (status: pending)
- Call MercadoPago/Stripe API
- Return checkout URL
```

### Step 3: User redirected to payment provider
```
- MercadoPago: https://www.mercadopago.com.br/checkout/...
- Stripe: https://checkout.stripe.com/pay/...
```

### Step 4: User completes payment
```
- Payment provider redirects to success URL
- Backend receives webhook
- Credits added to account
```

### Step 5: Frontend confirms
```javascript
await API.getPaymentStatus(paymentId)  // Check status
if (status.completed) {
  S.user.credits += status.credits
}
```

---

## 🧪 Testing

### Local Testing

```bash
# Terminal 1: Backend
cd backend
npm run dev
# http://localhost:5000

# Terminal 2: Frontend (if using separate)
cd frontend
npm start
# http://localhost:3000
```

### Test Payments (MercadoPago Sandbox)

```
Card: 4111 1111 1111 1111
Expiry: 11/25
CVC: 123
Status: Success
```

### Test Payments (Stripe Test)

```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Status: Success

Decline: 4000 0000 0000 0002
Status: Failed
```

---

## 📊 Database Schema Quick View

```javascript
// User
{
  id: UUID,
  email: String,
  passwordHash: String,
  credits: Number,
  type: 'client' | 'professional',
  // ...
}

// Payment
{
  id: UUID,
  userId: UUID,
  gateway: 'stripe' | 'mercadopago',
  externalId: String,
  amount: Decimal,
  creditsGiven: Number,
  status: 'pending' | 'completed' | 'failed',
  // ...
}

// CreditTransaction
{
  id: UUID,
  userId: UUID,
  type: 'purchase' | 'spend' | 'refund',
  amount: Number,
  balance: Number,
  // ...
}
```

---

## 🚀 Deployment

### Option 1: Heroku
```bash
git push heroku feature/payment-system:main
heroku run npm run migrate
```

### Option 2: Railway.app
```bash
railway up  # Reads railway.toml
```

### Option 3: DigitalOcean
```bash
doctl apps create --spec app.yaml
```

---

## 🔐 Security Checklist

- [ ] Never expose API keys to frontend
- [ ] All requests use HTTPS
- [ ] JWT tokens expire (7 days)
- [ ] Passwords hashed with bcrypt
- [ ] Webhook signatures verified
- [ ] Rate limiting enabled
- [ ] Database backups automated
- [ ] CORS properly configured
- [ ] SQL injection protected (Sequelize ORM)
- [ ] CSRF tokens if needed

---

## 🐛 Troubleshooting

### Payment webhook not received
1. Check webhook URL in gateway settings
2. Verify HTTPS certificate
3. Check firewall rules
4. Monitor backend logs
5. Test with curl:
   ```bash
   curl -X POST http://localhost:5000/webhooks/stripe \
     -H "Content-Type: application/json" \
     -H "stripe-signature: test" \
     -d '{"type":"test"}'
   ```

### Credits not updating
1. Check payment status: `GET /api/payments/status/{id}`
2. Verify transaction record in database
3. Check for transaction rollback errors
4. Review backend logs

### Database connection failed
1. Check `DATABASE_URL` format
2. Verify PostgreSQL is running
3. Test connection: `psql $DATABASE_URL`
4. Check firewall rules

---

## 📞 Support

- Backend issues: Check `/backend/` README
- Payment issues: See `PAYMENT_GATEWAY_COMPARISON.md`
- Database issues: See `DATABASE_MIGRATION_GUIDE.md`
- Frontend issues: See `FRONTEND_INTEGRATION.md`

---

## 📈 Next Steps

1. ✅ Create Node.js backend
2. ✅ Set up payment gateways
3. ✅ Implement webhooks
4. ✅ Migrate database
5. ⬜ Add email notifications
6. ⬜ Implement dispute handling
7. ⬜ Add subscription support
8. ⬜ Create analytics dashboard

---

**Ready to accept payments? 🚀 Let's go!**
