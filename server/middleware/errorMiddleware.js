/**
 * Middleware: Error Handler
 * 
 * Centralized error handling for all routes
 * 
 * Usage: Use in main server.js as last middleware
 */

// export const errorHandler = (err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal Server Error',
//   });
// };
