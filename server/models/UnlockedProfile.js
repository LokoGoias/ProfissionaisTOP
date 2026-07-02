const { DataTypes } = require('sequelize');

module.exports = class UnlockedProfile {
  static init(sequelize) {
    return sequelize.define('unlocked_profiles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      professionalEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'professional_email'
      },
      unlockedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'unlocked_at'
      }
    });
  }
};
