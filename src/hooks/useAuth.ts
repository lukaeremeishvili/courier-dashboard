import { useState, useEffect } from 'react';
import { login, logout, register, getCurrentUser } from '../lib/auth';
import { User } from '../interfaces/user.interface';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetchCurrentUser();
      } else {
        setLoading(false); 
        setUser(null);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch current user. Please try again.');
        setUser(null); 
      } finally {
        setLoading(false); 
      }
    };

    checkSession(); 
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      } else {
        setError('Invalid credentials. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const handleRegister = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const registeredUser = await register(userData);
      if (registeredUser) {
        setUser(registeredUser);
        return true;
      } else {
        setError('Registration failed. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Registration failed. Please try again.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem('authToken');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Error logging out. Please try again.');
    }
  };

  return {
    user,
    handleLogin,
    handleRegister,
    handleLogout,
    loading,
    error, 
  };
};
