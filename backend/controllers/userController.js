const { getSequelize } = require('../database/init');
const User = require('../database/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, type = 'client', specialty, location } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initialCredits = type === 'professional' ? 20 : 5;

    const user = await User.create({
      name,
      email,
      passwordHash,
      type,
      specialty,
      location,
      credits: initialCredits,
      status: 'active'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        credits: user.credits
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Account blocked' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        credits: user.credits,
        verified: user.verified
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      credits: user.credits,
      specialty: user.specialty,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      verified: user.verified
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, specialty, bio, phone, location } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      name: name || user.name,
      specialty: specialty !== undefined ? specialty : user.specialty,
      bio: bio !== undefined ? bio : user.bio,
      phone: phone || user.phone,
      location: location || user.location
    });

    res.json({
      message: 'Profile updated',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        bio: user.bio,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCredits = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ credits: user.credits });
  } catch (err) {
    next(err);
  }
};
