const { DataTypes } = require('sequelize');

class User {
  static init(sequelize) {
    return sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('client', 'professional'),
        defaultValue: 'client'
      },
      credits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
      },
      status: {
        type: DataTypes.ENUM('active', 'blocked', 'pending'),
        defaultValue: 'active'
      },
      // Professional fields
      specialty: DataTypes.STRING(255),
      bio: DataTypes.TEXT,
      phone: DataTypes.STRING(20),
      location: DataTypes.STRING(255),
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      // Payment method info
      stripeCustomerId: DataTypes.STRING(255),
      mercadopagoCustomerId: DataTypes.STRING(255),
      
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
      tableName: 'users',
      timestamps: true
    });
  }
}

module.exports = User;
