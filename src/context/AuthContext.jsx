import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';
import { userService } from '../api/userService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      if (token) {
        try {
          const response = await userService.getMe();
          setUser(response.data); 
        } catch (error) {
          authService.logout(); 
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    fetchUserOnLoad();
  }, [token]); 

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setToken(data.token);

      const response = await userService.getMe();
      setUser(response.data); 

    } catch (error) {
      console.error('Failed to login', error);
      throw error; 
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null); 
  };

  const value = {
    token,
    user, 
    setUser, // <-- ADD THIS LINE
    isLoggedIn: !!user, 
    isLoading, 
    login,
    logout,
  };

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;