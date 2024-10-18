import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserRole } from '../services/api';
import { AuthContext } from './AuthContext';

export const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const response = await getUserRole();
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Failed to fetch user role:', error);
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

  return (
    <UserRoleContext.Provider value={{ userRole, loading }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => useContext(UserRoleContext);