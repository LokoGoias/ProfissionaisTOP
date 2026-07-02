const { DataTypes } = require('sequelize');

module.exports = class Rating {
  static init(sequelize) {
    return sequelize.define('ratings', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'from_user_id'
      },
      toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'to_user_id'
      },
      jobId: {
        type: DataTypes.INTEGER,
        field: 'job_id'
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    });
  }
};
