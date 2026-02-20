/**
 * Middleware: Role-Based Access Control
 * 
 * Allowed roles: user, instructor, admin, moderator
 * 
 * Usage:
 * router.delete('/skills/:id', requireRole('instructor'), deleteSkill);
 */

// export const requireRole = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//     next();
//   };
// };
