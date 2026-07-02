const { DataTypes } = require('sequelize');

module.exports = class Professional {
  static init(sequelize) {
    return sequelize.define('professionals', {
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
      specialty: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phone: {
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
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      avgRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        field: 'avg_rating'
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_reviews'
      },
      profileImage: {
        type: DataTypes.STRING,
        field: 'profile_image'
      }
    });
  }
};
