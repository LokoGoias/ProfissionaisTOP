const { DataTypes } = require('sequelize');

module.exports = class Message {
  static init(sequelize) {
    return sequelize.define('messages', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id'
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'recipient_id'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read'
      },
      readAt: {
        type: DataTypes.DATE,
        field: 'read_at'
      },
      attachmentUrl: {
        type: DataTypes.STRING,
        field: 'attachment_url'
      }
    });
  }
};
