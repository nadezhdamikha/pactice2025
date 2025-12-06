// src/components/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Состояния формы
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Состояния для UI
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  
  // Состояние для видимости пароля
  const [showPassword, setShowPassword] = useState(false);
  
  // Валидация email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email обязателен для заполнения';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Введите корректный email адрес';
    }
    return '';
  };
  
  // Валидация пароля
  const validatePassword = (password) => {
    if (!password) {
      return 'Пароль обязателен для заполнения';
    }
    return '';
  };
  
  // Общая валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    // Валидация каждого поля
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку для этого поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Очищаем серверную ошибку при любом изменении
    if (serverError) {
      setServerError('');
    }
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Очищаем предыдущие сообщения
    setServerError('');
    
    // Валидация формы на клиенте
    if (!validateForm()) {
      // Прокручиваем к первой ошибке
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Подготовка данных для отправки
      const dataToSend = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      const response = await fetch('https://pets.сделай.site/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Успешный вход
        if (data.data && data.data.token) {
          // Создаем данные пользователя (как в верстке)
          const today = new Date();
          const registrationDate = today.toISOString().split('T')[0];
          
          const userData = {
            id: data.data.user?.id || 1,
            phone: "+79111234567", // Здесь можно получить с сервера
            email: formData.email,
            name: data.data.user?.name || "Пользователь",
            registrationDate: registrationDate,
            ordersCount: 0,
            petsCount: 0
          };
          
          // Сохраняем через AuthContext
          login(data.data.token, userData);
          
          // Немедленно перенаправляем на главную
          navigate('/');
          
        } else {
          setServerError('Ошибка при получении токена');
        }
        
      } else if (response.status === 422) {
        // Ошибки валидации
        const errorData = await response.json();
        
        if (errorData.error && errorData.error.errors) {
          // Преобразуем ошибки сервера в формат для отображения
          const serverErrors = {};
          Object.keys(errorData.error.errors).forEach(key => {
            if (errorData.error.errors[key] && errorData.error.errors[key][0]) {
              serverErrors[key] = errorData.error.errors[key][0];
            }
          });
          setErrors(serverErrors);
          
          // Показываем первую ошибку
          const firstError = Object.values(serverErrors)[0];
          if (firstError) {
            setServerError(firstError);
          }
        } else if (errorData.error?.message) {
          setServerError(errorData.error.message);
        } else {
          setServerError('Ошибка валидации данных');
        }
        
      } else if (response.status === 401) {
        // Неавторизован
        setServerError('Неверный email или пароль');
        
      } else {
        // Другие ошибки сервера
        setServerError(`Ошибка сервера: ${response.status}. Попробуйте позже.`);
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setServerError('Ошибка сети. Проверьте соединение с интернетом.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработчик для отображения примера заполнения
  const handleFillExample = () => {
    setFormData({
      email: 'user@user.ru',
      password: 'paSSword1'
    });
    
    // Очищаем ошибки
    setErrors({});
    setServerError('');
  };
  
  // Проверка, есть ли сохраненный email из регистрации
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);
  
  return (
    <div className="login-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Вход в систему</h2>
                
                {/* Общая ошибка сервера */}
                {serverError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {serverError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="user@user.ru"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.email}
                      </div>
                    )}
                  </div>
                  
                  {/* Пароль */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Пароль <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Введите пароль"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.password}
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопки */}
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Вход...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Войти
                        </>
                      )}
                    </button>
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Нет аккаунта? <a href="/register" className="text-decoration-none">Зарегистрируйтесь</a>
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