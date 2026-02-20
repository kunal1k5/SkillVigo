# Architecture & Setup Guide

## Project Structure

### Frontend (React + Vite)
- **src/firebase**: Firebase configuration and auth providers
- **src/context**: Global state management (AuthContext)
- **src/components**: Reusable UI components
  - common: Button, Input, Loader
  - layout: Navbar, Footer
  - skill: SkillCard, SkillForm
  - booking: BookingCard
  - chat: ChatBox
- **src/pages**: Full page components
- **src/services**: API service layer
- **src/hooks**: Custom React hooks
- **src/routes**: React Router configuration

### Backend (Node.js + Express)
- **config**: Database and external services setup
- **models**: Mongoose schemas
- **controllers**: Business logic for each resource
- **routes**: API route definitions
- **middleware**: Authentication, authorization, validation
- **sockets**: Real-time chat via Socket.io
- **utils**: Helper functions

### Database (MongoDB)
- User profiles and authentication
- Skill listings and metadata
- Bookings and transactions
- Reviews and ratings
- Messages and conversations

## Data Flow

### Authentication Flow
```
Client (Firebase Auth)
   ↓
Firebase ID Token
   ↓
Backend (Middleware: verifyFirebaseToken)
   ↓
User Record in MongoDB
   ↓
Return session data
```

### API Request Flow
```
React Component
   ↓
Service Layer (api.js)
   ↓
Axios Interceptor (Add Firebase Token)
   ↓
Express Route Handler
   ↓
Middleware (Auth, Role Check)
   ↓
Controller
   ↓
MongoDB Query
   ↓
Response
```

### Real-time Chat Flow
```
User A types message
   ↓
Socket.io event: 'send-message'
   ↓
Server receives & saves to MongoDB
   ↓
Socket.io broadcast to User B
   ↓
User B receives in real-time
```

## Integration Checklist

### 1. Frontend Setup
- [ ] Configure Firebase credentials (firebaseConfig.js)
- [ ] Set up Axios base URL and interceptors
- [ ] Create AuthContext provider
- [ ] Set up React Router with protected routes
- [ ] Create service modules for API calls

### 2. Backend Setup
- [ ] Configure MongoDB connection (db.js)
- [ ] Set up Firebase Admin SDK (firebaseAdmin.js)
- [ ] Implement verifyFirebaseToken middleware
- [ ] Create route handlers for all endpoints
- [ ] Set up Socket.io event handlers
- [ ] Implement error handling middleware

### 3. Database Setup
- [ ] Create MongoDB database
- [ ] Define all collections with indexes
- [ ] Set up relationships and references
- [ ] Create sample data for testing

### 4. Testing
- [ ] Test Firebase authentication flow
- [ ] Test API communication
- [ ] Test database operations
- [ ] Test real-time chat
- [ ] Test role-based access control

## Environment Configuration

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skill-ecosystem
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
SOCKET_URL=http://localhost:5000
```

### Client (.env.local)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Deployment Considerations

- Use MongoDB Atlas for cloud database
- Deploy frontend to Vercel/Netlify
- Deploy backend to Heroku/Railway/DigitalOcean
- Configure CORS for production URLs
- Set up HTTPS/SSL certificates
- Implement rate limiting
- Add database backups
- Monitor error logs and performance
