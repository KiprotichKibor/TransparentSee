import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserRole } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
    const [UserRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                try {
                    const response = await getUserRole();
                    setUserRole(response.data.role);
                } catch (err) {
                    console.error('Failed to fetch user role', err);
                    setUserRole('user');
                } finally {
                    setLoading(false);
                }
            } else {
                setUserRole(null);
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);

    const updateUserRole = (newRole) => {
        setUserRole(newRole);
    };

    return (
        <UserRoleContext.Provider value={{ UserRole, updateUserRole, loading }}>
            {children}
        </UserRoleContext.Provider>
    );
};