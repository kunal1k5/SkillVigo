/**
 * Admin Routes - /api/admin/*
 * 
 * GET    /users           - List all users
 * PUT    /users/:id       - Update user role
 * GET    /skills          - List all skills
 * DELETE /skills/:id      - Remove skill
 * GET    /bookings        - List all bookings
 * POST   /reports         - Get analytics
 * 
 * Middleware:
 * - verifyFirebaseToken
 * - requireRole('admin')
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
// import { requireRole } from '../middleware/roleMiddleware.js';
//
// const router = express.Router();
// router.use(verifyFirebaseToken);
// router.use(requireRole('admin'));
//
// router.get('/users', getAllUsers);
// router.put('/users/:id', updateUserRole);
// router.get('/skills', getAllSkills);
// router.delete('/skills/:id', removeSkill);
// router.get('/bookings', getAllBookings);
// router.post('/reports', getAnalytics);
//
// export default router;
