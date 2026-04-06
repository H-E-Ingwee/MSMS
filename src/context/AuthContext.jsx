import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load (persists across Vercel reloads)
  useEffect(() => {
    const storedUser = localStorage.getItem('msms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function handles both real API calls and the predefined Admin
  const login = async (phone, otp) => {
    // PREDEFINED ADMIN INTERCEPT
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone === '+254707897640' || cleanPhone === '0707897640' || cleanPhone === '707897640') {
      const adminUser = {
        id: 'admin_1',
        name: 'Joel Phineas',
        phone: '+254707897640',
        role: 'ADMIN',
        location: 'Meru',
        verified: true
      };
      setUser(adminUser);
      localStorage.setItem('msms_user', JSON.stringify(adminUser));
      localStorage.setItem('msms_token', 'secure_admin_token_mock'); // Mock token for Vercel
      return adminUser;
    }

    // Normal User Flow (Connect to your actual /api/auth/verify endpoint here)
    // For now, we mock a successful normal user login if they aren't the admin
    const normalUser = {
      id: Date.now().toString(),
      name: 'Demo Farmer',
      phone: phone,
      role: 'FARMER',
      location: 'Embu',
      verified: true
    };
    setUser(normalUser);
    localStorage.setItem('msms_user', JSON.stringify(normalUser));
    localStorage.setItem('msms_token', 'secure_user_token_mock');
    return normalUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('msms_user');
    localStorage.removeItem('msms_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);