"use client";
import { useEffect, useState } from 'react';
import { User } from '../interfaces/user.interface';
import { login, register } from '../lib/auth';


export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await login(email, password);

      if (!userData) {
        setError('Invalid credentials');
        setUser(null);
        return false;
      }

      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(userData))}; path=/`;
      return true;
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const handleRegister = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const newUser = await register(userData);
      if (!newUser) {
        setError('Registration failed. Please try again.');
        return false;
      }

      setUser(null); 
      return true;
    } catch (err) {
      console.error('Error during registration:', err);
      setError('Registration failed. Please try again.');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('userData');
      document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
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
