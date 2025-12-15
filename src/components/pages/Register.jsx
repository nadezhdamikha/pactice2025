// src/components/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = ({ showNotification }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Состояния формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    confirm: 0
  });

  // Состояния для UI
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Валидация имени (кириллица, пробел, дефис)
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Имя обязательно для заполнения';
    }
    const nameRegex = /^[А-Яа-яЁё\s-]+$/;
    if (!nameRegex.test(name)) {
      return 'Имя должно содержать только кириллические буквы, пробелы и дефисы';
    }
    if (name.length < 2) {
      return 'Имя должно содержать минимум 2 символа';
    }
    return '';
  };

  // Валидация телефона (только цифры и +)
  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'Телефон обязателен для заполнения';
    }
    const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Телефон должен содержать только цифры и знак +';
    }
    
    // Убираем все нецифровые символы, кроме +
    const digits = phone.replace(/[^\d+]/g, '');
    if (digits.length < 10) {
      return 'Телефон должен содержать минимум 10 цифр';
    }
    return '';
  };

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
    if (password.length < 7) {
      return 'Пароль должен содержать минимум 7 символов';
    }
    if (!/[a-z]/.test(password)) {
      return 'Пароль должен содержать хотя бы одну строчную букву';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Пароль должен содержать хотя бы одну заглавную букву';
    }
    if (!/[0-9]/.test(password)) {
      return 'Пароль должен содержать хотя бы одну цифру';
    }
    return '';
  };

  // Валидация подтверждения пароля
  const validatePasswordConfirmation = (password, confirmation) => {
    if (!confirmation) {
      return 'Подтверждение пароля обязательно';
    }
    if (password !== confirmation) {
      return 'Пароли не совпадают';
    }
    return '';
  };

  // Общая валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    // Валидация каждого поля
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmationError = validatePasswordConfirmation(
      formData.password,
      formData.password_confirmation
    );
    if (confirmationError) newErrors.password_confirmation = confirmationError;
    
    // Валидация согласия
    if (formData.confirm !== 1) {
      newErrors.confirm = 'Необходимо согласие на обработку персональных данных';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    
    // Очищаем ошибку для этого поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Очищаем предыдущие сообщения
    setErrors({});
    
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        confirm: formData.confirm
      };
      
      const response = await fetch('https://pets.сделай.site/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (response.ok) {
        // Успешная регистрация - теперь логинимся автоматически
        showNotification('Регистрация прошла успешно! Выполняется вход...', 'success');
        
        // Пробуем войти с теми же данными
        const loginResponse = await fetch('https://pets.сделай.site/api/login', {
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
          
          // Вызываем функцию логина из контекста
          login({
            email: formData.email.trim(),
            name: formData.name.trim(),
            phone: formData.phone.trim()
          }, loginData.token || loginData.data?.token);
          
          showNotification('Вход выполнен успешно!', 'success');
          // Перенаправляем в личный кабинет
          navigate('/profile');
        } else {
          // Если не удалось войти автоматически
          showNotification('Регистрация прошла успешно! Пожалуйста, войдите в систему', 'success');
          navigate('/login');
        }
        
      } else if (response.status === 422) {
        // Ошибки валидации от сервера
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
            showNotification(firstError, 'danger');
          }
        } else {
          showNotification('Ошибка валидации данных', 'danger');
        }
      } else {
        // Другие ошибки сервера
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          const errorMsg = errorData.message || errorData.error || `Ошибка сервера: ${response.status}`;
          showNotification(errorMsg, 'danger');
        } catch {
          showNotification(`Ошибка сервера: ${response.status}`, 'danger');
        }
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      showNotification('Ошибка сети. Проверьте соединение с интернетом.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };



  // Проверка силы пароля
  const getPasswordStrength = (password) => {
    if (!password) return { text: '', class: '' };
    
    let score = 0;
    if (password.length >= 7) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    
    const strength = {
      0: { text: 'Очень слабый', class: 'bg-danger' },
      1: { text: 'Слабый', class: 'bg-danger' },
      2: { text: 'Средний', class: 'bg-warning' },
      3: { text: 'Хороший', class: 'bg-info' },
      4: { text: 'Надежный', class: 'bg-success' }
    };
    
    return strength[score] || strength[0];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="register-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Регистрация</h2>
                
                <form onSubmit={handleSubmit} noValidate>
                  {/* Имя */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Имя <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.name}
                      </div>
                    )}
                    <div className="form-text">
                      Только кириллические буквы, пробелы и дефисы
                    </div>
                  </div>
                  
                  {/* Телефон */}
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Телефон <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="+79161234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.phone}
                      </div>
                    )}
                    <div className="form-text">
                      Только цифры и знак +, минимум 10 цифр
                    </div>
                  </div>
                  
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
                      placeholder="example@mail.ru"
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
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Пароль <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Минимум 7 символов"
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
                    
                    {/* Индикатор силы пароля */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <small>Надежность пароля:</small>
                          <small className={`badge ${passwordStrength.class}`}>
                            {passwordStrength.text}
                          </small>
                        </div>
                        <div className="progress mt-1" style={{height: '5px'}}>
                          <div
                            className={`progress-bar ${passwordStrength.class}`}
                            style={{width: `${(passwordStrength.text === 'Надежный' ? 100 :
                                      passwordStrength.text === 'Хороший' ? 75 :
                                      passwordStrength.text === 'Средний' ? 50 :
                                      passwordStrength.text === 'Слабый' ? 25 : 0)}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="form-text">
                      Минимум 7 символов, 1 заглавная буква, 1 строчная буква, 1 цифра
                    </div>
                  </div>
                  
                  {/* Подтверждение пароля */}
                  <div className="mb-3">
                    <label htmlFor="password_confirmation" className="form-label">
                      Подтверждение пароля <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="password_confirmation"
                        name="password_confirmation"
                        className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                        placeholder="Повторите пароль"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.password_confirmation}
                      </div>
                    )}
                    {formData.password_confirmation && formData.password === formData.password_confirmation && (
                      <div className="valid-feedback d-block">
                        <i className="bi bi-check-circle me-1"></i>
                        Пароли совпадают
                      </div>
                    )}
                  </div>
                  
                  {/* Согласие на обработку данных */}
                  <div className="mb-4">
                    <div className={`form-check ${errors.confirm ? 'is-invalid' : ''}`}>
                      <input
                        type="checkbox"
                        id="confirm"
                        name="confirm"
                        className="form-check-input"
                        checked={formData.confirm === 1}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="confirm">
                        Я согласен на обработку персональных данных
                      </label>
                    </div>
                    {errors.confirm && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.confirm}
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
                          Регистрация...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Зарегистрироваться
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

export default Register;