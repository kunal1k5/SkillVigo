import { createContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  resendVerificationOtp as resendVerificationOtpRequest,
  registerUser,
  verifyOtp as verifyOtpRequest,
} from '../services/authService';
import { updateCurrentUserProfile } from '../services/userService';
import {
  AUTH_CLEARED_EVENT,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '../utils/authStorage';
import {
  clearPendingVerification as clearPendingVerificationStorage,
  getPendingVerification,
  setPendingVerification as setPendingVerificationStorage,
} from '../utils/pendingVerificationStorage';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [pendingVerification, setPendingVerificationState] = useState(getPendingVerification);

  const clearStoredPendingVerification = () => {
    clearPendingVerificationStorage();
    setPendingVerificationState(null);
  };

  const savePendingVerification = (response, options = {}) => {
    if (!response?.user && !response?.verification) {
      clearStoredPendingVerification();
      return null;
    }

    const previousValue = getPendingVerification() || pendingVerification || null;
    const nextValue = {
      message: options.message ?? response.message ?? previousValue?.message ?? '',
      redirectTo: options.redirectTo ?? previousValue?.redirectTo ?? '',
      source: options.source ?? previousValue?.source ?? '',
      user: response.user ?? previousValue?.user ?? null,
      verification: {
        email: {
          ...(previousValue?.verification?.email || {}),
          ...(response.verification?.email || {}),
        },
        phone: {
          ...(previousValue?.verification?.phone || {}),
          ...(response.verification?.phone || {}),
        },
        pendingChannels:
          response.verification?.pendingChannels ??
          previousValue?.verification?.pendingChannels ??
          [],
      },
    };

    setPendingVerificationStorage(nextValue);
    setPendingVerificationState(nextValue);
    return nextValue;
  };

  const applyAuthResponse = (response, options = {}) => {
    if (response?.verificationRequired || !response?.token) {
      clearAuthToken();
      setCurrentUser(null);
      savePendingVerification(response, options);
      return response;
    }

    setAuthToken(response.token);
    setCurrentUser(response.user);
    clearStoredPendingVerification();
    return response;
  };

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
      clearStoredPendingVerification();
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

  const login = async (credentials, options = {}) => {
    setAuthBusy(true);

    try {
      const response = await loginUser(credentials);
      return applyAuthResponse(response, options);
    } catch (error) {
      if (error.data?.verificationRequired) {
        clearAuthToken();
        setCurrentUser(null);
        savePendingVerification(error.data, options);
      }

      throw error;
    } finally {
      setAuthBusy(false);
    }
  };

  const register = async (payload, options = {}) => {
    setAuthBusy(true);

    try {
      const response = await registerUser(payload);
      return applyAuthResponse(response, options);
    } finally {
      setAuthBusy(false);
    }
  };

  const verifyOtp = async (payload) => {
    setAuthBusy(true);

    try {
      const response = await verifyOtpRequest(payload);
      return applyAuthResponse(response);
    } finally {
      setAuthBusy(false);
    }
  };

  const resendVerificationOtp = async (payload) => {
    setAuthBusy(true);

    try {
      const response = await resendVerificationOtpRequest(payload);
      savePendingVerification(response);
      return response;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setCurrentUser(null);
    clearStoredPendingVerification();
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
      pendingVerification,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      verifyOtp,
      resendVerificationOtp,
      logout,
      updateProfile,
      refreshSession: hydrateSession,
      savePendingVerification,
      clearPendingVerification: clearStoredPendingVerification,
    }),
    [authBusy, currentUser, loading, pendingVerification],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
