require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { Sequelize } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde.'
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// DATABASE CONNECTION
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true
  }
});

sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// MODELS
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
const models = require('./models');
models.init(sequelize);
models.associate();

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// SOCKET.IO SETUP
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
const ChatService = require('./services/ChatService');
const chatService = new ChatService(io);

io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined room`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = await chatService.saveMessage(data);
      io.to(`user_${data.recipientId}`).emit('receive_message', message);
      socket.emit('message_sent', { messageId: message.id, status: 'delivered' });
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  });

  socket.on('typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user_typing', {
      senderId: data.senderId,
      senderName: data.senderName
    });
  });

  socket.on('stop_typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user_stop_typing', {
      senderId: data.senderId
    });
  });

  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});

module.exports = { app, server, sequelize, io };
