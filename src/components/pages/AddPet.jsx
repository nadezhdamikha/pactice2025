// components/pages/AddPet.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function AddPet() {
  const navigate = useNavigate();
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
    photo3: null
  });
  
  const [registerWithPet, setRegisterWithPet] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false
  });
  const [errors, setErrors] = useState({});
  const [agreement, setAgreement] = useState(false);

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

  // Валидация форм
  const validateName = (name) => /^[А-Яа-я\s\-]+$/.test(name);
  const validatePhone = (phone) => /^[\+\d]+$/.test(phone);
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
    if (!formData.name.trim()) newErrors.name = 'Введите ваше имя';
    else if (!validateName(formData.name)) newErrors.name = 'Имя должно содержать только кириллицу, пробелы и дефисы';
    
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
    if (registerWithPet) {
      if (!password) newErrors.password = 'Введите пароль';
      else if (!validatePassword(password)) newErrors.password = 'Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву';
      
      if (!passwordConfirm) newErrors.passwordConfirm = 'Подтвердите пароль';
      else if (password !== passwordConfirm) newErrors.passwordConfirm = 'Пароли не совпадают';
    }
    
    if (!agreement) newErrors.agreement = 'Необходимо согласие на обработку персональных данных';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    // Создание FormData для отправки файлов
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    
    if (registerWithPet) {
      submitData.append('password', password);
      submitData.append('register', 'true');
    }
    
    try {
      // Здесь будет реальный запрос к API
      console.log('Отправка данных:', Object.fromEntries(submitData));
      
      // Имитация запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Объявление успешно добавлено!');
      navigate('/'); // Перенаправление на главную после успешного добавления
      
    } catch (error) {
      console.error('Ошибка при добавлении объявления:', error);
      alert('Произошла ошибка при добавлении объявления');
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
                <div className="alert alert-danger mb-3">
                  <ul className="mb-0">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
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
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    <div className="form-text">Имя должно содержать только кириллицу, пробелы и дефисы</div>
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
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="register-with-pet"
                      checked={registerWithPet}
                      onChange={(e) => setRegisterWithPet(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="register-with-pet">
                      Зарегистрироваться при добавлении объявления
                    </label>
                  </div>
                </div>
                
                {registerWithPet && (
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Пароль <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      
                      <div className="password-requirements mt-2">
                        <div className={`requirement ${passwordRequirements.length ? 'valid' : 'invalid'}`}>
                          <i className={`bi ${passwordRequirements.length ? 'bi-check-circle' : 'bi-circle'}`} />
                          <span>Минимум 7 символов</span>
                        </div>
                        <div className={`requirement ${passwordRequirements.lowercase ? 'valid' : 'invalid'}`}>
                          <i className={`bi ${passwordRequirements.lowercase ? 'bi-check-circle' : 'bi-circle'}`} />
                          <span>Одна строчная буква (a-z)</span>
                        </div>
                        <div className={`requirement ${passwordRequirements.uppercase ? 'valid' : 'invalid'}`}>
                          <i className={`bi ${passwordRequirements.uppercase ? 'bi-check-circle' : 'bi-circle'}`} />
                          <span>Одна заглавная буква (A-Z)</span>
                        </div>
                        <div className={`requirement ${passwordRequirements.digit ? 'valid' : 'invalid'}`}>
                          <i className={`bi ${passwordRequirements.digit ? 'bi-check-circle' : 'bi-circle'}`} />
                          <span>Одна цифра (0-9)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password-confirm" className="form-label">
                        Подтверждение пароля <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.passwordConfirm ? 'is-invalid' : ''}`}
                        id="password-confirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                      />
                      {errors.passwordConfirm && <div className="invalid-feedback">{errors.passwordConfirm}</div>}
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
                  <label htmlFor="mark" className="form-label">Номер чипа</label>
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
                    className={`form-check-input ${errors.agreement ? 'is-invalid' : ''}`}
                    id="agreement"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    required
                  />
                  <label className="form-check-label" htmlFor="agreement">
                    Я согласен на обработку персональных данных <span className="text-danger">*</span>
                  </label>
                  {errors.agreement && <div className="invalid-feedback">{errors.agreement}</div>}
                </div>
                
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Добавить объявление
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