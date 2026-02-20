/**
 * User Routes - /api/users/*
 * 
 * GET    /:id             - Get user profile
 * GET    /:id/skills      - Get user's skills
 * GET    /:id/reviews     - Get user reviews
 * PUT    /:id             - Update profile (protected)
 * POST   /:id/avatar      - Upload avatar (protected)
 * 
 * Middleware:
 * - verifyFirebaseToken (for PUT, POST)
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
//
// const router = express.Router();
//
// router.get('/:id', getUserProfile);
// router.get('/:id/skills', getUserSkills);
// router.get('/:id/reviews', getUserReviews);
//
// router.put('/:id', verifyFirebaseToken, updateUserProfile);
// router.post('/:id/avatar', verifyFirebaseToken, uploadAvatar);
//
// export default router;
