import { createContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/authService';
import { updateCurrentUserProfile } from '../services/userService';
import {
  AUTH_CLEARED_EVENT,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../utils/authStorage';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  const hydrateSession = async () => {
    const token = getAuthToken();

    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await getCurrentUser();
      setCurrentUser(response.user);
      return response.user;
    } catch {
      clearAuthToken();
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateSession();

    const handleAuthCleared = () => {
      setCurrentUser(null);
      setLoading(false);
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);

    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    };
  }, []);

  const login = async (credentials) => {
    setAuthBusy(true);

    try {
      const response = await loginUser(credentials);
      setAuthToken(response.token);
      setCurrentUser(response.user);
      return response.user;
    } finally {
      setAuthBusy(false);
    }
  };

  const register = async (payload) => {
    setAuthBusy(true);

    try {
      const response = await registerUser(payload);
      setAuthToken(response.token);
      setCurrentUser(response.user);
      return response.user;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  const updateProfile = async (profileData) => {
    setAuthBusy(true);

    try {
      const nextUser = await updateCurrentUserProfile(profileData);
      setCurrentUser(nextUser);
      return nextUser;
    } finally {
      setAuthBusy(false);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      authBusy,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
      updateProfile,
      refreshSession: hydrateSession,
    }),
    [authBusy, currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
