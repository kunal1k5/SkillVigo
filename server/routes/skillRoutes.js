import express from 'express';
import {
  createSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
} from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.post('/', protect, requireRole('provider', 'admin'), createSkill);
router.put('/:id', protect, requireRole('provider', 'admin'), updateSkill);
router.delete('/:id', protect, requireRole('provider', 'admin'), deleteSkill);

export default router;
