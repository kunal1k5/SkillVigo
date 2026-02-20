/**
 * Auth Routes - /api/auth/*
 * 
 * Public:
 * POST   /register        - Register new user
 * POST   /login           - Login user
 * POST   /verify          - Verify Firebase token
 * 
 * Protected:
 * POST   /logout          - Logout user
 * GET    /profile         - Get current user profile
 * POST   /refresh         - Refresh token
 * 
 * Middleware:
 * - verifyFirebaseToken (for protected routes)
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
// 
// const router = express.Router();
//
// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.post('/verify', verifyToken);
//
// router.post('/logout', verifyFirebaseToken, logoutUser);
// router.get('/profile', verifyFirebaseToken, getProfile);
//
// export default router;
