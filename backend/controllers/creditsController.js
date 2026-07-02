const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const CreditTransaction = require('../database/models/CreditTransaction');

const COSTS = {
  'post_job': 10,
  'unlock_profile': 1
};

exports.spendCredits = async (req, res, next) => {
  try {
    const { action, amount, reason } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const db = getSequelize();
    const transaction = await db.transaction();

    try {
      const user = await User.findByPk(userId, { lock: true, transaction });

      if (user.credits < amount) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Insufficient credits' });
      }

      const newBalance = user.credits - amount;
      await user.update({ credits: newBalance }, { transaction });

      await CreditTransaction.create({
        userId,
        type: 'spend',
        amount: -amount,
        reason: reason || action,
        balance: newBalance,
        metadata: { action }
      }, { transaction });

      await transaction.commit();

      res.json({
        message: 'Credits spent',
        creditsRemaining: newBalance
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.getCreditHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const transactions = await CreditTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json(transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      reason: t.reason,
      balance: t.balance,
      date: t.createdAt
    })));
  } catch (err) {
    next(err);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ balance: user.credits });
  } catch (err) {
    next(err);
  }
};
