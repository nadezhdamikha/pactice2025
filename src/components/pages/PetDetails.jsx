// src/components/pages/PetDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PetDetailsPage = ({ showNotification }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasShownNotification, setHasShownNotification] = useState(false); // Флаг для уведомления

  const fetchPetDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`https://pets.сделай.site/api/pets/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Животное не найдено');
        }
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.pet) {
        setPet(data.data.pet);
      } else if (data) {
        setPet(data);
      } else {
        setPet(null);
      }
    } catch (error) {
      console.error('Ошибка при загрузке деталей животного:', error);
      setError(error.message || 'Не удалось загрузить информацию о животном');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPetDetails();
    }
  }, [id, fetchPetDetails]);

  // Показываем уведомление только один раз после успешной загрузки
  useEffect(() => {
    if (pet && !isLoading && !error && !hasShownNotification) {
      
      setHasShownNotification(true);
    }
  }, [pet, isLoading, error, hasShownNotification, showNotification]);

  // Функция для получения полного URL изображения
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://pets.сделай.site${imagePath}`;
    }
    
    return `https://pets.сделай.site/${imagePath}`;
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', dateString, error);
      return dateString;
    }
  };

  // Маскирование телефона (для неавторизованных пользователей)
  const maskPhone = (phone, isAuthenticated) => {
    if (!phone) return 'Не указан';
    
    if (isAuthenticated) {
      // Показываем полный телефон авторизованному пользователю
      return phone;
    } else {
      // Маскируем для неавторизованных
      // Оставляем последние 4 цифры
      const visibleDigits = 4;
      const phoneLength = phone.length;
      if (phoneLength <= visibleDigits) return phone;
      
      const maskedPart = '*'.repeat(phoneLength - visibleDigits);
      const visiblePart = phone.slice(-visibleDigits);
      return `${maskedPart}${visiblePart}`;
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загружаем информацию о животном...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Животное не найдено'}
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={handleGoBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Вернуться назад
        </button>
      </div>
    );
  }

  // Фильтруем фотографии (убираем null)
  const validPhotos = pet.photos ? pet.photos.filter(photo => photo !== null) : [];

  return (
    <div className="container py-5">
      <button 
        className="btn btn-outline-secondary mb-4"
        onClick={handleGoBack}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Назад к списку
      </button>

      <div className="card">
        <div className="row g-0">
          {/* Левая часть - фотографии */}
          <div className="col-md-6">
            {validPhotos.length > 0 ? (
              <div id="petCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {validPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    >
                      <img 
                        src={getImageUrl(photo)} 
                        className="d-block w-100 rounded-start"
                        alt={`${pet.kind} - фото ${index + 1}`}
                        style={{ height: '500px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://placebear.com/g/800/500';
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {validPhotos.length > 1 && (
                  <>
                    <button 
                      className="carousel-control-prev" 
                      type="button" 
                      data-bs-target="#petCarousel" 
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Предыдущее</span>
                    </button>
                    <button 
                      className="carousel-control-next" 
                      type="button" 
                      data-bs-target="#petCarousel" 
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Следующее</span>
                    </button>
                    
                    {/* Индикаторы */}
                    <div className="carousel-indicators">
                      {validPhotos.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          data-bs-target="#petCarousel"
                          data-bs-slide-to={index}
                          className={index === 0 ? 'active' : ''}
                          aria-label={`Slide ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <img 
                src="https://placebear.com/g/800/500" 
                className="img-fluid rounded-start w-100"
                alt={pet.kind}
                style={{ height: '500px', objectFit: 'cover' }}
              />
            )}
          </div>
          
          {/* Правая часть - информация */}
          <div className="col-md-6">
            <div className="card-body h-100 d-flex flex-column">
              <h3 className="card-title">{pet.kind}</h3>
              
              <div className="mb-3">
                <h5>Описание:</h5>
                <p className="card-text">{pet.description || 'Описание отсутствует'}</p>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="pet-feature mb-3">
                    <i className="bi bi-upc-scan"></i>
                    <div>
                      <strong>Номер чипа/марки:</strong>
                      <p className="mb-0">{pet.mark || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="pet-feature mb-3">
                    <i className="bi bi-geo-alt"></i>
                    <div>
                      <strong>Район находки:</strong>
                      <p className="mb-0">{pet.district || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="pet-feature mb-3">
                    <i className="bi bi-calendar"></i>
                    <div>
                      <strong>Дата находки:</strong>
                      <p className="mb-0">{formatDate(pet.date)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="pet-feature mb-3">
                    <i className="bi bi-person"></i>
                    <div>
                      <strong>Нашедший:</strong>
                      <p className="mb-0">{pet.name || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="pet-feature mb-3">
                    <i className="bi bi-telephone"></i>
                    <div>
                      <strong>Телефон:</strong>
                      <p className="mb-0">{maskPhone(pet.phone, !!user)}</p>
                    </div>
                  </div>
                  
                  {pet.email && (
                    <div className="pet-feature mb-3">
                      <i className="bi bi-envelope"></i>
                      <div>
                        <strong>Email:</strong>
                        <p className="mb-0">{pet.email}</p>
                      </div>
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

export default PetDetailsPage;