import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PetsCardsSection = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных с API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://pets.сделай.site/api/pets');
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Согласно API, данные находятся в data.data.orders
        if (data.data && Array.isArray(data.data.orders)) {
          // Сортируем по дате (по убыванию - самые новые первыми)
          const sortedPets = [...data.data.orders].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // По убыванию
          });
          
          // Берем только первые 6 записей (самые новые)
          setPets(sortedPets.slice(0, 6));
        } else {
          setPets([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке карточек животных:', error);
        setError('Не удалось загрузить информацию о животных');
        setPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Функция для получения полного URL изображения
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placebear.com/g/500/400';
    
    // Если путь уже полный URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Если путь относительный, добавляем базовый URL
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

  // Переход к деталям животного
  const handlePetDetails = (petId) => {
    navigate(`/pet/${petId}`);
  };

  // Маскирование телефона (если требуется)
  const maskPhone = (phone) => {
    if (!phone) return 'Не указан';
    // Оставляем последние 4 цифры, остальное заменяем на *
    return phone.replace(/(\d{4})$/, '****$1');
  };

  if (isLoading) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Загружаем информацию о найденных животных...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="alert alert-warning text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (pets.length === 0) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="alert alert-info text-center">
            <i className="bi bi-info-circle me-2"></i>
            На данный момент нет животных, ищущих хозяев
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
        <p className="text-center mb-4">Последние найденные животные</p>
        
        <div className="row" id="home-pets-container">
          {pets.map(pet => (
            <div key={pet.id} className="col-md-6 col-lg-4 mb-4 fade-in">
              <div className="card h-100 pet-card">
                <div className="position-relative">
                  <img 
                    src={getImageUrl(pet.photo)} 
                    className="card-img-top" 
                    alt={pet.kind}
                    onError={(e) => {
                      e.target.src = 'https://placebear.com/g/500/400';
                      e.target.onerror = null;
                    }}
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  {pet.registred && (
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Зарегистрировано
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{pet.kind}</h5>
                  <p className="card-text">
                    {pet.description && pet.description.length > 100 
                      ? `${pet.description.substring(0, 100)}...` 
                      : pet.description || 'Описание отсутствует'}
                  </p>
                  
                  <div className="pet-feature">
                    <i className="bi bi-tag"></i>
                    <span><strong>Тип животного:</strong> {pet.kind}</span>
                  </div>
                  
                  {pet.mark && pet.mark.trim() && (
                    <div className="pet-feature">
                      <i className="bi bi-upc-scan"></i>
                      <span><strong>Номер чипа/марки:</strong> {pet.mark}</span>
                    </div>
                  )}
                  
                  <div className="pet-feature">
                    <i className="bi bi-person"></i>
                    <span><strong>Нашедший:</strong> {pet.name}</span>
                  </div>
                  
                  <div className="pet-feature">
                    <i className="bi bi-geo-alt"></i>
                    <span><strong>Район:</strong> {pet.district}</span>
                  </div>
                  
                  <div className="pet-feature">
                    <i className="bi bi-calendar"></i>
                    <span><strong>Дата находки:</strong> {formatDate(pet.date)}</span>
                  </div>

                  {pet.phone && (
                    <div className="pet-feature">
                      <i className="bi bi-telephone"></i>
                      <span><strong>Телефон:</strong> {maskPhone(pet.phone)}</span>
                    </div>
                  )}

                  <button 
                    className="btn btn-outline-primary w-100 btn-animate mt-3" 
                    onClick={() => handlePetDetails(pet.id)}
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetsCardsSection;