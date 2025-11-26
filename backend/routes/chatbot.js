const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chatbotController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// POST /api/chatbot/chat
router.post('/chat', 
  authenticateToken,
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  chatWithBot
);

module.exports = router;