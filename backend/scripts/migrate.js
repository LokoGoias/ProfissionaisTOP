require('dotenv').config();
const { initDB } = require('../database/init');

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');
    await initDB();
    console.log('✅ Database migrated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
