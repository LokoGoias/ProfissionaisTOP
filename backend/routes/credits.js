const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/creditsController');
const auth = require('../middleware/auth');

// Spend credits (post job, unlock profile, etc)
router.post('/spend', auth, creditsController.spendCredits);

// Get credit history
router.get('/history', auth, creditsController.getCreditHistory);

// Get credit balance
router.get('/balance', auth, creditsController.getBalance);

module.exports = router;
