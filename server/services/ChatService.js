const { Message } = require('../models');

class ChatService {
  constructor(io) {
    this.io = io;
  }

  async saveMessage(data) {
    try {
      const message = await Message.create({
        senderId: data.senderId,
        recipientId: data.recipientId,
        message: data.message,
        attachmentUrl: data.attachmentUrl || null
      });

      return {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        message: message.message,
        timestamp: message.createdAt,
        status: 'delivered'
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getChatHistory(userId1, userId2, limit = 50) {
    try {
      const messages = await Message.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { senderId: userId1, recipientId: userId2 },
            { senderId: userId2, recipientId: userId1 }
          ]
        },
        order: [['createdAt', 'ASC']],
        limit,
        include: [
          { association: 'sender', attributes: ['id', 'name'] },
          { association: 'recipient', attributes: ['id', 'name'] }
        ]
      });

      return messages;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async markAsRead(userId, conversationPartner) {
    try {
      await Message.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            senderId: conversationPartner,
            recipientId: userId,
            isRead: false
          }
        }
      );

      this.io.to(`user_${conversationPartner}`).emit('message_read', {
        from: userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async getConversations(userId) {
    try {
      const query = `
        SELECT DISTINCT
          CASE 
            WHEN m.sender_id = $1 THEN m.recipient_id
            ELSE m.sender_id
          END as conversation_with,
          u.name,
          u.email,
          m.message as last_message,
          m.created_at as last_message_time,
          COUNT(CASE WHEN m.recipient_id = $1 AND m.is_read = false THEN 1 END) as unread_count
        FROM messages m
        JOIN users u ON (
          (m.sender_id = $1 AND u.id = m.recipient_id) OR
          (m.recipient_id = $1 AND u.id = m.sender_id)
        )
        WHERE m.sender_id = $1 OR m.recipient_id = $1
        GROUP BY conversation_with, u.name, u.email, m.message, m.created_at
        ORDER BY m.created_at DESC
      `;

      const conversations = await require('../models').sequelize.query(query, {
        bind: [userId],
        type: 'SELECT'
      });

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
}

module.exports = ChatService;
