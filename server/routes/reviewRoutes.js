/**
 * Review Routes - /api/reviews/*
 * 
 * GET    /:skillId        - Get reviews for skill
 * POST   /                - Create review (protected)
 * PUT    /:id             - Update review (protected)
 * DELETE /:id             - Delete review (protected)
 * 
 * Middleware:
 * - verifyFirebaseToken (for POST, PUT, DELETE)
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
//
// const router = express.Router();
//
// router.get('/:skillId', getSkillReviews);
//
// router.post('/', verifyFirebaseToken, createReview);
// router.put('/:id', verifyFirebaseToken, updateReview);
// router.delete('/:id', verifyFirebaseToken, deleteReview);
//
// export default router;
