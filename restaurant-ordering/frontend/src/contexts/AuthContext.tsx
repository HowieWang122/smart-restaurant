import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Set axios base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
axios.defaults.baseURL = API_URL;

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  heartValue?: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; statusCode?: number }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  updateHeartValue: (newHeartValue: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log(`Attempting login: ${username}`);
      
      // Ensure correct API path is used
      const response = await axios.post('/api/auth/login', { username, password });
      console.log('Login response:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      console.log('Login successful, user info:', userData);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide detailed error information
      const errorResponse = error.response;
      const statusCode = errorResponse?.status;
      const errorMessage = errorResponse?.data?.message;
      
      console.error(`Login failed: status code=${statusCode}, error message=${errorMessage}`);
      
      return { 
        success: false, 
        message: errorMessage || 'Login failed, please check username and password',
        statusCode
      };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { username, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, message: 'Registration successful' };
    } catch (error: any) {
      const errorResponse = error.response;
      const errorMessage = errorResponse?.data?.message;
      
      return { 
        success: false, 
        message: errorMessage || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateHeartValue = (newHeartValue: number) => {
    if (user) {
      setUser({ ...user, heartValue: newHeartValue });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateHeartValue }}>
      {children}
    </AuthContext.Provider>
  );
}; 