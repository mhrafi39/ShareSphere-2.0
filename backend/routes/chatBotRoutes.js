const express = require('express');
const router = express.Router();
const chatBotController = require('../controllers/chatBotController');
// Optional: If you only want logged-in users to use the chatbot, you can import and add the protect middleware.
// const { protect } = require('../middleware/authMiddleware');

// Route for sending a message to the chatbot
router.post('/message', chatBotController.sendMessage);

module.exports = router;
