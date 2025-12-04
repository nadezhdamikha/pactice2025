import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [password, setPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    digit: false
  });

  const validatePassword = (pwd) => {
    setPasswordRequirements({
      length: pwd.length >= 7,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      digit: /\d/.test(pwd)
    });
    return pwd.length >= 7 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert('Пароль не соответствует требованиям');
      return;
    }
    // Логика регистрации
    console.log('Регистрация пользователя');
  };

  const getRequirementClass = (isValid) => {
    return isValid ? 'requirement valid' : 'requirement invalid';
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow slide-in">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Регистрация</h2>
              <form id="register-form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="register-name" className="form-label">
                      Имя <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="register-name" 
                      required 
                      pattern="[А-Яа-я\s\-]+"
                      title="Имя должно содержать только кириллицу, пробелы и дефисы"
                    />
                    <div className="invalid-feedback">Имя должно содержать только кириллицу, пробелы и дефисы</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="register-phone" className="form-label">
                      Телефон <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="register-phone" 
                      required 
                      pattern="[\+\d]+"
                      title="Телефон должен содержать только цифры и знак +"
                    />
                    <div className="invalid-feedback">Телефон должен содержать только цифры и знак +</div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="register-email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input type="email" className="form-control" id="register-email" required />
                  <div className="invalid-feedback">Пожалуйста, введите корректный email адрес</div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="register-password" className="form-label">
                      Пароль <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="register-password" 
                      required 
                      minLength="7"
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    
                    {/* Проверка требований к паролю */}
                    <div className="password-requirements" id="register-password-requirements">
                      <div className={getRequirementClass(passwordRequirements.length)} id="req-length">
                        <i className={`bi ${passwordRequirements.length ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span>Минимум 7 символов</span>
                      </div>
                      <div className={getRequirementClass(passwordRequirements.lowercase)} id="req-lowercase">
                        <i className={`bi ${passwordRequirements.lowercase ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span>Одна строчная буква (a-z)</span>
                      </div>
                      <div className={getRequirementClass(passwordRequirements.uppercase)} id="req-uppercase">
                        <i className={`bi ${passwordRequirements.uppercase ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span>Одна заглавная буква (A-Z)</span>
                      </div>
                      <div className={getRequirementClass(passwordRequirements.digit)} id="req-digit">
                        <i className={`bi ${passwordRequirements.digit ? 'bi-check-circle' : 'bi-circle'}`}></i>
                        <span>Одна цифра (0-9)</span>
                      </div>
                    </div>
                    
                    <div className="invalid-feedback">
                      Пароль должен содержать минимум 7 символов, включая 1 цифру, 1 строчную и 1 заглавную букву
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="register-password-confirm" className="form-label">
                      Подтверждение пароля <span className="text-danger">*</span>
                    </label>
                    <input type="password" className="form-control" id="register-password-confirm" required />
                    <div className="invalid-feedback">Пароли не совпадают</div>
                  </div>
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="register-confirm" required />
                  <label className="form-check-label" htmlFor="register-confirm">
                    Я согласен на обработку персональных данных <span className="text-danger">*</span>
                  </label>
                  <div className="invalid-feedback">Необходимо согласие на обработку персональных данных</div>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">Зарегистрироваться</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p>Уже есть аккаунт? <Link to="/login">Войдите</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;