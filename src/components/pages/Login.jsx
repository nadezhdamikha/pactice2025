// src/components/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ showNotification }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://pets.сделай.site/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Получаем данные пользователя (в реальном приложении нужно сделать запрос к профилю)
        // Пока используем email и имя если есть
        const userData = {
          email: formData.email,
          name: data.name || localStorage.getItem('userName') || formData.email.split('@')[0]
        };
        
        // Вызываем функцию логина из контекста
        login(userData, data.token || 'mock-token');
        
        showNotification('Вы успешно вошли в систему!', 'success');
        
        if (formData.remember) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Перенаправляем в личный кабинет
        navigate('/profile');
        
      } else if (response.status === 401) {
        showNotification('Неверный email или пароль', 'danger');
        setErrors({ email: 'Неверный email или пароль', password: 'Неверный email или пароль' });
      } else if (response.status === 422) {
        const errorData = await response.json();
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
                    <div className="form-text text-end">
                      <Link to="/forgot-password" className="text-decoration-none">
                        Забыли пароль?
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        className="form-check-input"
                        checked={formData.remember}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Запомнить меня
                      </label>
                    </div>
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
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleFillExample}
                      disabled={isLoading}
                    >
                      <i className="bi bi-lightning me-2"></i>
                      Заполнить пример
                    </button>
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Нет аккаунта? <Link to="/register" className="text-decoration-none">Зарегистрироваться</Link>
                      </small>
                    </div>
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