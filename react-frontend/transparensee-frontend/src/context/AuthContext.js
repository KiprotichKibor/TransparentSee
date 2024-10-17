import React, { createContext, useState, useEffect } from 'react';
import { login, register, logout, getCurrentUser } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setLoading(false);
        };
        initAuth();
    }, []);

    const loginUser = async (credentials) => {
        const loggedInUser = await login(credentials);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const registerUser = async (userData) => {
        const registeredUser = await register(userData);
        setUser(registeredUser);
        return registeredUser;
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};