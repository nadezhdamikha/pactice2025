import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://pets.сделай.site';

const Login = ({ showNotification }) => {
  const navigate = useNavigate();
  const { login, logout } = useAuth(); // Добавляем logout для очистки

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Профиль пользователя:', data);
        
        // Обрабатываем разные форматы ответа
        let userInfo;
        if (data.id) {
          // Формат: { id, name, email, phone, ... }
          userInfo = data;
        } else if (data.data?.user?.[0]) {
          // Формат: { data: { user: [ {...} ] } }
          userInfo = data.data.user[0];
        } else if (data.data) {
          // Формат: { data: { id, name, ... } }
          userInfo = data.data;
        }
        
        return userInfo;
      }
      return null;
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // ВАЖНО: Если у пользователя уже есть данные без токена, очищаем их
      if (localStorage.getItem('userEmail') && !localStorage.getItem('authToken')) {
        logout(); // Очищаем старые данные
      }
      
      // 1. Логинимся
      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        }),
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        // Проверяем, есть ли токен
        if (!loginData.token && !loginData.data?.token) {
          showNotification('Ошибка: токен не получен от сервера', 'danger');
          setIsLoading(false);
          return;
        }
        
        const token = loginData.token || loginData.data?.token;
        
        // 2. Получаем полный профиль пользователя
        const userProfile = await fetchUserProfile(token);
        
        if (!userProfile) {
          showNotification('Не удалось загрузить профиль пользователя', 'warning');
          // Используем данные из логина как fallback
          const fallbackUserData = {
            email: formData.email,
            name: formData.email.split('@')[0],
            phone: '',
            id: loginData.id || loginData.data?.id || null
          };
          
          login(fallbackUserData, token);
        } else {
          // Используем данные из профиля
          const userData = {
            email: userProfile.email || formData.email,
            name: userProfile.name || formData.email.split('@')[0],
            phone: userProfile.phone || '',
            id: userProfile.id || loginData.id || loginData.data?.id
          };
          
          login(userData, token);
        }
        
        showNotification('Вы успешно вошли в систему!', 'success');
        
        if (formData.remember) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Перенаправляем в личный кабинет
        navigate('/profile');
        
      } else if (loginResponse.status === 401) {
        showNotification('Неверный email или пароль', 'danger');
        setErrors({ 
          email: 'Неверный email или пароль', 
          password: 'Неверный email или пароль' 
        });
      } else if (loginResponse.status === 422) {
        const errorData = await loginResponse.json();
        showNotification(errorData.message || 'Ошибка валидации', 'danger');
      } else {
        showNotification('Ошибка сервера. Попробуйте позже.', 'danger');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      showNotification('Ошибка сети. Проверьте соединение.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillExample = () => {
    setFormData({
      email: 'example@mail.ru',
      password: 'Password1',
      remember: false
    });
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Вход в аккаунт</h2>
                
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="example@mail.ru"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Пароль</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Введите ваш пароль"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}

                  </div>

                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Вход...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Войти
                        </>
                      )}
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;