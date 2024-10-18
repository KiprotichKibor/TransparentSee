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
          setUserRole('user'); // Default to 'user' role if fetch fails
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
    <UserRoleContext.Provider value={{ userRole, loading, updateUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

export const useIsAdmin = () => {
  const { userRole, loading } = useUserRole();
  return {
    isAdmin: userRole === 'admin',
    loading
  };
};

export const useIsModerator = () => {
  const { userRole, loading } = useUserRole();
  return {
    isModerator: userRole === 'moderator' || userRole === 'admin',
    loading
  };
};