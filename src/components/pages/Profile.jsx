// src/components/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile = ({ showNotification }) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    registrationDate: new Date().toISOString().split('T')[0],
    ordersCount: 0,
    petsCount: 0
  });
  const [userPets, setUserPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Загрузка данных пользователя
    loadUserData();
    loadUserPets();
  }, [user, navigate]);

  const loadUserData = () => {
    try {
      const savedName = localStorage.getItem('userName');
      const savedPhone = localStorage.getItem('userPhone');
      const savedEmail = localStorage.getItem('userEmail');
      const savedDate = localStorage.getItem('registrationDate') || new Date().toISOString().split('T')[0];
      
      setUserData({
        name: savedName || user?.name || 'Пользователь',
        email: savedEmail || user?.email || '',
        phone: savedPhone || user?.phone || '',
        registrationDate: savedDate,
        ordersCount: 0,
        petsCount: 0
      });
      
      setEditForm({
        name: savedName || user?.name || '',
        phone: savedPhone || user?.phone || '',
        email: savedEmail || user?.email || ''
      });
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      showNotification('Ошибка загрузки данных', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPets = async () => {
    try {
      const token = user?.token || localStorage.getItem('authToken');
      if (!token) return;

      // Здесь должен быть реальный запрос к API
      // Пока имитируем данные
      const mockPets = [
        {
          id: 1,
          kind: 'Собака',
          mark: 'VL-0214',
          district: 'Приморский',
          status: 'active',
          photos: ['https://placebear.com/200/200'],
          description: 'Дружелюбная собака, найдена в парке',
          date: '2023-10-15'
        },
        {
          id: 2,
          kind: 'Кошка',
          mark: '',
          district: 'Центральный',
          status: 'wasFound',
          photos: ['https://placebear.com/200/200'],
          description: 'Белая кошка с голубыми глазами',
          date: '2023-10-12'
        }
      ];
      
      setUserPets(mockPets);
      setUserData(prev => ({
        ...prev,
        ordersCount: mockPets.length,
        petsCount: mockPets.filter(pet => pet.status === 'wasFound').length
      }));
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    // Валидация
    if (!editForm.name.trim()) {
      showNotification('Введите имя', 'danger');
      return;
    }
    
    if (!editForm.email.trim()) {
      showNotification('Введите email', 'danger');
      return;
    }
    
    if (!editForm.phone.trim()) {
      showNotification('Введите телефон', 'danger');
      return;
    }

    try {
      const token = user?.token || localStorage.getItem('authToken');
      // В реальном приложении здесь был бы запрос к API
      // Пока просто обновляем локальные данные
      
      // Обновляем данные в контексте
      updateUser({
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email
      });
      
      // Обновляем localStorage
      localStorage.setItem('userName', editForm.name);
      localStorage.setItem('userPhone', editForm.phone);
      localStorage.setItem('userEmail', editForm.email);
      
      // Обновляем состояние
      setUserData(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email
      }));
      
      showNotification('Профиль успешно обновлен!', 'success');
      setIsEditing(false);
      
    } catch (error) {
      showNotification('Ошибка при обновлении профиля', 'danger');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: userData.name,
      phone: userData.phone,
      email: userData.email
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'wasFound': return 'Хозяин найден';
      case 'onModeration': return 'На модерации';
      case 'archive': return 'В архиве';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'wasFound': return 'bg-info';
      case 'onModeration': return 'bg-warning';
      case 'archive': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const calculateDaysOnSite = (dateString) => {
    const regDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - regDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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
          <div className="col-md-10">
            <div className="card shadow slide-in">
              <div className="card-body p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Личный кабинет</h2>
                  <button
                    className="btn btn-outline-danger"
                    onClick={logout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Выйти
                  </button>
                </div>
                
                {/* Информация о пользователе */}
                <div className="row mb-5">
                  <div className="col-md-4 text-center">
                    <div className="profile-avatar bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                         style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '2.5rem' }}>
                      {userData.name?.charAt(0).toUpperCase() || 'П'}
                    </div>
                    <h4 id="profile-name">{userData.name}</h4>
                    <p className="text-muted" id="profile-days">
                      На сайте {calculateDaysOnSite(userData.registrationDate)} дней
                    </p>
                  </div>
                  
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        {isEditing ? (
                          <input
                            type="email"
                            className="form-control"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={userData.email}
                            readOnly
                          />
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Телефон <span className="text-danger">*</span></label>
                        {isEditing ? (
                          <input
                            type="tel"
                            className="form-control"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            pattern="[\+\d]+"
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={userData.phone}
                            readOnly
                          />
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Дата регистрации</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatDate(userData.registrationDate)}
                          readOnly
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Количество объявлений</label>
                        <input
                          type="text"
                          className="form-control"
                          value={userData.ordersCount}
                          readOnly
                        />
                      </div>
                      
                      <div className="col-12 mb-3">
                        <label className="form-label">Имя</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={userData.name}
                            readOnly
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      {isEditing ? (
                        <>
                          <button className="btn btn-primary" onClick={handleSaveProfile}>
                            Сохранить изменения
                          </button>
                          <button className="btn btn-outline-secondary" onClick={handleCancelEdit}>
                            Отменить
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-primary" onClick={handleEditProfile}>
                          Редактировать профиль
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Мои объявления */}
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Мои объявления</h4>
                    <button className="btn btn-primary" onClick={() => navigate('/add-pet')}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Добавить объявление
                    </button>
                  </div>
                  
                  {userPets.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                      <p className="text-muted">У вас пока нет добавленных объявлений</p>
                      <button className="btn btn-link" onClick={() => navigate('/add-pet')}>
                        Добавить первое объявление
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Фото</th>
                            <th>Вид</th>
                            <th>Номер чипа</th>
                            <th>Район</th>
                            <th>Статус</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userPets.map(pet => (
                            <tr key={pet.id}>
                              <td>
                                <img
                                  src={pet.photos[0]}
                                  alt={pet.kind}
                                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              </td>
                              <td>{pet.kind}</td>
                              <td>{pet.mark || 'Не указан'}</td>
                              <td>{pet.district}</td>
                              <td>
                                <span className={`badge ${getStatusClass(pet.status)}`}>
                                  {getStatusText(pet.status)}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => navigate(`/pet/${pet.id}`)}
                                >
                                  Просмотр
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                  Удалить
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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