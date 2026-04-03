import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserByPhone, saveUser } from '../services/api';

const LOCAL_STORAGE_KEY = 'msms_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (err) {
        console.error('Invalid user data in localStorage', err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ phone, otp }) => {
    // OTP is mocked as 1234 for demo
    if (otp !== '1234') {
      throw new Error('Incorrect OTP. Use 1234 for demo.');
    }
    let account = await getUserByPhone(phone);
    if (!account) {
      throw new Error('User not found. Please register.');
    }
    setUser(account);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
    return account;
  };

  const register = async ({ name, phone, role, location }) => {
    const account = await saveUser({ name, phone, role, location });
    setUser(account);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(account));
    return account;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
