// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/image/logo.png';
import QuickSearch from './QuickSearch';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        {/* Логотип и бренд */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logoImage} className="me-2" alt="GET PET BACK логотип" width="30" height="30" />
          <span className="fw-bold">GET PET BACK</span>
        </Link>
        
        {/* Кнопка для мобильного меню */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Переключатель навигации"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Основное меню */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Навигационные ссылки */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/search">Поиск животных</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-pet">Добавить объявление</Link>
            </li>
          </ul>
          
          {/* Блок авторизации/пользователя */}
          <div className="d-flex align-items-center me-3">
            {!isAuthenticated ? (
              // Кнопки авторизации (показываются когда пользователь не вошел)
              <div id="auth-buttons" style={{ display: "flex" }}>
                <Link className="btn btn-outline-primary me-2" to="/login">Войти</Link>
                <Link className="btn btn-primary" to="/register">Регистрация</Link>
              </div>
            ) : (
              // Меню пользователя (показывается когда пользователь вошел)
              <div id="user-menu" className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  <span id="user-name">{localStorage.getItem('userName') || user?.email || 'Пользователь'}</span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">Личный кабинет</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Выйти
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Компонент быстрого поиска */}
          <div className="flex-grow-1" style={{ maxWidth: '500px' }}>
            <QuickSearch />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;