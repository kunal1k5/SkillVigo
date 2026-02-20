# Frontend-Backend-Database Integration Guide

## 1. ENVIRONMENT SETUP

### Backend (.env)
```bash
# Copy .env.example to .env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skill-ecosystem

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

JWT_SECRET=your-random-jwt-secret-key
CLIENT_URL=http://localhost:5173
SOCKET_URL=http://localhost:5000
```

### Frontend (.env.local)
```bash
# Copy .env.example to .env.local
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 2. FIREBASE SETUP

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name
4. Enable Google Analytics (optional)
5. Create project

### 2.2 Setup Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - Email/Password
   - Google
   - Facebook (optional)

### 2.3 Get Credentials

#### Frontend Credentials
1. Go to **Project Settings** → **Your apps**
2. Select Web app
3. Copy Firebase Config:
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

#### Backend Credentials (Firebase Admin SDK)
1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate New Private Key"
3. Save as JSON file
4. Extract values for .env:
   - FIREBASE_PROJECT_ID
   - FIREBASE_PRIVATE_KEY (from private_key field)
   - FIREBASE_CLIENT_EMAIL (from client_email field)

## 3. MONGODB SETUP

### 3.1 Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# Test connection
mongo mongodb://localhost:27017
```

### 3.2 MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account
3. Create cluster (Free tier available)
4. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/skill-ecosystem
   ```
5. Update MONGODB_URI in .env

## 4. DATABASE INITIALIZATION

### Create Collections with Indexes
```javascript
// Run this in MongoDB shell or use MongoDB Compass

