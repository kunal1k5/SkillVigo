import express from 'express';
import {
  getUserProfile,
  getUserReviews,
  getUserSkills,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.get('/me/skills', protect, getUserSkills);
router.get('/me/reviews', protect, getUserReviews);
router.get('/:id', protect, getUserProfile);
router.get('/:id/skills', getUserSkills);
router.get('/:id/reviews', getUserReviews);
router.put('/:id', protect, updateUserProfile);

export default router;
