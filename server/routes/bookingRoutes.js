import express from 'express';
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBookingStatus);
router.delete('/:id', cancelBooking);

export default router;
