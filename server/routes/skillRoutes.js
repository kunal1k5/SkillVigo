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
router.post('/', protect, requireRole('provider'), createSkill);
router.put('/:id', protect, requireRole('provider'), updateSkill);
router.delete('/:id', protect, requireRole('provider'), deleteSkill);

export default router;
