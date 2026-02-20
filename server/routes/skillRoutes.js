/**
 * Skill Routes - /api/skills/*
 * 
 * GET    /                - List all skills
 * GET    /search          - Search skills
 * GET    /:id             - Get skill details
 * POST   /                - Create skill (protected, instructor)
 * PUT    /:id             - Update skill (protected)
 * DELETE /:id             - Delete skill (protected)
 * 
 * Middleware:
 * - verifyFirebaseToken
 * - requireRole('instructor')
 */

// import express from 'express';
// import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
// import { requireRole } from '../middleware/roleMiddleware.js';
//
// const router = express.Router();
//
// router.get('/', getAllSkills);
// router.get('/search', searchSkills);
// router.get('/:id', getSkillById);
//
// router.post('/', verifyFirebaseToken, requireRole('instructor'), createSkill);
// router.put('/:id', verifyFirebaseToken, updateSkill);
// router.delete('/:id', verifyFirebaseToken, deleteSkill);
//
// export default router;
