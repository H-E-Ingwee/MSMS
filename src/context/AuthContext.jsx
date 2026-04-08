import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginWithOtp, registerUser, updateProfile as apiUpdateProfile, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('msms_auth');
      const token = localStorage.getItem('msms_token');

      if (stored && token) {
        try {
          const refreshed = await getCurrentUser();
          setUser(refreshed.user || refreshed);
          localStorage.setItem('msms_auth', JSON.stringify(refreshed.user || refreshed));
        } catch (err) {
          console.warn('Unable to refresh auth session, clearing stored data:', err);
          // Clear invalid tokens and user data
          localStorage.removeItem('msms_auth');
          localStorage.removeItem('msms_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async ({ phone, otp }) => {
    const response = await loginWithOtp(phone, otp);
    setUser(response.user);
    localStorage.setItem('msms_auth', JSON.stringify(response.user));
    return response.user;
  };

  const register = async ({ name, phone, role, location }) => {
    const response = await registerUser({ name, phone, role, location });
    setUser(response.user);
    localStorage.setItem('msms_auth', JSON.stringify(response.user));
    return response.user;
  };

  const updateProfile = async (updates) => {
    const response = await apiUpdateProfile(updates);
    const updatedUser = response.user || response;
    setUser(updatedUser);
    localStorage.setItem('msms_auth', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    apiLogout();
  };

  const value = useMemo(() => ({ user, loading, login, register, updateProfile, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}