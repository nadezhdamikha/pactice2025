import React, { useState, useEffect } from 'react';

const SliderSection = () => {
  const [sliderPets, setSliderPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderError, setSliderError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Загрузка данных для слайдера с сервера
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        setIsLoading(true);
        setSliderError(null);
        
        const response = await fetch('https://pets.сделай.site/api/pets/slider');
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Согласно примеру ответа, данные находятся в data.data.pets
        if (data.data && Array.isArray(data.data.pets)) {
          setSliderPets(data.data.pets);
        } else {
          // Запасной вариант на случай изменения структуры ответа
          setSliderPets([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке слайдера:', error);
        setSliderError('Не удалось загрузить истории успеха');
        setSliderPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  // Функции для слайдера
  const nextSlide = () => {
    if (sliderPets.length > 0) {
      setCurrentSlide(prev => prev < sliderPets.length - 1 ? prev + 1 : 0);
    }
  };

  const prevSlide = () => {
    if (sliderPets.length > 0) {
      setCurrentSlide(prev => prev > 0 ? prev - 1 : sliderPets.length - 1);
    }
  };

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
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Если нет данных и не идет загрузка - не показываем секцию
  if (!isLoading && sliderPets.length === 0) {
    return null;
  }

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center section-title">Животные, у которых были найдены хозяева</h2>
        
        {isLoading ? (
          // Прелоадер во время загрузки
          <div className="slider-preloader text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Загружаем истории успешных возвращений...</p>
          </div>
        ) : sliderError ? (
          // Сообщение об ошибке
          <div className="alert alert-warning text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {sliderError}
          </div>
        ) : (
          // Слайдер с данными
          <div className="slider-container">
            <div className="slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {sliderPets.map((pet, index) => (
                <div key={pet.id} className="slider-item">
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <img 
                        src={getImageUrl(pet.image)} 
                        className="img-fluid rounded shadow" 
                        alt={pet.kind} 
                        onError={(e) => {
                          e.target.src = 'https://placebear.com/g/500/400';
                          e.target.onerror = null; // Предотвращаем бесконечный цикл
                        }}
                      />
                    </div>
                    <div className="col-md-7">
                      <h3>{pet.kind}</h3>
                      <p className="slider-description">{pet.description}</p>
                      
                      {/* Дополнительная информация, если есть в API */}
                      {pet.name && (
                        <div className="pet-feature">
                          <i className="bi bi-person"></i>
                          <span><strong>Нашедший:</strong> {pet.name}</span>
                        </div>
                      )}
                      
                      {pet.district && (
                        <div className="pet-feature">
                          <i className="bi bi-geo-alt"></i>
                          <span><strong>Район:</strong> {pet.district}</span>
                        </div>
                      )}
                      
                      {pet.date && (
                        <div className="pet-feature">
                          <i className="bi bi-calendar"></i>
                          <span><strong>Дата возвращения:</strong> {formatDate(pet.date)}</span>
                        </div>
                      )}
                      
                      {/* Показываем, что хозяин найден */}
                      <div className="alert alert-success mt-3" style={{display: 'inline-block'}}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Хозяин найден!
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sliderPets.length > 1 && (
              <>
                <div className="slider-controls">
                  <button onClick={prevSlide} className="slider-btn">
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button onClick={nextSlide} className="slider-btn">
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
                
                {/* Индикаторы слайдов */}
                <div className="slider-indicators">
                  {sliderPets.map((_, index) => (
                    <button
                      key={index}
                      className={`slider-indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Перейти к слайду ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SliderSection;