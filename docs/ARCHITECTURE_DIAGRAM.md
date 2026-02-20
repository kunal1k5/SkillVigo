## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SKILL ECOSYSTEM PLATFORM                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐                ┌──────────────────────┐  │
│  │   FRONTEND (CLIENT)  │                │  BACKEND (SERVER)    │  │
│  │   React + Vite       │                │  Node.js + Express   │  │
│  │                      │                │                      │  │
│  │ ┌────────────────┐   │    HTTP/REST   │ ┌────────────────┐  │  │
│  │ │ Auth Context   │   │◄──────────────►│ │ Auth Routes    │  │  │
│  │ │ (Firebase)     │◄──┤ Axios + JWT    │ │ + Middleware   │  │  │
│  │ └────────────────┘   │                │ └────────────────┘  │  │
│  │                      │                │                      │  │
│  │ ┌────────────────┐   │                │ ┌────────────────┐  │  │
│  │ │ Components     │   │                │ │ Controllers    │  │  │
│  │ │ + Pages        │◄──┤                │ │ (Business      │  │  │
│  │ └────────────────┘   │                │ │  Logic)        │  │  │
│  │                      │                │ └────────────────┘  │  │
│  │ ┌────────────────┐   │                │                      │  │
│  │ │ Services       │   │   /api/*       │ ┌────────────────┐  │  │
│  │ │ (API Calls)    │◄──┤   headers:     │ │ Routes Handlers│  │  │
│  │ └────────────────┘   │   auth token   │ └────────────────┘  │  │
│  │                      │                │                      │  │
│  │ ┌────────────────┐   │   Socket.io    │ ┌────────────────┐  │  │
│  │ │ Chat (Real-   │◄──┼──────────────►│ │ Socket Handler │  │  │
│  │ │  time)        │   │   Events       │ │ (Chat Events)  │  │  │
│  │ └────────────────┘   │                │ └────────────────┘  │  │
│  │                      │                │                      │  │
│  └──────────────────────┘                └──────────────────────┘  │
│           port: 5173                              port: 5000        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              │
                              ▼
          ┌────────────────────────────────────┐
          │   MONGODB DATABASE                 │
          ├────────────────────────────────────┤
          │                                    │
          │ Collections:                       │
          │ • Users                            │
          │ • Skills                           │
          │ • Bookings                         │
          │ • Reviews                          │
          │ • Messages                         │
          │                                    │
          └────────────────────────────────────┘

         ┌────────────────────────────────────┐
         │   FIREBASE                         │
         ├────────────────────────────────────┤
         │                                    │
         │ • Authentication                   │
         │ • ID Token Generation              │
         │ • User Verification                │
         │                                    │
         └────────────────────────────────────┘
```

## REQUEST-RESPONSE FLOW

### Skill Listing Request
```
USER ACTION (Search Skills)
         │
         ▼
React Component
         │
         ▼
skillService.getAllSkills()
         │
         ▼
Axios GET /api/skills
  ├─ Headers: Authorization: Bearer <firebase-token>
         │
         ▼
Backend verifyFirebaseToken Middleware
  ├─ Verify Firebase token in headers
  ├─ Extract user info
         │
         ▼
skillController.getAllSkills()
  ├─ Query MongoDB Skill collection
  ├─ Apply filters (category, price, rating)
  ├─ Return paginated results
         │
         ▼
generateResponse(200, 'Success', skills)
         │
         ▼
Response JSON to Frontend
         │
         ▼
React State Update
         │
         ▼
UI Re-render with Skills
```

### Authentication & Protected Routes

```
1. User Enters Credentials
         │
         ▼
2. Firebase Auth signInWithEmail()
         │
         ▼
3. Firebase Returns ID Token
         │
         ▼
4. Token Stored in React State/LocalStorage
         │
         ▼
5. API Requests Include Token in Header
   Authorization: Bearer <idToken>
         │
         ▼
6. Express Middleware verifyFirebaseToken
   ├─ Extract token from Authorization header
   ├─ Verify with Firebase Admin SDK
   ├─ If valid: Attach user to req object
   ├─ If invalid: Return 401 Unauthorized
         │
         ▼
7. If Protected Route + Valid Token → Process Request
         │
         ▼
8. Return Data from MongoDB
```

### Real-time Chat Flow

```
User A Types Message
         │
         ▼
ChatBox Component (React)
         │
         ▼
emit('send-message', { conversationId, text, recipientId })
         │
         ▼
Server Socket Event Handler
         │
         ▼
Save Message to MongoDB
         │
         ▼
Broadcast to Recipients via Socket.io
  ├─ emit('message-received', messageData)
         │
         ▼
User B Receives Update (Real-time)
         │
         ▼
ChatBox Component Updates + Re-render
```

## MIDDLEWARE FLOW

```
Express Request
         │
         ▼
CORS Middleware
  ├─ Check origin
         │
         ▼
JSON Parser
  ├─ Parse request body
         │
         ▼
verifyFirebaseToken Middleware (Protected Routes)
  ├─ Extract token from Authorization header
  ├─ Verify with Firebase
  ├─ Attach user to req.user
         │
         ▼
roleMiddleware (Admin/Instructor Routes)
  ├─ Check req.user.role
  ├─ If not authorized: return 403 Forbidden
         │
         ▼
Route Handler (Controller)
  ├─ Business logic
  ├─ Database operations
         │
         ▼
errorMiddleware (Catch-all)
  ├─ Handle errors
  ├─ Return standardized response
         │
         ▼
Response to Client
```

## DATABASE RELATIONSHIPS

```
                    ┌─────────────────┐
                    │      Users      │
                    │   (Profile,     │
                    │   Firebase UID) │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        (instructor)    (student)      (reviewer)
             │               │               │
             ▼               ▼               ▼
      ┌─────────────┐  ┌──────────┐  ┌──────────┐
      │   Skills    │  │ Bookings │  │ Reviews  │
      │ (created)   │  │          │  │          │
      └─────┬───────┘  └──┬───┬──┘  └──────────┘
            │             │   │
            │             │   └──────────┐
            │             │              │
            └─────────────┼──────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │   Messages   │
                  │   (Chat)     │
                  └──────────────┘
```

## COMPONENT HIERARCHY (Frontend)

```
App
├── AuthContext Provider
│   ├── AuthProvider
│   └── Auth Logic
│
└── AppRoutes
    ├── Public Routes
    │   ├── Home
    │   │   ├── Navbar
    │   │   ├── SkillCard (multiple)
    │   │   └── Footer
    │   ├── Login
    │   └── Register
    │
    ├── Protected Routes (Requires Auth)
    │   ├── Dashboard
    │   │   ├── Statistics
    │   │   └── Recent Activity
    │   ├── Search
    │   │   └── SkillCard (with filters)
    │   ├── Profile
    │   │   └── UserInfo + Skills
    │   ├── CreateSkill
    │   │   └── SkillForm
    │   ├── BookingPage
    │   │   ├── SkillDetails
    │   │   └── BookingForm
    │   ├── ChatPage
    │   │   ├── ConversationList
    │   │   └── ChatBox
    │   │
    │   └── Admin Routes (Role: admin)
    │       └── AdminPanel
    │           ├── UserManagement
    │           ├── SkillModeration
    │           └── Analytics
```

## API ENDPOINT SUMMARY

```
╔═════════════════════════════════════════════════════════════════════╗
║                    API ENDPOINTS OVERVIEW                          ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  AUTH (/api/auth)                                                   ║
║  ├─ POST   /register              → Register new user              ║
║  ├─ POST   /login                 → Login & get token              ║
║  ├─ POST   /logout                → Logout                         ║
║  └─ POST   /verify                → Verify token                   ║
║                                                                     ║
║  USERS (/api/users)                                                 ║
║  ├─ GET    /:id                   → Get profile                    ║
║  ├─ PUT    /:id                   → Update profile                 ║
║  ├─ POST   /:id/avatar            → Upload avatar                  ║
║  ├─ GET    /:id/skills            → List user's skills            ║
║  └─ GET    /:id/reviews           → Get user's reviews            ║
║                                                                     ║
║  SKILLS (/api/skills)                                               ║
║  ├─ GET    /                      → List all skills               ║
║  ├─ GET    /search                → Search skills                 ║
║  ├─ GET    /:id                   → Get skill details             ║
║  ├─ POST   /                      → Create (instructor)           ║
║  ├─ PUT    /:id                   → Update skill                  ║
║  └─ DELETE /:id                   → Delete skill                  ║
║                                                                     ║
║  BOOKINGS (/api/bookings) [Protected]                               ║
║  ├─ GET    /                      → List user's bookings          ║
║  ├─ GET    /:id                   → Get booking details           ║
║  ├─ POST   /                      → Create booking                ║
║  ├─ PUT    /:id                   → Update status                 ║
║  └─ DELETE /:id                   → Cancel booking                ║
║                                                                     ║
║  REVIEWS (/api/reviews)                                             ║
║  ├─ GET    /:skillId              → Get skill reviews             ║
║  ├─ POST   /                      → Create review                 ║
║  ├─ PUT    /:id                   → Update review                 ║
║  └─ DELETE /:id                   → Delete review                 ║
║                                                                     ║
║  CHAT (/api/chat) [Protected]                                       ║
║  ├─ GET    /conversations         → List conversations            ║
║  ├─ GET    /messages/:id          → Get messages                  ║
║  ├─ POST   /messages              → Send message                  ║
║  └─ POST   /mark-read             → Mark as read                  ║
║                                                                     ║
║  ADMIN (/api/admin) [Protected + Admin Only]                        ║
║  ├─ GET    /users                 → List all users                ║
║  ├─ PUT    /users/:id             → Update user role              ║
║  ├─ GET    /skills                → List all skills               ║
║  ├─ DELETE /skills/:id            → Remove skill                  ║
║  ├─ GET    /bookings              → List all bookings             ║
║  └─ POST   /reports               → Get analytics                 ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

## DEPLOYMENT ARCHITECTURE (Future Reference)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐           ┌──────────────────────┐  │
│  │  Vercel/Netlify      │           │  Railway/Heroku      │  │
│  │  (Frontend Hosting)  │           │  (Backend Hosting)   │  │
│  │                      │           │                      │  │
│  │  ✓ Vite Build        │           │  ✓ Node.js Server    │  │
│  │  ✓ Auto Deploy       │           │  ✓ Socket.io Ready   │  │
│  │  ✓ CDN               │           │  ✓ Env Variables     │  │
│  └──────────────────────┘           └──────────────────────┘  │
│           │                                    │               │
│           │          Domain/DNS              │               │
│           └──────────────┬───────────────────┘               │
│                          │                                   │
│                          ▼                                   │
│          ┌────────────────────────────────┐                │
│          │   MongoDB Atlas (Cloud DB)     │                │
│          │   ✓ Auto backups               │                │
│          │   ✓ Scalability                │                │
│          │   ✓ Security                   │                │
│          └────────────────────────────────┘                │
│                          │                                   │
│                          ▼                                   │
│          ┌────────────────────────────────┐                │
│          │   Firebase (Authentication)    │                │
│          │   ✓ Managed service            │                │
│          │   ✓ Auto scaling               │                │
│          │   ✓ Security rules             │                │
│          └────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
