import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuickSearch from './QuickSearch';
import logoImage from '../assets/image/logo.png';

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">

        {/* LOGO */}
        <Link className="navbar-brand" to="/">
          <img src={logoImage} alt="GET PET BACK" />
          <span>GET PET BACK</span>
        </Link>

        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* CONTENT */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center w-100 gap-3">

            {/* NAV */}
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/search">
                  <i className="bi bi-search me-2"></i>
                  Поиск животных
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/add-pet">
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить объявление
                </Link>
              </li>
            </ul>

            {/* SEARCH */}
            <div className="search-container flex-grow-1">
              <QuickSearch />
            </div>

            {/* AUTH */}
            <div className="auth-container ms-lg-auto">
              {!isAuthenticated ? (
                <div className="d-flex gap-2">
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    <i className="bi bi-box-arrow-in-right"></i>
                    Войти
                  </Link>
                  <Link className="btn btn-primary btn-sm" to="/register">
                    <i className="bi bi-person-plus"></i>
                    Регистрация
                  </Link>
                </div>
              ) : (
                <div className="dropdown user-menu">
                  <button
                    className="btn btn-outline-primary btn-sm dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.name || user?.email?.split('@')[0]}
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Личный кабинет
                      </Link>
                    </li>

                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Выйти
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
