// src/components/pages/AddPet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Константы API
const API_BASE_URL = 'https://pets.сделай.site';
const API_PETS_URL = `${API_BASE_URL}/api/pets`;

function AddPet({ showNotification }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [register, setRegister] = useState(!isAuthenticated);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false
  });
  const [agreement, setAgreement] = useState(false);

  // Используем очищенное имя пользователя
  const cleanUserName = user?.name ? user.name.replace(/[^А-Яа-яЁё\s-]/g, '') : '';

  // Если пользователь авторизован, заполняем поля автоматически
  const [formData, setFormData] = useState({
    name: cleanUserName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    kind: '',
    district: '',
    mark: '',
    description: '',
    photo1: null,
    photo2: null,
    photo3: null,
    confirm: 0
  });

  // Проверка пароля в реальном времени
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

  // Обновляем форму при изменении пользователя
  useEffect(() => {
    if (isAuthenticated && user) {
      // Очищаем имя от некириллических символов
      const cleanName = user.name ? user.name.replace(/[^А-Яа-яЁё\s-]/g, '') : '';
      
      setFormData(prev => ({
        ...prev,
        name: cleanName || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
      setRegister(true); // Автоматически ставим галочку регистрации для авторизованных пользователей
    }
  }, [isAuthenticated, user]);

  // Валидация форм - убираем строгую проверку для подставленных данных
  const validateName = (name, isAutoFilled = false) => {
    if (!name.trim()) return false;
    if (isAutoFilled) return true; // Для автозаполненных данных пропускаем строгую проверку
    return /^[А-Яа-яЁё\s-]+$/.test(name);
  };

  const validatePhone = (phone) => /^\+?[0-9\s\-\(\)]+$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/.test(pwd);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очистка ошибок при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, photoNumber) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка формата PNG
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
      
      // Очистка ошибок
      if (errors[`photo${photoNumber}`]) {
        setErrors(prev => ({ ...prev, [`photo${photoNumber}`]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Обязательные поля
    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше имя';
    } else if (!validateName(formData.name, isAuthenticated)) {
      // Для авторизованных пользователей показываем предупреждение вместо ошибки
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
    
    // Проверка номера чипа если заполнен
    if (formData.mark.trim() && !/^[A-Za-z0-9\-]+$/.test(formData.mark)) {
      newErrors.mark = 'Номер чипа может содержать только латинские буквы, цифры и дефисы';
    }
    
    // Проверка пароля если выбрана регистрация
    if (register) {
      if (!password) newErrors.password = 'Введите пароль';
      else if (!validatePassword(password)) newErrors.password = 'Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву';
      
      if (!passwordConfirmation) newErrors.password_confirmation = 'Подтвердите пароль';
      else if (password !== passwordConfirmation) newErrors.password_confirmation = 'Пароли не совпадают';
    }
    
    if (!agreement) newErrors.confirm = 'Необходимо согласие на обработку персональных данных';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      showNotification('Пожалуйста, исправьте ошибки в форме', 'danger');
      setIsSubmitting(false);
      return;
    }
    
    // Создание FormData для отправки файлов
    const submitData = new FormData();
    
    // Добавляем все текстовые поля
    submitData.append('name', formData.name);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    submitData.append('kind', formData.kind);
    submitData.append('district', formData.district);
    submitData.append('mark', formData.mark);
    submitData.append('description', formData.description);
    submitData.append('confirm', agreement ? 1 : 0);
    submitData.append('register', register ? 1 : 0); // Добавляем поле register
    
    // Добавляем фото если есть
    if (formData.photo1) submitData.append('photo1', formData.photo1);
    if (formData.photo2) submitData.append('photo2', formData.photo2);
    if (formData.photo3) submitData.append('photo3', formData.photo3);
    
    // Добавляем пароли если выбрана регистрация
    if (register) {
      submitData.append('password', password);
      submitData.append('password_confirmation', passwordConfirmation);
    }
    
    try {
      const headers = {};
      
      // Добавляем токен авторизации, если пользователь авторизован
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(API_PETS_URL, {
        method: 'POST',
        headers: headers,
        body: submitData,
      });
      
      // Читаем ответ как текст сначала для отладки
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
        // Проверяем разные форматы успешного ответа
        let petId = null;
        
        // Формат 1: {"data": {"status": "ok", "id": 10}}
        if (data.data && data.data.status === 'ok' && data.data.id) {
          petId = data.data.id;
        }
        // Формат 2: {"status": "ok", "id": 10}
        else if (data.status === 'ok' && data.id) {
          petId = data.id;
        }
        // Формат 3: {"data": {"id": 10}} (без status)
        else if (data.data && data.data.id) {
          petId = data.data.id;
        }
        // Формат 4: {"id": 10} (без status)
        else if (data.id) {
          petId = data.id;
        }
        
        if (petId) {
          showNotification('Объявление успешно добавлено!', 'success');
          
          // Если была регистрация, сохраняем токен (если он пришел в ответе)
          if (register && (data.token || data.data?.token)) {
            const token = data.token || data.data?.token;
            login({
              email: formData.email,
              name: formData.name,
              phone: formData.phone
            }, token);
            showNotification('Объявление привязано к вашему аккаунту!', 'success');
          }
          
          // Перенаправляем на страницу объявления
          navigate(`/pet/${petId}`);
          
        } else {
          // Если ответ успешный, но формат непонятный
          console.warn('Нестандартный формат успешного ответа:', data);
          showNotification('Объявление успешно добавлено!', 'success');
          navigate('/');
        }
        
      } else {
        // Обработка ошибок
        if (response.status === 422 && data.error?.errors) {
          // Обработка ошибок валидации с сервера
          const serverErrors = data.error.errors;
          const formattedErrors = {};
          
          // Преобразуем ошибки сервера в формат для отображения
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
      
      // Проверяем, не связано ли это с CORS или сетевыми проблемами
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        showNotification('Не удалось подключиться к серверу. Проверьте интернет-соединение и попробуйте снова.', 'danger');
      } else {
        showNotification('Произошла ошибка при добавлении объявления', 'danger');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Список районов
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
                      {isAuthenticated && errors.name && ' (автозаполнено)'}
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
                
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="register"
                      name="register"
                      checked={register}
                      onChange={(e) => {
                        setRegister(e.target.checked);
                        // Очищаем пароли при снятии галочки
                        if (!e.target.checked) {
                          setPassword('');
                          setPasswordConfirmation('');
                          setPasswordRequirements({
                            length: false,
                            lowercase: false,
                            uppercase: false,
                            digit: false
                          });
                        }
                      }}
                      disabled={isAuthenticated} // Для авторизованных нельзя снять галочку
                    />
                    <label className="form-check-label" htmlFor="register">
                      {isAuthenticated ? (
                        <>
                          <strong>Привязать объявление к моему аккаунту</strong>
                          <div className="form-text text-muted">Чтобы объявление отображалось в вашем личном кабинете</div>
                        </>
                      ) : (
                        "Пройти автоматическую регистрацию при добавлении объявления"
                      )}
                    </label>
                    {isAuthenticated && (
                      <div className="form-text text-warning">
                        <i className="bi bi-exclamation-triangle"></i> Для привязки объявления к вашему аккаунту необходимо ввести пароль
                      </div>
                    )}
                  </div>
                </div>
                
                {register && (
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Пароль <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        required={register}
                        placeholder={isAuthenticated ? "Введите пароль для привязки аккаунта" : "Введите пароль"}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      
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
                        onChange={(e) => {
                          setPasswordConfirmation(e.target.value);
                        }}
                        required={register}
                        placeholder={isAuthenticated ? "Подтвердите пароль" : "Подтвердите пароль"}
                      />
                      {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                    </div>
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
                    onChange={(e) => {
                      setAgreement(e.target.checked);
                    }}
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
                    ) : 'Добавить объявление'}
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