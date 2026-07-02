const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { Message, User } = require('../models');

/**
 * GET /api/messages/conversations
 */
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const conversations = await Message.findAll({
      attributes: [
        [require('sequelize').fn('DISTINCT', require('sequelize').col('senderId')), 'userId'],
        [require('sequelize').col('sender.name'), 'name'],
        [require('sequelize').col('sender.email'), 'email']
      ],
      where: { recipientId: req.user.id },
      include: [{ model: User, as: 'sender', attributes: [] }],
      order: [['createdAt', 'DESC']],
      subQuery: false,
      raw: true
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/chat/:userId
 */
router.get('/chat/:userId', requireAuth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { senderId: req.user.id, recipientId: parseInt(req.params.userId) },
          { senderId: parseInt(req.params.userId), recipientId: req.user.id }
        ]
      },
      order: [['createdAt', 'ASC']],
      limit: 100,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/messages/read/:conversationUserId
 */
router.put('/read/:conversationUserId', requireAuth, async (req, res) => {
  try {
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: parseInt(req.params.conversationUserId),
          recipientId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/unread
 */
router.get('/unread', requireAuth, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        recipientId: req.user.id,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
