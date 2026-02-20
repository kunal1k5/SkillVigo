/**
 * Booking Routes - /api/bookings/*
 * 
 * GET    /                - Get user's bookings (protected)
 * GET    /:id             - Get booking details (protected)
 * POST   /                - Create booking (protected)
 * PUT    /:id             - Update booking status (protected)
 * DELETE /:id             - Cancel booking (protected)
 * 
 * Middleware:
 * - verifyFirebaseToken (all routes)
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
//
// const router = express.Router();
// router.use(verifyFirebaseToken);
//
// router.get('/', getMyBookings);
// router.get('/:id', getBookingById);
// router.post('/', createBooking);
// router.put('/:id', updateBookingStatus);
// router.delete('/:id', cancelBooking);
//
// export default router;
