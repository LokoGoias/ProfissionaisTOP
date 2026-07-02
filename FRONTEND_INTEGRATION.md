# Frontend Integration Guide

## 🔗 Connecting index.html to the Backend

### Step 1: Add API Client Module

Create `frontend/api-client.js` and include it in `index.html`:

```html
<script src="api-client.js"></script>
```

### Step 2: API Client Code

```javascript
// frontend/api-client.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // ═══════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════
  async register(name, email, password, type = 'client', specialty = '') {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, type, specialty })
    });
    this.setToken(data.token);
    return data.user;
  }

  async login(email, password) {
    const data = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data.user;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ═══════════════════════════════════════════
  // USER
  // ═══════════════════════════════════════════
  async getCurrentUser() {
    return await this.request('/users/me');
  }

  async updateProfile(data) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getCredits() {
    const data = await this.request('/users/credits');
    return data.credits;
  }

  // ═══════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════
  async createPaymentSession(packageKey) {
    return await this.request('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ packageKey })
    });
  }

  async getPaymentStatus(paymentId) {
    return await this.request(`/payments/status/${paymentId}`);
  }

  async getPaymentHistory() {
    return await this.request('/payments/history');
  }

  // ═══════════════════════════════════════════
  // CREDITS
  // ═══════════════════════════════════════════
  async spendCredits(action, amount, reason = '') {
    return await this.request('/credits/spend', {
      method: 'POST',
      body: JSON.stringify({ action, amount, reason })
    });
  }

  async getCreditHistory(limit = 50) {
    return await this.request(`/credits/history?limit=${limit}`);
  }

  async getCreditBalance() {
    return await this.request('/credits/balance');
  }
}

const API = new APIClient();
```

### Step 3: Update Login/Register Functions

Replace the old functions in `index.html`:

```javascript
// OLD
async function handleLogin(e) {
  e.preventDefault();
  const email = $('login-email').value;
  const pwd = $('login-pwd').value;
  
  // Old localStorage logic
  const u = S.users.find(u => u.email === email);
  // ...
}

// NEW
async function handleLogin(e) {
  e.preventDefault();
  try {
    const email = $('login-email').value;
    const password = $('login-pwd').value;
    
    const user = await API.login(email, password);
    S.user = user;
    
    closeModal('modal-login');
    updateAuthUI();
    notify(`✅ Bem-vindo(a), ${user.name}!`);
    navigateTo('home');
  } catch (err) {
    notify(err.message, 'error');
  }
}
```

### Step 4: Update Payment Function

```javascript
// OLD
function buyCredits(credits, price) {
  // Simulated purchase
  S.user.credits += credits;
  notify(`✅ Compra simulada: +${credits} créditos!`);
}

// NEW
async function buyCredits(packageKey) {
  if (!S.user) return notify('Faça login primeiro', 'error');

  try {
    notify('Processando pagamento...', 'info');
    
    const session = await API.createPaymentSession(packageKey);
    
    if (session.checkoutUrl) {
      // Stripe
      window.location.href = session.checkoutUrl;
    } else if (session.initPoint) {
      // MercadoPago
      window.location.href = session.initPoint;
    }
  } catch (err) {
    notify(`Erro: ${err.message}`, 'error');
  }
}
```

### Step 5: Add Success Page Handler

```javascript
// After payment, user returns to success URL
function handlePaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('paymentId');
  
  if (paymentId) {
    checkPaymentStatus(paymentId);
  }
}

async function checkPaymentStatus(paymentId) {
  try {
    const status = await API.getPaymentStatus(paymentId);
    
    if (status.status === 'completed') {
      notify(`✅ Pagamento confirmado! +${status.credits} créditos`, 'success');
      S.user.credits = status.credits;
      setTimeout(() => navigateTo('dashboard'), 2000);
    } else {
      notify('Pagamento pendente. Aguarde confirmação...', 'info');
    }
  } catch (err) {
    notify(`Erro ao verificar pagamento: ${err.message}`, 'error');
  }
}

// Call on page load if returning from payment
if (window.location.pathname.includes('success')) {
  handlePaymentSuccess();
}
```

### Step 6: Add Spend Credits Integration

```javascript
// OLD
async function handleRequest(e) {
  e.preventDefault();
  const desc = $('req-desc').value;
  // ... create job
  S.user.credits -= 10; // Deduct locally
}

// NEW
async function handleRequest(e) {
  e.preventDefault();
  
  try {
    // First spend credits
    await API.spendCredits('post_job', 10, 'Posted job');
    
    const job = {
      cat: $('req-cat').value,
      desc: $('req-desc').value,
      budget: $('req-budget').value,
      city: $('req-city').value,
      state: $('req-state').value
    };
    
    // Then create job (you'll need a /api/jobs endpoint)
    // await API.createJob(job);
    
    notify('✅ Vaga publicada com sucesso!', 'success');
    $('request-form').reset();
    
    // Refresh credits
    S.user.credits = await API.getCredits();
  } catch (err) {
    notify(`Erro: ${err.message}`, 'error');
  }
}
```

### Step 7: Sync User Data on Load

```javascript
// OLD
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  // ... parse and sync to S object
}

// NEW
async function initializeApp() {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      S.user = await API.getCurrentUser();
      updateAuthUI();
      console.log('✅ User restored:', S.user.name);
    } catch (err) {
      console.error('Auth failed:', err);
      API.logout();
      updateAuthUI();
    }
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## 🔒 Environment Variables (Frontend)

```html
<!-- In index.html head -->
<script>
  // This will be replaced during build
  window.API_URL = 'https://api.profissionaistop.com';
</script>
```

Or use a build tool:

```javascript
// frontend/api-client.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

## 🧪 Testing with Postman

### 1. Register
```
POST /api/users/register
Body:
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "type": "professional",
  "specialty": "Eletricista"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### 2. Create Payment
```
POST /api/payments/create-session
Headers:
  Authorization: Bearer {token}
Body:
{
  "packageKey": "50"
}

Response:
{
  "paymentId": "uuid",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### 3. Spend Credits
```
POST /api/credits/spend
Headers:
  Authorization: Bearer {token}
Body:
{
  "action": "post_job",
  "amount": 10,
  "reason": "Posted new job"
}

Response:
{
  "message": "Credits spent",
  "creditsRemaining": 90
}
```

---

## 🚀 Deployment

### Frontend
```bash
# Update API_URL for production
echo "REACT_APP_API_URL=https://api.profissionaistop.com" > .env.production

# Deploy to GitHub Pages
npm run build
npm run deploy
```

### Backend
```bash
# Deploy to Heroku/Railway/DigitalOcean
FRONTEND_URL=https://profissionaistop.github.io npm start
```

---

## ✅ Checklist

- [ ] API client module created
- [ ] Login/register connected to backend
- [ ] Payment integration working
- [ ] Credit spending tracked
- [ ] Token stored securely
- [ ] Error handling implemented
- [ ] Tested with Postman
- [ ] Deployed to staging
- [ ] User acceptance testing passed

Done! 🎉
