const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Get current user
router.get('/me', auth, userController.getCurrentUser);

// Update profile
router.put('/profile', auth, userController.updateProfile);

// Get user credits
router.get('/credits', auth, userController.getCredits);

module.exports = router;
