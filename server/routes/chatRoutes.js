/**
 * Chat Routes - /api/chat/*
 * 
 * GET    /conversations   - Get user's conversations (protected)
 * GET    /messages/:id    - Get messages (protected)
 * POST   /messages        - Send message (protected, via Socket.io)
 * POST   /mark-read       - Mark as read (protected)
 * 
 * Real-time via Socket.io:
 * - connection
 * - join-conversation
 * - send-message
 * - message-received
 * - user-typing
 * 
 * Middleware:
 * - verifyFirebaseToken (all routes)
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
//
// const router = express.Router();
// router.use(verifyFirebaseToken);
//
// router.get('/conversations', getConversations);
// router.get('/messages/:id', getMessages);
// router.post('/messages', sendMessage);
// router.post('/mark-read', markAsRead);
//
// export default router;
