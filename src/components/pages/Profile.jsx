// src/components/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Проверяем, есть ли токен
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      // Если нет токена, перенаправляем на вход
      navigate('/login');
      return;
    }
    
    // Здесь можно сделать запрос за данными пользователя
    if (email) {
      setUserEmail(email);
    }
    
    setIsLoading(false);
  }, [navigate]);
  
  const handleLogout = () => {
    // Очищаем данные авторизации
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    // Перенаправляем на главную
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Личный кабинет</h2>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Выйти
                  </button>
                </div>
                
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Вы успешно вошли в систему!
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Информация о пользователе</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={userEmail} 
                            readOnly 
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Статус</label>
                          <div className="alert alert-success mb-0">
                            Аккаунт активен
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">Действия</h5>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/add-pet')}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Добавить найденное животное
                          </button>
                          
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/search')}
                          >
                            <i className="bi bi-search me-2"></i>
                            Поиск животных
                          </button>
                          
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/')}
                          >
                            <i className="bi bi-house me-2"></i>
                            На главную
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Ваши объявления</h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-inbox display-4 mb-3"></i>
                      <p className="mb-0">У вас пока нет добавленных объявлений</p>
                      <button 
                        className="btn btn-link"
                        onClick={() => navigate('/add-pet')}
                      >
                        Добавить первое объявление
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;