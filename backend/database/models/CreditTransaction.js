const { DataTypes } = require('sequelize');

class CreditTransaction {
  static init(sequelize) {
    return sequelize.define('CreditTransaction', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('purchase', 'spend', 'refund', 'bonus'),
        allowNull: false
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      reason: DataTypes.STRING(255),
      paymentId: DataTypes.UUID,
      balance: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      metadata: DataTypes.JSON,
      createdAt: DataTypes.DATE
    }, {
      tableName: 'credit_transactions',
      timestamps: false
    });
  }
}

module.exports = CreditTransaction;
