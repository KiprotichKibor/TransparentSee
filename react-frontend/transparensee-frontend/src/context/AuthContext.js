import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, register, logout } from '../services/auth';

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
        console.error('Failed to initialize authentication', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const { user, access } = await login(email, password);
      localStorage.setItem('access_token', access); // Store JWT in localStorage
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login failed', error);
      throw error; // Pass error back to caller
    }
  };

  const registerUser = async ({ email, username, first_name, last_name, password, confirm_password }) => {
    try {
      const { user, access } = await register(email, username, first_name, last_name, password, confirm_password);
      localStorage.setItem('access_token', access); // Store JWT in localStorage
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration failed', error);
      throw error; // Pass error back to caller
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      localStorage.removeItem('access_token'); // Clear token on logout
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};