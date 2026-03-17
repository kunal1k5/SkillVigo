import express from 'express';
import {
  getAllBookings,
  getAllSkills,
  getAllUsers,
  getAnalytics,
  removeSkill,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.get('/skills', getAllSkills);
router.delete('/skills/:id', removeSkill);
router.get('/bookings', getAllBookings);
router.post('/reports', getAnalytics);

export default router;
