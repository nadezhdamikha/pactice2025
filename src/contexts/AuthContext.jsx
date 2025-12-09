// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную аутентификацию при загрузке
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const phone = localStorage.getItem('userPhone');
    
    if (token && email) {
      setUser({ 
        email, 
        token,
        name: name || email.split('@')[0], // Если имени нет, используем часть email
        phone: phone || ''
      });
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', userData.email);
    // Сохраняем имя, если оно есть и содержит только кириллицу
    if (userData.name && /^[А-Яа-яЁё\s-]+$/.test(userData.name)) {
      localStorage.setItem('userName', userData.name);
    } else {
      // Иначе используем часть email как имя
      localStorage.setItem('userName', userData.email.split('@')[0]);
    }
    localStorage.setItem('userPhone', userData.phone || '');
    
    setUser({ 
      email: userData.email, 
      token,
      name: userData.name && /^[А-Яа-яЁё\s-]+$/.test(userData.name) 
        ? userData.name 
        : userData.email.split('@')[0],
      phone: userData.phone || ''
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    setUser(null);
  };

  const updateUser = (userData) => {
    if (userData.name && /^[А-Яа-яЁё\s-]+$/.test(userData.name)) {
      localStorage.setItem('userName', userData.name);
    }
    if (userData.phone) {
      localStorage.setItem('userPhone', userData.phone);
    }
    if (userData.email) {
      localStorage.setItem('userEmail', userData.email);
    }
    
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};