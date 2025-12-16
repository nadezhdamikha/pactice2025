import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EditPetModal from './EditPetModal';

const API_BASE_URL = 'https://pets.сделай.site';

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
    phone: '',
    email: ''
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePetId, setDeletePetId] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const loadUserPets = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
     
      if (response.ok) {
        const data = await response.json();
        console.log('Объявления пользователя:', data);
       
        if (data.data?.orders) {
          const pets = data.data.orders.map(order => ({
            id: order.id,
            kind: order.kind || 'Животное',
            mark: order.mark || '',
            district: order.district || '',
            status: order.status || 'active',
            photos: order.photos ? [`${API_BASE_URL}${order.photos}`] : [],
            description: order.description || '',
            date: order.date || ''
          }));
         
          setUserPets(pets);
        } else {
          setUserPets([]);
          console.log('Нет объявлений или неправильный формат ответа');
        }
      } else {
        console.warn('Не удалось загрузить объявлений:', response.status);
        setUserPets([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
      setUserPets([]);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      if (!user || !user.token) {
        navigate('/login');
        return;
      }
     
      const token = user.token;
     
      const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      if (userResponse.ok) {
        const userDataApi = await userResponse.json();
        console.log('Данные пользователя с API:', userDataApi);
       
        let userInfo;
       
        if (userDataApi.id) {
          userInfo = userDataApi;
        } else if (userDataApi.data?.user?.[0]) {
          userInfo = userDataApi.data.user[0];
        } else if (userDataApi.data) {
          userInfo = userDataApi.data;
        }
       
        if (userInfo) {
          const newUserData = {
            name: userInfo.name || '',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            registrationDate: userInfo.registrationDate || new Date().toISOString().split('T')[0],
            ordersCount: userInfo.ordersCount || 0,
            petsCount: userInfo.petsCount || 0,
            id: userInfo.id
          };
         
          setUserData(newUserData);
          setEditForm({
            phone: userInfo.phone || '',
            email: userInfo.email || ''
          });
         
          await loadUserPets(token);
        } else {
          showNotification('Не удалось получить данные пользователя', 'warning');
        }
      } else if (userResponse.status === 401) {
        showNotification('Сессия истекла. Войдите снова.', 'warning');
        logout();
        navigate('/login');
      } else {
        showNotification('Ошибка загрузки данных пользователя', 'danger');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      showNotification('Ошибка загрузки данных', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, loadUserPets, logout, showNotification]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleEditPet = (pet) => {
    if (!canEditPet(pet)) {
      showNotification('Это объявление нельзя редактировать', 'warning');
      return;
    }
   
    setSelectedPet(pet);
    setEditModalOpen(true);
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    setIsDeleting(true);
    setDeletePetId(petId);
   
    try {
      const token = user?.token;
      console.log(`Удаление объявления ${petId} с токеном: ${token?.substring(0, 20)}...`);
     
      const response = await fetch(`${API_BASE_URL}/api/users/orders/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
     
      console.log('Ответ при удалении:', response.status);
     
      if (response.ok) {
        const responseData = await response.json();
        console.log('Успешное удаление:', responseData);
       
        showNotification('Объявление успешно удалено!', 'success');
       
        setUserPets(prev => prev.filter(pet => pet.id !== petId));
       
        setUserData(prev => ({
          ...prev,
          ordersCount: Math.max(0, prev.ordersCount - 1)
        }));
       
      } else if (response.status === 401) {
        showNotification('Сессия истекла. Войдите снова.', 'warning');
        logout();
        navigate('/login');
      } else if (response.status === 403) {
        showNotification('Недостаточно прав для удаления этого объявления', 'danger');
      } else if (response.status === 404) {
        showNotification('Объявление не найдено', 'warning');
      } else if (response.status === 405) {
        showNotification('Метод DELETE не поддерживается для этого эндпоинта', 'danger');
        console.error('Метод DELETE не поддерживается. Проверьте API документацию.');
      } else {
        try {
          const errorData = await response.json();
          const errorMsg = errorData.error?.message || errorData.message || `Ошибка сервера: ${response.status}`;
          showNotification(errorMsg, 'danger');
        } catch {
          showNotification(`Ошибка сервера: ${response.status}`, 'danger');
        }
      }
     
    } catch (error) {
      console.error('Ошибка удаления объявления:', error);
     
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        showNotification('Не удалось подключиться к серверу. Проверьте интернет-соединение.', 'danger');
      } else {
        showNotification('Произошла ошибка при удалении объявления', 'danger');
      }
    } finally {
      setIsDeleting(false);
      setDeletePetId(null);
    }
  };

  const handlePetUpdated = () => {
    showNotification('Объявление успешно обновлено!', 'success');
    if (user?.token) {
      loadUserPets(user.token);
    }
    setEditModalOpen(false);
    setSelectedPet(null);
  };

  const canEditPet = (pet) => {
    return pet.status === 'active' || pet.status === 'onModeration';
  };

  const canDeletePet = (pet) => {
    return pet.status === 'active' || pet.status === 'onModeration';
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.email.trim()) {
      showNotification('Введите email', 'danger');
      return;
    }
   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showNotification('Введите корректный email', 'danger');
      return;
    }
   
    if (!editForm.phone.trim()) {
      showNotification('Введите телефон', 'danger');
      return;
    }

    setIsUpdatingProfile(true);
   
    try {
      const updates = [];
      let updatedFields = {};

      // Обновляем телефон через API PATCH
      if (editForm.phone !== userData.phone) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/phone`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              phone: editForm.phone
            })
          });

          if (response.ok) {
            updates.push('телефон');
            updatedFields.phone = editForm.phone;
            console.log('Телефон успешно обновлен через API');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || 'Ошибка обновления телефона');
          }
        } catch (error) {
          showNotification(`Ошибка обновления телефона: ${error.message}`, 'danger');
          setIsUpdatingProfile(false);
          return;
        }
      }

      // Обновляем email через API PATCH
      if (editForm.email !== userData.email) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/email`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              email: editForm.email
            })
          });

          if (response.ok) {
            updates.push('email');
            updatedFields.email = editForm.email;
            console.log('Email успешно обновлен через API');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || errorData.message || 'Ошибка обновления email');
          }
        } catch (error) {
          showNotification(`Ошибка обновления email: ${error.message}`, 'danger');
          setIsUpdatingProfile(false);
          return;
        }
      }

      // Если были обновления через API или локально
      if (updates.length > 0) {
        setUserData(prev => ({
          ...prev,
          ...updatedFields
        }));

        // Обновляем только те поля, которые есть в updatedFields
        if (Object.keys(updatedFields).length > 0) {
          updateUser(updatedFields);
        }

        showNotification(`Профиль успешно обновлен! Обновлено: ${updates.join(', ')}`, 'success');
      } else {
        showNotification('Нет изменений для сохранения', 'info');
      }
     
      setIsEditing(false);
     
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      showNotification('Ошибка при обновлении профиля', 'danger');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      phone: userData.phone,
      email: userData.email
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Активно',
      'wasFound': 'Хозяин найден',
      'onModeration': 'На модерации',
      'archive': 'В архиве',
      'published': 'Опубликовано',
      'pending': 'На рассмотрении'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'active': 'badge bg-success',
      'wasFound': 'badge bg-info',
      'onModeration': 'badge bg-warning',
      'archive': 'badge bg-secondary',
      'published': 'badge bg-success',
      'pending': 'badge bg-warning'
    };
    return classMap[status] || 'badge bg-secondary';
  };

  const calculateDaysOnSite = (dateString) => {
    try {
      const regDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today - regDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
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
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <h2 className="mb-0 fw-bold">Личный кабинет</h2>
                  <button
                    className="btn btn-outline-danger px-4"
                    onClick={logout}
                  >
                    Выйти
                  </button>
                </div>
               
                <div className="row mb-5">
                  <div className="col-md-4 text-center">
                    <div className="profile-avatar bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4"
                         style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '2.5rem' }}>
                      {userData.name?.charAt(0).toUpperCase() || 'П'}
                    </div>
                    <h4 className="fw-bold mb-2">{userData.name}</h4>
                    <p className="text-muted">
                      На сайте {calculateDaysOnSite(userData.registrationDate)} дней
                    </p>
                  </div>
                 
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-12 mb-4">
                        <label className="form-label fw-medium mb-2">Имя</label>
                        <div className="fs-5 py-2">{userData.name || 'Не указано'}</div>
                      </div>
                     
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-medium mb-2">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            required
                            disabled={isUpdatingProfile}
                          />
                        ) : (
                          <div className="fs-5 py-2">{userData.email || 'Не указан'}</div>
                        )}
                      </div>
                     
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-medium mb-2">Телефон</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            pattern="[\+\d]+"
                            required
                            disabled={isUpdatingProfile}
                          />
                        ) : (
                          <div className="fs-5 py-2">{userData.phone || 'Не указан'}</div>
                        )}
                      </div>
                     
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-medium mb-2">Дата регистрации</label>
                        <div className="fs-5 py-2">{formatDate(userData.registrationDate)}</div>
                      </div>
                     
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-medium mb-2">Количество объявлений</label>
                        <div className="fs-5 py-2">{userData.ordersCount}</div>
                      </div>
                    </div>
                   
                    <div className="d-flex gap-3 mt-4">
                      {isEditing ? (
                        <>
                          <button 
                            className="btn btn-primary px-4 py-2" 
                            onClick={handleSaveProfile}
                            disabled={isUpdatingProfile}
                          >
                            {isUpdatingProfile ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Сохранение...
                              </>
                            ) : 'Сохранить изменения'}
                          </button>
                          <button 
                            className="btn btn-outline-secondary px-4 py-2" 
                            onClick={handleCancelEdit}
                            disabled={isUpdatingProfile}
                          >
                            Отменить
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-primary px-4 py-2" onClick={handleEditProfile}>
                          Редактировать профиль
                        </button>
                      )}
                    </div>
                  </div>
                </div>
               
                <div className="mb-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 fw-bold">Мои объявления</h4>
                    {userPets.length > 0 && (
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/add-pet')}
                      >
                        Добавить объявление
                      </button>
                    )}
                  </div>
                 
                  {userPets.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="bi bi-inbox display-4 text-muted"></i>
                      </div>
                      <p className="text-muted fs-5 mb-3">У вас пока нет добавленных объявлений</p>
                      <button className="btn btn-primary" onClick={() => navigate('/add-pet')}>
                        Добавить первое объявление
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive rounded-3 overflow-hidden border">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Фото</th>
                            <th className="px-4 py-3">Вид</th>
                            <th className="px-4 py-3">Номер чипа</th>
                            <th className="px-4 py-3">Район</th>
                            <th className="px-4 py-3">Статус</th>
                            <th className="px-4 py-3">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userPets.map(pet => (
                            <tr key={pet.id} className="align-middle">
                              <td className="px-4 py-3">
                                {pet.photos && pet.photos.length > 0 ? (
                                  <img
                                    src={pet.photos[0]}
                                    alt={pet.kind}
                                    className="rounded"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/60x60?text=No+Photo';
                                    }}
                                  />
                                ) : (
                                  <div className="rounded bg-light d-flex align-items-center justify-content-center"
                                       style={{ width: '60px', height: '60px' }}>
                                    <span className="text-muted">Нет фото</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="fw-medium">{pet.kind}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div>{pet.mark || <span className="text-muted">Не указан</span>}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div>{pet.district}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={getStatusClass(pet.status)}>
                                  {getStatusText(pet.status)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => navigate(`/pet/${pet.id}`)}
                                  >
                                    Просмотр
                                  </button>
                                  {canEditPet(pet) && (
                                    <button
                                      className="btn btn-outline-warning btn-sm"
                                      onClick={() => handleEditPet(pet)}
                                    >
                                      Редактировать
                                    </button>
                                  )}
                                  {canDeletePet(pet) && (
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeletePet(pet.id)}
                                      disabled={isDeleting && deletePetId === pet.id}
                                    >
                                      {isDeleting && deletePetId === pet.id ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                      ) : 'Удалить'}
                                    </button>
                                  )}
                                  {!canDeletePet(pet) && (
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      disabled
                                    >
                                      Удалить
                                    </button>
                                  )}
                                </div>
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
     
      {editModalOpen && selectedPet && (
        <EditPetModal
          pet={selectedPet}
          token={user?.token}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedPet(null);
          }}
          onSuccess={handlePetUpdated}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default Profile;