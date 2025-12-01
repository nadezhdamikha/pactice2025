import { Link } from 'react-router-dom';
import logoImage from '../assets/image/logo.png';
import React from 'react';

function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logoImage} className="me-2" alt="GET PET BACK логотип" width="30" height="30" />
          <span className="fw-bold">GET PET BACK</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Переключатель навигации"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/search">Поиск животных</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-pet">Добавить объявление</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <div id="auth-buttons" style={{ display: "flex" }}>
              <button className="btn btn-outline-primary me-2">Войти</button>
              <button className="btn btn-primary">Регистрация</button>
            </div>
            <div id="user-menu" className="dropdown" style={{ display: "none" }}>
              <button
                className="btn btn-outline-primary dropdown-toggle"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1" />
                <span id="user-name">Пользователь</span>
              </button>
              <ul className="dropdown-menu" aria-labelledby="userDropdown">
                <li><Link className="dropdown-item" to="/profile">Личный кабинет</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item">Выйти</button></li>
              </ul>
            </div>
          </div>

          <form className="d-flex ms-2">
            <input
              className="form-control me-2"
              type="search"
              list="pets"
              placeholder="Поиск"
              aria-label="Search"
              id="search-input"
            />
            <button className="btn btn-primary" type="button">Поиск</button>
            <datalist id="pets">{/* Динамически */}</datalist>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Header;
