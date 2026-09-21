import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginStaff = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const loginCustomer = async (email, password) => {
    const { data } = await api.post('/customer-auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.customer));
    setUser(data.customer);
    return data;
  };

  const login = async (email, password, roleHint = 'staff') => {
    if (roleHint === 'customer') {
      return await loginCustomer(email, password);
    }
    return await loginStaff(email, password);
  };

  const registerCustomer = async (userData) => {
    const { data } = await api.post('/customer-auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.customer));
    setUser(data.customer);
    return data;
  };

  const updateCustomerUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isPharmacist = user?.role === 'pharmacist';
  const isCustomer = user?.role === 'customer';
  const isStaff = isAdmin || isPharmacist;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isPharmacist,
        isCustomer,
        isStaff,
        login,
        loginStaff,
        loginCustomer,
        registerCustomer,
        updateCustomerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
