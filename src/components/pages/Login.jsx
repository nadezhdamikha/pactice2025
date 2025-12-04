import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Логика входа
    console.log('Вход в систему');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow slide-in">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Вход в личный кабинет</h2>
              <form id="login-form" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="login-identifier" className="form-label">
                    Email или телефон <span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" id="login-identifier" required />
                  <div className="form-text">Введите ваш email или номер телефона</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Пароль <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control" id="login-password" required />
                </div>
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="remember-me" />
                  <label className="form-check-label" htmlFor="remember-me">Запомнить меня</label>
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">Войти</button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p>Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;