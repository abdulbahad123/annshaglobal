import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await axiosClient.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const data = await axiosClient.post('/auth/login', { email, password });
    if (data.success && data.user) {
      if (data.token) {
        localStorage.setItem('annsha_token', data.token);
      }
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await axiosClient.post('/auth/register', userData);
    if (data.success && data.user) {
      if (data.token) {
        localStorage.setItem('annsha_token', data.token);
      }
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('annsha_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

