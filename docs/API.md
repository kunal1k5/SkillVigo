# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All authenticated endpoints require Firebase ID token in header:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints Overview

### Auth Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/verify` - Verify Firebase token

### User Routes (`/users`)
- `GET /users/:id` - Get user profile
- `GET /users/:id/skills` - Get user's skills
- `PUT /users/:id` - Update profile
- `POST /users/:id/avatar` - Upload avatar
- `GET /users/:id/reviews` - Get user reviews

### Skill Routes (`/skills`)
- `GET /skills` - List all skills
- `GET /skills/:id` - Get skill details
- `POST /skills` - Create skill (instructor only)
- `PUT /skills/:id` - Update skill
- `DELETE /skills/:id` - Delete skill
- `GET /skills/search?query=` - Search skills

### Booking Routes (`/bookings`)
- `GET /bookings` - List user's bookings
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking status
- `DELETE /bookings/:id` - Cancel booking

### Review Routes (`/reviews`)
- `GET /reviews/:skillId` - Get skill reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Chat Routes (`/chat`)
- `GET /chat/conversations` - List conversations
- `GET /chat/messages/:conversationId` - Get messages
- `POST /chat/messages` - Send message
- `POST /chat/mark-read` - Mark as read

### Admin Routes (`/admin`)
- `GET /admin/users` - List all users
- `GET /admin/skills` - List all skills
- `GET /admin/bookings` - List all bookings
- `PUT /admin/users/:id` - Update user role
- `DELETE /admin/skills/:id` - Remove skill
- `POST /admin/reports` - Get analytics

## Response Format
```json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "timestamp": "2024-02-20T10:00:00Z"
}
```

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Socket.io Events

### Client → Server
- `join-conversation` - Join chat room
- `send-message` - Send message
- `user-typing` - Indicate typing
- `leave-conversation` - Leave chat room

### Server → Client
- `message-received` - New message
- `user-typing-indicator` - User is typing
- `notification` - Real-time notification
