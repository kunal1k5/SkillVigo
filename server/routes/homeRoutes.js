import express from 'express';
import {
  addHomePostComment,
  createHomePost,
  getHomeFeed,
  toggleHomePostLike,
} from '../controllers/homeController.js';
import { optionalProtect, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getHomeFeed);
router.post('/posts', protect, createHomePost);
router.post('/posts/:postId/like', protect, toggleHomePostLike);
router.post('/posts/:postId/comments', protect, addHomePostComment);

export default router;
