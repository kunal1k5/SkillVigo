# Skill Ecosystem Platform

A modern skill-sharing marketplace connecting learners and teachers in real-time.

## 🏗️ Architecture

```
skill-ecosystem/
├── client/           → React + Vite Frontend
├── server/           → Node.js + Express Backend
├── docs/             → API & Database Documentation
└── Configuration files
```

## ✅ Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Authentication**: Firebase Auth
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Image Upload**: Multer + Cloudinary (optional)

## 📋 Features

- User Authentication (Email, Google, Facebook)
- Skill Listings & Search
- Booking System
- Real-time Chat
- Reviews & Ratings
- Admin Panel
- Profile Management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- Firebase Project
- npm or yarn

### Setup

#### 1. Clone & Install

```bash
cd skill-ecosystem
npm install --prefix client
npm install --prefix server
```

#### 2. Configure Environment

- Create `server/.env` with MongoDB URI and Firebase credentials
- Create `client/.env.local` with Firebase config

#### 3. Run Locally

```bash
# Terminal 1: Frontend
cd client
npm run dev

# Terminal 2: Backend
cd server
npm run dev
```

## 📂 Project Structure

### Client (`/client`)
- **src/firebase**: Firebase configuration & auth providers
- **src/context**: Global state (Auth)
- **src/components**: UI components (layout, skills, booking, chat)
- **src/pages**: Page templates
- **src/services**: API calls via Axios
- **src/hooks**: Custom React hooks
- **src/routes**: React Router setup

### Server (`/server`)
- **config**: MongoDB & Firebase Admin setup
- **models**: Mongoose schemas
- **controllers**: Business logic
- **routes**: API endpoints
- **middleware**: Auth verification, role-based access
- **sockets**: Socket.io for real-time chat
- **utils**: Helper functions

## 🔐 Authentication Flow

```
User → Firebase Auth → ID Token → Backend Verification → MongoDB Session
```

1. **Client**: Login via Firebase
2. **Backend**: Verify Firebase token in headers
3. **Database**: Create/update user profile
4. **Response**: Return user data & JWT

## 🗄️ Database Schema

- **Users**: Profile, skills, ratings
- **Skills**: Listings with descriptions, pricing
- **Bookings**: Transactions & scheduling
- **Reviews**: Ratings & feedback
- **Messages**: Chat conversations

## 🔗 API Integration

All API calls flow through:
```
Frontend → Axios instance → Backend Express → MongoDB
```

Headers include Firebase token for verification.

## 📡 Real-time Features

Socket.io handles:
- Live chat messaging
- Notification updates
- Booking confirmations

## 📖 Documentation

See `/docs` folder for:
- API Reference
- Database Design
- Deployment Guide
- Contributing Guidelines

## 🎯 Next Steps

1. Configure Firebase credentials
2. Set up MongoDB connection
3. Implement authentication
4. Build API endpoints
5. Connect frontend services
6. Deploy to production

---

**Ready for scaling** with microservices architecture support.
