const { DataTypes } = require('sequelize');

module.exports = class Job {
  static init(sequelize) {
    return sequelize.define('jobs', {
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
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'open'
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public'
      }
    });
  }
};
