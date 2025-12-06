// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('userData');
    
    if (token && user) {
      setAuthToken(token);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Вход
  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setAuthToken(token);
    setCurrentUser(userData);
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Обновление профиля
  const updateProfile = (updatedUserData) => {
    const newUserData = { ...currentUser, ...updatedUserData };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setCurrentUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authToken,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!authToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};