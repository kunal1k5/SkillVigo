import express from 'express';
import {
  createSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
  searchSkills,
  updateSkill,
} from '../controllers/skillController.js';
import { optionalProtect, protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getAllSkills);
router.get('/search', optionalProtect, searchSkills);
router.get('/:id', optionalProtect, getSkillById);
router.post('/', protect, requireRole('provider', 'admin'), createSkill);
router.put('/:id', protect, requireRole('provider', 'admin'), updateSkill);
router.delete('/:id', protect, requireRole('provider', 'admin'), deleteSkill);

export default router;
