import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/image/logo.png';

function Header() {
  const navigate = useNavigate();
  
  // Функция для обработки поиска
  const handleSearch = () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
    }
  };

  // Обработчик нажатия Enter в поле поиска
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

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
            {/* Кнопки авторизации - показываются, когда пользователь не вошел */}
            <div id="auth-buttons" style={{ display: "flex" }}>
              <Link className="btn btn-outline-primary me-2" to="/login">Войти</Link>
              <Link className="btn btn-primary" to="/register">Регистрация</Link>
            </div>
            
            {/* Меню пользователя - показывается, когда пользователь вошел */}
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
                <li>
                  <Link className="dropdown-item" to="/profile">Личный кабинет</Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={() => {
                    // Здесь будет логика выхода
                    console.log('Выход из системы');
                  }}>
                    Выйти
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <form className="d-flex ms-2" onSubmit={(e) => e.preventDefault()}>
            <input
              className="form-control me-2"
              type="search"
              list="pets"
              placeholder="Поиск"
              aria-label="Search"
              id="search-input"
              onKeyPress={handleKeyPress}
            />
            <button 
              className="btn btn-primary" 
              type="button"
              onClick={handleSearch}
            >
              Поиск
            </button>
            <datalist id="pets">{/* Динамически */}</datalist>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Header;