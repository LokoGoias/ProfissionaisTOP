const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = class User {
  static init(sequelize) {
    this.sequelize = sequelize;
    return sequelize.define('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        lowercase: true,
        validate: { isEmail: true }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userType: {
        type: DataTypes.ENUM('client', 'professional'),
        allowNull: false,
        defaultValue: 'client',
        field: 'user_type'
      },
      status: {
        type: DataTypes.ENUM('active', 'blocked', 'pending'),
        defaultValue: 'active'
      },
      credits: {
        type: DataTypes.INTEGER,
        defaultValue: 5
      },
      lastLogin: {
        type: DataTypes.DATE,
        field: 'last_login'
      },
      twoFaEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'two_fa_enabled'
      },
      twoFaSecret: {
        type: DataTypes.STRING,
        field: 'two_fa_secret'
      }
    }, {
      hooks: {
        beforeCreate: this.hashPassword,
        beforeUpdate: this.hashPassword
      }
    });
  }

  static hashPassword = async (user) => {
    if (user.changed('passwordHash')) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
    }
  }
};
