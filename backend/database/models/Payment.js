const { DataTypes } = require('sequelize');

class Payment {
  static init(sequelize) {
    return sequelize.define('Payment', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      gateway: {
        type: DataTypes.ENUM('stripe', 'mercadopago'),
        allowNull: false
      },
      externalId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'BRL'
      },
      creditsGiven: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      description: DataTypes.STRING(255),
      customerEmail: DataTypes.STRING(255),
      metadata: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      completedAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
      tableName: 'payments',
      timestamps: true
    });
  }
}

module.exports = Payment;
