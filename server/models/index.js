const User = require('./User');
const Professional = require('./Professional');
const Job = require('./Job');
const Rating = require('./Rating');
const Message = require('./Message');
const Credit = require('./Credit');
const UnlockedProfile = require('./UnlockedProfile');

const models = {
  User,
  Professional,
  Job,
  Rating,
  Message,
  Credit,
  UnlockedProfile,

  init(sequelize) {
    Object.values(models).forEach(model => {
      if (model.init) model.init(sequelize);
    });
  },

  associate() {
    models.User.hasMany(models.Professional, { foreignKey: 'userId', as: 'professional' });
    models.User.hasMany(models.Job, { foreignKey: 'userId', as: 'jobs' });
    models.User.hasMany(models.Rating, { foreignKey: 'fromUserId', as: 'ratingsGiven' });
    models.User.hasMany(models.Rating, { foreignKey: 'toUserId', as: 'ratingsReceived' });
    models.User.hasMany(models.Message, { foreignKey: 'senderId', as: 'messagesSent' });
    models.User.hasMany(models.Message, { foreignKey: 'recipientId', as: 'messagesReceived' });
    models.User.hasMany(models.Credit, { foreignKey: 'userId', as: 'creditHistory' });
    models.User.hasMany(models.UnlockedProfile, { foreignKey: 'userId', as: 'unlockedProfiles' });

    models.Professional.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    models.Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    models.Job.hasMany(models.Rating, { foreignKey: 'jobId', as: 'ratings' });
    models.Rating.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser' });
    models.Rating.belongsTo(models.User, { foreignKey: 'toUserId', as: 'toUser' });
    models.Rating.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    models.Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    models.Message.belongsTo(models.User, { foreignKey: 'recipientId', as: 'recipient' });
    models.Credit.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    models.UnlockedProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
};

module.exports = models;
