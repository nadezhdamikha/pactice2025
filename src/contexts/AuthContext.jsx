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
    const userId = localStorage.getItem('userId');
    
    // ВАЖНО: только если есть токен - это авторизованный пользователь
    if (token && email) {
      setUser({
        email,
        token,
        name: name || email.split('@')[0],
        phone: phone || '',
        id: userId
      });
    } 
    // Если есть email но НЕТ токена - удаляем эти данные, они не нужны
    else if (email) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userId');
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    if (!token) {
      console.error('Пустой токен при входе');
      return;
    }
    
    // Сохраняем все данные
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', userData.email);
    
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
    } else {
      localStorage.setItem('userName', userData.email.split('@')[0]);
    }
    
    if (userData.phone) {
      localStorage.setItem('userPhone', userData.phone);
    }
    
    if (userData.id) {
      localStorage.setItem('userId', userData.id.toString());
    }
    
    setUser({
      email: userData.email,
      token,
      name: userData.name || userData.email.split('@')[0],
      phone: userData.phone || '',
      id: userData.id
    });
  };

  // Функция saveUserData УДАЛЕНА - теперь всегда создается аккаунт
  // const saveUserData = (userData) => { ... } // УБРАТЬ ЭТУ ФУНКЦИЮ

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const updateUser = (userData) => {
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
    }
    if (userData.phone) {
      localStorage.setItem('userPhone', userData.phone);
    }
    if (userData.email) {
      localStorage.setItem('userEmail', userData.email);
    }
    if (userData.id) {
      localStorage.setItem('userId', userData.id.toString());
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
    isAuthenticated: !!user && !!user.token, // Только с токеном!
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};