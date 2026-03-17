# SkillVigo

SkillVigo is a MERN-style skill marketplace app with custom JWT authentication.

## Stack

- Frontend: React + Vite + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: bcrypt password hashing + JWT
- Real-time: Socket.IO

## Auth Flow

- Users register and login through `/api/auth/register` and `/api/auth/login`
- Passwords are hashed with bcrypt before storage
- JWT tokens expire in 7 days
- The client stores the JWT in `localStorage`
- Protected API calls send `Authorization: Bearer <token>`
- Role-based access is enforced for `seeker`, `provider`, and `admin`

## Backend Setup

Create [server/.env](f:/SkillVigo/server/.env) from [server/.env.example](f:/SkillVigo/server/.env.example):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/skillvigo
JWT_SECRET=replace-this-with-a-long-random-secret
```

Install and run:

```bash
cd server
npm install
npm run dev
```

## Frontend Setup

Create [client/.env](f:/SkillVigo/client/.env) from [client/.env.example](f:/SkillVigo/client/.env.example):

```env
VITE_API_URL=/api
```

Install and run:

```bash
cd client
npm install
npm run dev
```

## Demo Login

- Email: `demo@skillvigo.com`
- Password: `Demo@123456`

The server bootstraps this demo user so the seeded marketplace, booking, and chat flows keep working.

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/skills`
- `POST /api/skills`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/chat/conversations`
- `POST /api/reviews`
- `GET /api/admin/users`

## Notes

- Legacy third-party auth code has been fully removed from the runtime codebase
- Protected routes now rely on JWT middleware
- Existing skill, booking, chat, review, and admin flows now use the authenticated Mongo user
