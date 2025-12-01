import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>GET PET BACK</h5>
            <p>Помогаем вернуть домашних питомцев их владельцам</p>
          </div>
          <div className="col-md-3">
            <h5>Ссылки</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light">Главная</Link></li>
              <li><Link to="/search" className="text-light">Поиск животных</Link></li>
              <li><Link to="/add-pet" className="text-light">Добавить объявление</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Контакты</h5>
            <ul className="list-unstyled">
              <li><i className="bi bi-telephone me-2" /> 8-800-123-45-67</li>
              <li><i className="bi bi-envelope me-2" /> info@getpetback.ru</li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p>© 2025 GET PET BACK. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
