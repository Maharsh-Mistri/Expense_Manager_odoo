import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      if (data.role === 'Admin') {
        navigate('/user-management');
      } else if (data.role === 'Manager') {
        navigate('/pending-approvals');
      } else {
        navigate('/submit-expense');
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password, country) => {
    try {
      const data = await authService.signup(name, email, password, country);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      navigate('/user-management');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
