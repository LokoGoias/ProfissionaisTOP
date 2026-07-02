# Database Migration Guide: localStorage → PostgreSQL

## 📚 Overview

This guide shows how to migrate from browser localStorage to a proper PostgreSQL database.

## 🏗️ Architecture

### Before (Current)
```
Browser
└── index.html (single file)
    ├── All data in localStorage
    ├── No persistence across browsers
    └── Max ~5-10MB storage
```

### After (New)
```
Browser (Frontend)
    ↕️  HTTPS API
Node.js Backend
    ↕️  TCP/IP
PostgreSQL Database
    └── Persistent data for all users
```

---

## 🗄️ Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  type ENUM('client', 'professional') DEFAULT 'client',
  credits INTEGER DEFAULT 0,
  status ENUM('active', 'blocked', 'pending') DEFAULT 'active',
  specialty VARCHAR(255),
  bio TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  mercadopago_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `credit_transactions`
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type ENUM('purchase', 'spend', 'refund', 'bonus'),
  amount INTEGER NOT NULL,
  reason VARCHAR(255),
  payment_id UUID REFERENCES payments(id),
  balance INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gateway ENUM('stripe', 'mercadopago') NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  credits_given INTEGER NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  description VARCHAR(255),
  customer_email VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `jobs`
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  budget DECIMAL(10, 2),
  tags TEXT[],
  status ENUM('open', 'assigned', 'completed', 'cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `ratings`
```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Migration Strategy

### Step 1: Export Data from localStorage

```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('profissionaistop-state-v1'));
console.log(JSON.stringify(data, null, 2));
// Copy the output
```

### Step 2: Create Migration Script

```javascript
// backend/scripts/migrateFromLocalStorage.js
require('dotenv').config();
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const Job = require('../database/models/Job');
const Rating = require('../database/models/Rating');
const CreditTransaction = require('../database/models/CreditTransaction');

const localStorageData = require('./localStorage-export.json');

async function migrate() {
  try {
    const db = getSequelize();
    const transaction = await db.transaction();

    console.log('🔄 Migrating users...');
    for (const u of localStorageData.users) {
      const passwordHash = await bcrypt.hash(atob(u.pwd), 10);
      await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        type: u.type,
        credits: u.credits,
        specialty: u.spec,
        location: u.loc,
        bio: u.bio,
        phone: u.phone,
        status: u.status,
        verified: u.verified || false
      }, { transaction });
    }
    console.log(`✅ Migrated ${localStorageData.users.length} users`);

    console.log('🔄 Migrating jobs...');
    for (const j of localStorageData.jobs) {
      const user = await User.findOne({
        where: { email: 'creator@email.com' },
        transaction
      });
      if (user) {
        await Job.create({
          userId: user.id,
          category: j.cat,
          description: j.desc,
          city: j.city,
          state: j.state,
          budget: j.budget,
          tags: j.tags
        }, { transaction });
      }
    }
    console.log(`✅ Migrated ${localStorageData.jobs.length} jobs`);

    console.log('🔄 Migrating ratings...');
    for (const r of localStorageData.ratings) {
      const fromUser = await User.findOne({
        where: { email: r.from },
        transaction
      });
      const toUser = await User.findOne({
        where: { email: r.to },
        transaction
      });
      if (fromUser && toUser) {
        await Rating.create({
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          stars: r.stars,
          comment: r.comment,
          createdAt: new Date(r.date)
        }, { transaction });
      }
    }
    console.log(`✅ Migrated ${localStorageData.ratings.length} ratings`);

    await transaction.commit();
    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
```

### Step 3: Run Migration

```bash
node backend/scripts/migrateFromLocalStorage.js
```

---

## 🖥️ Update Frontend Code

### Before (localStorage)
```javascript
// Old code in index.html
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
}

function loadState() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  // ... sync to S object
}
```

### After (Backend API)
```javascript
// New code (separate file or module)
class API {
  static async login(email, password) {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    localStorage.setItem('token', data.token); // Only store JWT
    return data.user;
  }

  static async getCredits() {
    const response = await fetch('/api/users/credits', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return (await response.json()).credits;
  }

  static async spendCredits(action, amount) {
    const response = await fetch('/api/credits/spend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ action, amount })
    });
    return await response.json();
  }
}

// Usage
S.user = await API.login(email, password);
```

---

## 🚀 Deployment Steps

### 1. Local Setup
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
sudo apt install postgresql  # Linux

# Create database
creatdb profissionaistop

# Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/profissionaistop" >> .env

# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

### 2. Production Setup

#### Option A: Heroku
```bash
# Install Heroku CLI
heroku login
heroku create profissionaistop-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku feature/payment-system:main

# Run migrations on Heroku
heroku run npm run migrate
```

#### Option B: Railway.app (Recommended)
```bash
# Login at railway.app
# Connect GitHub repo
# Add PostgreSQL plugin
# Set environment variables
# Deploy automatically on push
```

#### Option C: DigitalOcean App Platform
```bash
# Create app.yaml
name: profissionaistop-api
services:
  - name: api
    github:
      repo: LokoGoias/ProfissionaisTOP
      branch: feature/payment-system
    build_command: npm install
    run_command: npm start
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: NODE_ENV
        value: production

databases:
  - name: db
    engine: PG
    version: "14"
```

---

## ✅ Verification Checklist

- [ ] Database schema created
- [ ] User data migrated
- [ ] Jobs migrated
- [ ] Ratings migrated
- [ ] All API endpoints tested
- [ ] Webhooks receiving payments
- [ ] Credit transactions recorded
- [ ] Frontend API calls working
- [ ] JWT tokens validating correctly
- [ ] Production database backed up
- [ ] SSL certificates installed
- [ ] Rate limiting enabled

---

## 🔄 Data Sync Strategy During Migration

### Phase 1: Dual Write (Week 1)
- Write to both localStorage AND backend
- Read from localStorage (slower, but safe)
- Data flows: localStorage → Backend

### Phase 2: Backend Primary (Week 2-3)
- Write to backend only
- Read from backend (cache in localStorage for offline)
- Data flows: Backend → localStorage (cache)

### Phase 3: Backend Only (Week 4+)
- Remove localStorage logic completely
- All data from backend API
- Offline support via service workers (optional)

---

## 🆘 Rollback Plan

If something goes wrong:

```bash
# Keep old localStorage data available
cp index.html index.html.backup

# Point frontend back to localStorage temporarily
sed 's/API\\.getCredits/getCreditsFromLocalStorage/g' index.html > index.html.temp

# Users can still access their data via localStorage until backend is fixed
```

---

## 📊 Performance Improvements

| Metric | localStorage | PostgreSQL |
|--------|--------------|------------|
| **Storage** | ~10MB | Unlimited |
| **Query Speed** | O(n) full scan | O(1) indexed lookups |
| **Concurrent Users** | 1 | Unlimited |
| **Data Backup** | Manual | Automated |
| **Scaling** | Impossible | Horizontal |

---

## 🎓 Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Create backend API (done in this repo)
3. ✅ Migrate historical data
4. ✅ Test thoroughly in staging
5. ✅ Deploy to production
6. ✅ Monitor and optimize

You're ready to scale! 🚀
