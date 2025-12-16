import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://pets.сделай.site';
const API_PETS_URL = `${API_BASE_URL}/api/pets`;
const API_REGISTER_URL = `${API_BASE_URL}/api/register`;
const API_LOGIN_URL = `${API_BASE_URL}/api/login`;

function AddPet({ showNotification }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false
  });
  const [agreement, setAgreement] = useState(false);
  const [register, setRegister] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    kind: '',
    district: '',
    mark: '',
    description: '',
    photo1: null,
    photo2: null,
    photo3: null,
    confirm: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const cleanName = user.name ? user.name.replace(/[^А-Яа-яЁё\s-]/g, '') : '';
      
      setFormData(prev => ({
        ...prev,
        name: cleanName || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
      
      setRegister(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (password) {
      const newRequirements = {
        length: password.length >= 7,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        digit: /\d/.test(password)
      };
      setPasswordRequirements(newRequirements);
    }
  }, [password]);

  const validateName = (name, isAutoFilled = false) => {
    if (!name.trim()) return false;
    if (isAutoFilled) return true;
    return /^[А-Яа-яЁё\s-]+$/.test(name);
  };

  const validatePhone = (phone) => /^\+?[0-9\s\-()]+$/.test(phone);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/.test(pwd);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, photoNumber) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.png')) {
        setErrors(prev => ({
          ...prev,
          [`photo${photoNumber}`]: 'Фото должно быть в формате PNG'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [`photo${photoNumber}`]: file
      }));
      
      if (errors[`photo${photoNumber}`]) {
        setErrors(prev => ({ ...prev, [`photo${photoNumber}`]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше имя';
    } else if (!validateName(formData.name, isAuthenticated)) {
      if (isAuthenticated) {
        newErrors.name = 'Имя содержит некириллические символы. Рекомендуется исправить.';
      } else {
        newErrors.name = 'Имя должно содержать только кириллицу, пробелы и дефисы';
      }
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Введите номер телефона';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Телефон должен содержать только цифры и знак +';
    
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    else if (!validateEmail(formData.email)) newErrors.email = 'Введите корректный email адрес';
    
    if (!formData.kind.trim()) newErrors.kind = 'Введите вид животного';
    
    if (!formData.district) newErrors.district = 'Выберите район';
    
    if (!formData.description.trim()) newErrors.description = 'Введите описание';
    else if (formData.description.length < 10 || formData.description.length > 1000) {
      newErrors.description = 'Описание должно содержать от 10 до 1000 символов';
    }
    
    if (!formData.photo1) newErrors.photo1 = 'Загрузите основное фото';
    
    if (formData.mark.trim() && !/^[A-Za-z0-9-]+$/.test(formData.mark)) {
      newErrors.mark = 'Номер чипа может содержать только латинские буквы, цифры и дефисы';
    }
    
    if (register) {
      if (!password) {
        newErrors.password = 'Введите пароль';
      } else if (!validatePassword(password)) {
        newErrors.password = 'Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву';
      }
      
      if (!passwordConfirmation) {
        newErrors.password_confirmation = 'Подтвердите пароль';
      } else if (password !== passwordConfirmation) {
        newErrors.password_confirmation = 'Пароли не совпадают';
      }
    }
    
    if (!agreement) newErrors.confirm = 'Необходимо согласие на обработку персональных данных';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password_confirmation,
          confirm: 1
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        // Извлекаем детальные ошибки валидации
        let errorMessage = 'Ошибка регистрации';
        
        if (responseData.error?.errors) {
          const serverErrors = responseData.error.errors;
          // Берем первую ошибку из всех полей
          for (const field in serverErrors) {
            if (serverErrors[field] && serverErrors[field][0]) {
              errorMessage = serverErrors[field][0];
              break;
            }
          }
        } else if (responseData.error?.message) {
          errorMessage = responseData.error.message;
        }
        
        return {
          success: false,
          error: errorMessage,
          errors: responseData.error?.errors || {}
        };
      }
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      return { success: false, error: 'Сетевая ошибка' };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          token: data.token || data.data?.token,
          userData: data.data || data
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || 'Ошибка входа'
        };
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return { success: false, error: 'Сетевая ошибка' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      showNotification('Пожалуйста, исправьте ошибки в форме', 'danger');
      setIsSubmitting(false);
      return;
    }
    
    try {
      let userToken = null;
      let isNewRegistration = false;
      
      if (register) {
        if (!isAuthenticated) {
          const registrationResult = await registerUser({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            password: password,
            password_confirmation: passwordConfirmation
          });
          
          if (!registrationResult.success) {
            // Если email уже занят, пробуем войти
            if (registrationResult.error.includes('email has already been taken') || 
                registrationResult.error.includes('email уже занят')) {
              
              const loginResult = await loginUser(formData.email, password);
              
              if (loginResult.success) {
                userToken = loginResult.token;
                login({
                  email: formData.email,
                  name: formData.name,
                  phone: formData.phone,
                  id: loginResult.userData?.id
                }, userToken);
              } else {
                showNotification('Аккаунт с этим email уже существует. Введите правильный пароль.', 'danger');
                setErrors({ password: 'Введите правильный пароль для этого аккаунта' });
                setIsSubmitting(false);
                return;
              }
            } else {
              showNotification(`Ошибка регистрации: ${registrationResult.error}`, 'danger');
              setIsSubmitting(false);
              return;
            }
          } else {
            const loginResult = await loginUser(formData.email, password);
            
            if (loginResult.success) {
              userToken = loginResult.token;
              login({
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                id: loginResult.userData?.id
              }, userToken);
              
              isNewRegistration = true;
            } else {
              showNotification(`Регистрация прошла, но вход не удался: ${loginResult.error}`, 'warning');
              setIsSubmitting(false);
              return;
            }
          }
        } else {
          const loginResult = await loginUser(formData.email, password);
          
          if (loginResult.success) {
            userToken = user.token;
          } else {
            showNotification('Неверный пароль', 'danger');
            setErrors({ password: 'Неверный пароль' });
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('kind', formData.kind);
      submitData.append('district', formData.district);
      submitData.append('mark', formData.mark || '');
      submitData.append('description', formData.description);
      submitData.append('confirm', agreement ? 1 : 0);
      submitData.append('register', register ? 1 : 0);
      
      if (formData.photo1) submitData.append('photo1', formData.photo1);
      if (formData.photo2) submitData.append('photo2', formData.photo2);
      if (formData.photo3) submitData.append('photo3', formData.photo3);
      
      if (register) {
        submitData.append('password', password);
        submitData.append('password_confirmation', passwordConfirmation || password);
      }
      
      const headers = {};
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }
      
      const response = await fetch(API_PETS_URL, {
        method: 'POST',
        headers: headers,
        body: submitData,
      });
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        showNotification('Сервер вернул некорректный ответ', 'danger');
        setIsSubmitting(false);
        return;
      }
      
      if (response.ok) {
        let petId = null;
        
        if (data.data && data.data.status === 'ok' && data.data.id) {
          petId = data.data.id;
        } else if (data.status === 'ok' && data.id) {
          petId = data.id;
        } else if (data.data && data.data.id) {
          petId = data.data.id;
        } else if (data.id) {
          petId = data.id;
        }
        
        if (petId) {
          if (register) {
            if (isNewRegistration) {
              showNotification('Аккаунт создан и объявление успешно добавлено!', 'success');
            } else {
              showNotification('Объявление успешно добавлено и привязано к вашему аккаунту!', 'success');
            }
            
            navigate(`/profile`);
          } else {
            showNotification('Анонимное объявление успешно добавлено!', 'success');
            navigate('/');
          }
        } else {
          showNotification('Объявление успешно добавлено!', 'success');
          navigate('/');
        }
        
      } else {
        if (response.status === 422 && data.error?.errors) {
          const serverErrors = data.error.errors;
          const formattedErrors = {};
          
          Object.keys(serverErrors).forEach(key => {
            if (Array.isArray(serverErrors[key])) {
              formattedErrors[key] = serverErrors[key].join(', ');
            } else {
              formattedErrors[key] = serverErrors[key];
            }
          });
          
          setErrors(formattedErrors);
          showNotification('Ошибка валидации: проверьте введенные данные', 'danger');
        } else {
          const errorMsg = data.error?.message || data.message || `Ошибка сервера: ${response.status}`;
          showNotification(errorMsg, 'danger');
        }
      }
      
    } catch (error) {
      console.error('Ошибка при добавлении объявления:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        showNotification('Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.', 'danger');
      } else {
        showNotification('Произошла ошибка при добавлении объявления', 'danger');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = [
    "Адмиралтейский", "Василеостровский", "Выборгский", "Калининский",
    "Кировский", "Колпинский", "Красногвардейский", "Красносельский",
    "Кронштадтский", "Курортный", "Московский", "Невский",
    "Петроградский", "Петродворцовый", "Приморский", "Пушкинский",
    "Фрунзенский", "Центральный"
  ];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow slide-in">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Добавить информацию о найденном животном</h2>
              
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Внимание!</strong> Вы можете добавить объявление анонимно или привязать его к аккаунту.
                Привязанные объявления будут отображаться в вашем личном кабинете.
              </div>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-warning mb-3">
                  <strong>Ошибки в форме:</strong>
                  <ul className="mb-0 mt-2">
                    {Object.entries(errors).map(([field, error], index) => (
                      <li key={index}><strong>{field}:</strong> {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">
                      Ваше имя <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      readOnly={isAuthenticated}
                    />
                    {errors.name && (
                      <div className={`invalid-feedback ${isAuthenticated ? 'text-warning' : ''}`}>
                        {errors.name}
                      </div>
                    )}
                    <div className="form-text">
                      Имя должно содержать только кириллицу, пробелы и дефисы
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">
                      Телефон <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      readOnly={isAuthenticated}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    <div className="form-text">Телефон должен содержать только цифры и знак +</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly={isAuthenticated}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className={`form-check-input ${errors.register ? 'is-invalid' : ''}`}
                    id="register"
                    name="register"
                    checked={register}
                    onChange={(e) => setRegister(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="register">
                    Хочу привязать объявление к аккаунту / зарегистрироваться
                  </label>
                  <div className="form-text">
                    {register 
                      ? 'Объявление будет отображаться в вашем личном кабинете'
                      : 'Объявление будет анонимным и не будет привязано к аккаунту'
                    }
                  </div>
                </div>
                
                {register && (
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        {isAuthenticated ? 'Пароль для подтверждения' : 'Пароль для аккаунта'} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={register}
                        placeholder={isAuthenticated ? "Введите пароль от вашего аккаунта" : "Придумайте пароль"}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      
                      {!isAuthenticated && (
                        <div className="password-requirements mt-2">
                          <div className={`requirement ${passwordRequirements.length ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi ${passwordRequirements.length ? 'bi-check-circle' : 'bi-circle'}`} />
                            <span> Минимум 7 символов</span>
                          </div>
                          <div className={`requirement ${passwordRequirements.lowercase ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi ${passwordRequirements.lowercase ? 'bi-check-circle' : 'bi-circle'}`} />
                            <span> Одна строчная буква (a-z)</span>
                          </div>
                          <div className={`requirement ${passwordRequirements.uppercase ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi ${passwordRequirements.uppercase ? 'bi-check-circle' : 'bi-circle'}`} />
                            <span> Одна заглавная буква (A-Z)</span>
                          </div>
                          <div className={`requirement ${passwordRequirements.digit ? 'text-success' : 'text-danger'}`}>
                            <i className={`bi ${passwordRequirements.digit ? 'bi-check-circle' : 'bi-circle'}`} />
                            <span> Одна цифра (0-9)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password_confirmation" className="form-label">
                        Подтверждение пароля <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                        id="password_confirmation"
                        name="password_confirmation"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required={register}
                        placeholder="Повторите пароль"
                      />
                      {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                    </div>
                  </div>
                )}
                
                {isAuthenticated && register && (
                  <div className="alert alert-success mb-3">
                    <i className="bi bi-person-check me-2"></i>
                    Вы авторизованы как <strong>{user.name || user.email}</strong>.
                    Объявление будет привязано к вашему аккаунту.
                  </div>
                )}
                
                {!register && (
                  <div className="alert alert-warning mb-3">
                    <i className="bi bi-eye-slash me-2"></i>
                    Объявление будет анонимным и не будет отображаться в личном кабинете.
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="kind" className="form-label">
                    Вид животного <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.kind ? 'is-invalid' : ''}`}
                    id="kind"
                    name="kind"
                    value={formData.kind}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.kind && <div className="invalid-feedback">{errors.kind}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="district" className="form-label">
                    Район, где найдено животное <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.district ? 'is-invalid' : ''}`}
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Выберите район</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="mark" className="form-label">Номер чипа/клеймо</label>
                  <input
                    type="text"
                    className={`form-control ${errors.mark ? 'is-invalid' : ''}`}
                    id="mark"
                    name="mark"
                    value={formData.mark}
                    onChange={handleInputChange}
                    placeholder="Например: VL-0214"
                  />
                  {errors.mark && <div className="invalid-feedback">{errors.mark}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Описание <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                  <div className="form-text">Минимум 10 символов, максимум 1000 символов</div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    Фотографии животного <span className="text-danger">*</span>
                  </label>
                  <div className="alert alert-info">
                    <small><i className="bi bi-info-circle" /> Все фотографии должны быть в формате PNG</small>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="photo1" className="form-label">
                        Фото 1 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                        id="photo1"
                        name="photo1"
                        accept=".png"
                        onChange={(e) => handleFileChange(e, 1)}
                        required
                      />
                      {errors.photo1 && <div className="invalid-feedback">{errors.photo1}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="photo2" className="form-label">Фото 2</label>
                      <input
                        type="file"
                        className={`form-control ${errors.photo2 ? 'is-invalid' : ''}`}
                        id="photo2"
                        name="photo2"
                        accept=".png"
                        onChange={(e) => handleFileChange(e, 2)}
                      />
                      {errors.photo2 && <div className="invalid-feedback">{errors.photo2}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="photo3" className="form-label">Фото 3</label>
                      <input
                        type="file"
                        className={`form-control ${errors.photo3 ? 'is-invalid' : ''}`}
                        id="photo3"
                        name="photo3"
                        accept=".png"
                        onChange={(e) => handleFileChange(e, 3)}
                      />
                      {errors.photo3 && <div className="invalid-feedback">{errors.photo3}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className={`form-check-input ${errors.confirm ? 'is-invalid' : ''}`}
                    id="confirm"
                    name="confirm"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    required
                  />
                  <label className="form-check-label" htmlFor="confirm">
                    Я согласен на обработку персональных данных <span className="text-danger">*</span>
                  </label>
                  {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Отправка...
                      </>
                    ) : register ? 'Добавить объявление и привязать к аккаунту' : 'Добавить анонимное объявление'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPet;