import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

/**
 * Express Server Setup
 * 
 * Flow:
 * 1. Middleware (CORS, JSON parsing)
 * 2. Database Connection
 * 3. Authentication Middleware
 * 4. API Routes
 * 5. Socket.io Events
 * 6. Error Handling
 */

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (to be implemented)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/skills', skillRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/admin', adminRoutes);

// Socket.io Connection Handler (to be implemented)
io.on('connection', (socket) => {
  // Socket events for real-time chat
});

// Error Handling (to be implemented)

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
