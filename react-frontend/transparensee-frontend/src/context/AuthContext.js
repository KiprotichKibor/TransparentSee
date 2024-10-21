import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, refreshToken } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const data = await login(email, password);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login failed', error);
      throw error; // Pass error back to caller
    }
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const refreshUserToken = async () => {
    const refreshed = await refreshToken();
    if (!refreshed) {
      setUser(null);
    }
    return refreshed;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, refreshUserToken }}>
      {children}
    </AuthContext.Provider>
  );
};