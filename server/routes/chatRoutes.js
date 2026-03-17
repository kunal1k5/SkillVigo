import express from 'express';
import {
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);
router.post('/mark-read', markAsRead);

export default router;
