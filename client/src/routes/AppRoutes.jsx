import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import AdminPanel from '../pages/AdminPanel';
import BookingPage from '../pages/BookingPage';
import ChatPage from '../pages/ChatPage';
import CreateSkill from '../pages/CreateSkill';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import SearchPage from '../pages/SearchPage';

function NotFound() {
  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '8px' }}>404 - Page Not Found</h1>
      <p style={{ color: '#4b5563' }}>The page you are trying to open does not exist.</p>
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      
      {/* Moved temp routes out for viewing */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/bookings" element={<BookingPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<Profile />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['provider', 'admin']} />}>
        <Route path="/create-skill" element={<CreateSkill />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminPanel />} />
        <Route path="/admin/skills" element={<AdminPanel />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
