import express from 'express';
import {
  forgotPassword,
  getAuthenticatedUser,
  loginUser,
  registerUser,
  resendVerificationOtp,
  resetPassword,
  verifyOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getAuthenticatedUser);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
