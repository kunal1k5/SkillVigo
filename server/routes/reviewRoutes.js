import express from 'express';
import {
  createReview,
  deleteReview,
  getSkillReviews,
  updateReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:skillId', getSkillReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
