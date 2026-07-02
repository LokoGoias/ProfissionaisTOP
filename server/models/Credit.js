const { DataTypes } = require('sequelize');

module.exports = class Credit {
  static init(sequelize) {
    return sequelize.define('credits', {
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
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('purchase', 'job_posting', 'profile_unlock', 'refund', 'bonus'),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      relatedJobId: {
        type: DataTypes.INTEGER,
        field: 'related_job_id'
      },
      transactionId: {
        type: DataTypes.STRING,
        field: 'transaction_id'
      }
    });
  }
};
