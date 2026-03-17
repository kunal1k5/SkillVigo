import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeStyles from './components/layout/ThemeStyles';
import AuthProvider from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Main App Component
 * 
 * Flow:
 * └── AuthContext Provider
 *     └── AppRoutes
 *         ├── ProtectedRoutes (Auth Required)
 *         └── PublicRoutes
 */

export default function App() {
  return (
    <>
      <ThemeStyles />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}
