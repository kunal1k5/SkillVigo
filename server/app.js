import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { isEmailConfigured } from './utils/email.js';
import { isSmsConfigured } from './utils/sms.js';
import { shouldExposeOtpInResponse } from './utils/verification.js';

// Netlify function bundling may not preserve import.meta.url reliably.
// Load env from process env first, then fall back to local server/.env when running locally.
dotenv.config();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
}

const app = express();
let initializationPromise = null;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillVigo backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

export async function initializeApp() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment');
      }

      await connectDB();

      if (!isEmailConfigured()) {
        console.warn('SMTP is not configured. Email OTPs and password reset emails will use dev fallback or fail in production.');
      }

      if (!isSmsConfigured()) {
        console.warn('Twilio SMS is not configured. Phone OTPs will use dev fallback or fail in production.');
      }

      if (shouldExposeOtpInResponse()) {
        console.warn('OTP_INCLUDE_IN_RESPONSE is enabled. OTP codes will be returned in API responses for development.');
      }

      return app;
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export default app;
