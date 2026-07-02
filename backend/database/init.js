const { Sequelize } = require('sequelize');
const User = require('./models/User');
const CreditTransaction = require('./models/CreditTransaction');
const Payment = require('./models/Payment');

let sequelize;

function getSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.DATABASE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    });
  }
  return sequelize;
}

async function initDB() {
  const db = getSequelize();
  
  // Initialize models
  User.init(db);
  CreditTransaction.init(db);
  Payment.init(db);
  
  // Define associations
  User.hasMany(CreditTransaction, { foreignKey: 'userId', as: 'creditTransactions' });
  CreditTransaction.belongsTo(User, { foreignKey: 'userId' });
  
  User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
  Payment.belongsTo(User, { foreignKey: 'userId' });
  
  // Sync database
  await db.sync({ alter: process.env.DATABASE_ENV === 'development' });
  
  return db;
}

module.exports = {
  getSequelize,
  initDB
};