// Users Collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["uid", "email"],
      properties: {
        uid: { bsonType: "string" },
        email: { bsonType: "string" },
        displayName: { bsonType: "string" },
        role: { enum: ["user", "instructor", "admin"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ uid: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Skills Collection
db.createCollection("skills");
db.skills.createIndex({ instructor: 1 });
db.skills.createIndex({ category: 1 });
db.skills.createIndex({ isActive: 1 });

// Bookings Collection
db.createCollection("bookings");
db.bookings.createIndex({ student: 1 });
db.bookings.createIndex({ instructor: 1 });
db.bookings.createIndex({ status: 1 });

// Reviews Collection
db.createCollection("reviews");
db.reviews.createIndex({ reviewee: 1 });
db.reviews.createIndex({ skill: 1 });

// Messages Collection
db.createCollection("messages");
db.messages.createIndex({ conversationId: 1 });
db.messages.createIndex({ createdAt: 1 });
```

## 5. BACKEND IMPLEMENTATION

### 5.1 Install Dependencies
```bash
cd server
npm install
```

### 5.2 Connect MongoDB (server/config/db.js)
- Import mongoose
- Connect to MONGODB_URI
- Handle connection events

### 5.3 Initialize Firebase Admin (server/config/firebaseAdmin.js)
- Import firebase-admin
- Initialize with credentials
- Export adminAuth for token verification

### 5.4 Implement Middleware (server/middleware/)
- verifyFirebaseToken: Validate Firebase token
- roleMiddleware: Check user role
- errorMiddleware: Centralized error handling
- uploadMiddleware: Handle file uploads

### 5.5 Create Models (server/models/)
- User model with schema
- Skill model with references
- Booking model with relationships
- Review model
- Message model

### 5.6 Implement Controllers (server/controllers/)
- authController: Handle auth logic
- userController: User CRUD
- skillController: Skill listings
- bookingController: Booking operations
- reviewController: Review management
- chatController: Message handling
- adminController: Admin operations

### 5.7 Setup Routes (server/routes/)
- Define all endpoints
- Apply middleware
- Connect to controllers

### 5.8 Configure Socket.io (server/sockets/)
- Handle connection events
- Implement chat events
- Broadcast messages to clients

### 5.9 Start Server
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

## 6. FRONTEND IMPLEMENTATION

### 6.1 Install Dependencies
```bash
cd client
npm install
```

### 6.2 Configure Firebase (src/firebase/firebaseConfig.js)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Add config from Firebase Console
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 6.3 Setup Auth Providers (src/firebase/authProviders.js)
- Email/password authentication
- Google sign-in
- Facebook sign-in
- Sign-out logic

### 6.4 Create Auth Context (src/context/AuthContext.jsx)
- Manage global auth state
- Provide login/logout/register
- Handle token refresh
- Expose currentUser

### 6.5 Setup API Interceptor (src/services/api.js)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add Firebase token to requests
api.interceptors.request.use(async (config) => {
  const token = await currentUser.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 6.6 Create Service Modules
- skillService: Fetch/create/update skills
- bookingService: Manage bookings
- userService: User profile operations
- chatService: Messaging operations

### 6.7 Setup React Router (src/routes/AppRoutes.jsx)
- Public routes (Home, Login, Register)
- Protected routes (Dashboard, Profile, etc.)
- Admin routes (AdminPanel)
- 404 Not Found

### 6.8 Create Components
- Common: Button, Input, Loader
- Layout: Navbar, Footer
- Skill: SkillCard, SkillForm
- Booking: BookingCard
- Chat: ChatBox

### 6.9 Setup Socket.io (for real-time chat)
```javascript
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('message-received', (data) => {
  // Handle incoming message
});
```

### 6.10 Start Development Server
```bash
npm run dev  # Runs on http://localhost:5173
```

## 7. TESTING CONNECTION

### 7.1 Test Authentication
1. Go to login page
2. Create account with email/password or social login
3. Check Firebase Console → Users (new user should appear)
4. Check MongoDB → Users collection (user record should be created)

### 7.2 Test API Endpoints
1. Create a skill:
   - Navigate to CreateSkill page
   - Fill form and submit
   - Check MongoDB Skill collection
   - Verify skill appears in search

2. Create a booking:
   - Browse skills
   - Click Book
   - Confirm booking
   - Check MongoDB Booking collection

3. Test Chat:
   - Two browsers, two users
   - Send messages
   - Verify messages appear in real-time
   - Check MongoDB Messages collection

### 7.3 Test Admin Functions
1. Login as admin
2. Access /admin panel
3. Test user/skill management
4. Verify operations reflected in database

## 8. COMMON INTEGRATION ISSUES & SOLUTIONS

### Issue: CORS Error
**Solution:**
```javascript
// server.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```

### Issue: Firebase Token Not Verified
**Solution:**
- Ensure Firebase Admin SDK is initialized
- Check FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY
- Verify token format in Authorization header

### Issue: MongoDB Connection Failed
**Solution:**
- Check MONGODB_URI format
- Verify MongoDB service is running
- Check network access (if MongoDB Atlas)

### Issue: Socket.io Not Connecting
**Solution:**
- Ensure Socket.io server is running
- Check VITE_SOCKET_URL configuration
- Verify CORS settings in Socket.io

## 9. DEPLOYMENT CHECKLIST

- [ ] All environment variables set
- [ ] Firebase project created and configured
- [ ] MongoDB database created with collections
- [ ] Backend running without errors
- [ ] Frontend builds successfully
- [ ] All API endpoints tested
- [ ] Socket.io working for real-time chat
- [ ] Authentication flow working
- [ ] Database operations verified
- [ ] File uploads working (if implemented)
- [ ] Error handling functional
- [ ] Security middleware active

## 10. NEXT STEPS FOR DEVELOPMENT

1. **Implement Components** - Create UI components with data binding
2. **Add Validation** - Form validation and API response handling
3. **Error Handling** - Comprehensive error management
4. **Testing** - Unit and integration tests
5. **Styling** - UI design and responsive layout
6. **Performance** - Optimization and caching
7. **Security** - Rate limiting, input sanitization
8. **Monitoring** - Error tracking and analytics
9. **Deployment** - CI/CD pipeline setup
10. **Scaling** - Database optimization, microservices prep
