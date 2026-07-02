const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Credits API' });
});

module.exports = router;
