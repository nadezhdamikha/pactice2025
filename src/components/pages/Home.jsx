import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ showNotification }) => {
  const [email, setEmail] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Данные для слайдера
  const sliderPets = [
    { 
      id: 1, 
      kind: "собака", 
      description: "Крупная собака, найденная в парке. Дружелюбный, откликается на кличку Рекс.", 
      name: "Иван", 
      district: "Приморский" 
    },
    { 
      id: 2, 
      kind: "кошка", 
      description: "Белая пушистая кошка с голубыми глазами. Найдена возле метро.", 
      name: "Анна", 
      district: "Выборгский" 
    },
    { 
      id: 3, 
      kind: "хомяк", 
      description: "Маленький хомяк в клетке, найденный у подъезда.", 
      name: "Петр", 
      district: "Калининский" 
    }
  ];

  // Данные для карточек
  const homePets = [
    { 
      id: 1, 
      name: "Иван", 
      kind: "собака", 
      description: "Крупная собака, найденная в парке. Дружелюбный, откликается на кличку Рекс.", 
      mark: "CA-001-SPB", 
      district: "Приморский", 
      date: "2023-10-15" 
    },
    { 
      id: 2, 
      name: "Анна", 
      kind: "кошка", 
      description: "Белая пушистая кошка с голубыми глазами. Найдена возле метро.", 
      mark: "VL-0214", 
      district: "Выборгский", 
      date: "2023-10-12" 
    },
    { 
      id: 3, 
      name: "Петр", 
      kind: "хомяк", 
      description: "Маленький хомяк в клетке, найденный у подъезда.", 
      mark: "HM-003-SPB", 
      district: "Калининский", 
      date: "2023-10-08" 
    },
    { 
      id: 4, 
      name: "Ольга", 
      kind: "собака", 
      description: "Маленькая собака породы чихуахуа. Найдена в торговом центре.", 
      mark: "CH-004-SPB", 
      district: "Центральный", 
      date: "2023-10-14" 
    },
    { 
      id: 5, 
      name: "Сергей", 
      kind: "кролик", 
      description: "Белый кролик с длинными ушами. Найден в сквере.", 
      mark: "RB-005-SPB", 
      district: "Василеостровский", 
      date: "2023-10-13" 
    },
    { 
      id: 6, 
      name: "Мария", 
      kind: "кошка", 
      description: "Черная кошка с желтыми глазами. Найдена в подвале.", 
      mark: "CT-006-SPB", 
      district: "Московский", 
      date: "2023-10-11" 
    }
  ];

  // Функции для слайдера
  const nextSlide = () => {
    setCurrentSlide(prev => prev < sliderPets.length - 1 ? prev + 1 : 0);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev > 0 ? prev - 1 : sliderPets.length - 1);
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Валидация email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Подписка на рассылку
  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      showNotification('Введите корректный email', 'danger');
      return;
    }
    
    setSubscriptionSuccess(true);
    showNotification('Спасибо за подписку!', 'success');
    setEmail('');
    
    // Сброс через 5 секунд
    setTimeout(() => {
      setSubscriptionSuccess(false);
    }, 5000);
  };

  // Переход к деталям животного
  const handlePetDetails = (petId) => {
    navigate(`/pet/${petId}`);
  };

  return (
    <div className="home-page">
      {/* 1. Герой секция */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">GET PET BACK</h1>
          <p className="hero-subtitle">Помогаем вернуть домой потерянных домашних животных</p>
          <p className="lead">
            Наш сайт создан для поиска и воссоединения хозяев с их питомцами. 
            Если вы нашли животное или потеряли своего любимца - вы в нужном месте!
          </p>
        </div>
      </section>

      {/* 2. Слайдер с животными */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center section-title">Животные, у которых были найдены хозяева</h2>
          
          <div className="slider-container">
            <div className="slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {sliderPets.map((pet, index) => (
                <div key={pet.id} className="slider-item">
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <img 
                        src={`https://placebear.com/g/500/400`} 
                        className="img-fluid rounded shadow" 
                        alt={pet.kind} 
                      />
                    </div>
                    <div className="col-md-7">
                      <h3>{pet.kind}</h3>
                      <p>{pet.description}</p>
                      <div className="pet-feature">
                        <i className="bi bi-person"></i>
                        <span><strong>Нашедший:</strong> {pet.name}</span>
                      </div>
                      <div className="pet-feature">
                        <i className="bi bi-geo-alt"></i>
                        <span><strong>Район:</strong> {pet.district}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="slider-controls">
              <button onClick={prevSlide}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button onClick={nextSlide}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Карточки животных */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          
          <div className="row" id="home-pets-container">
            {homePets.map(pet => (
              <div key={pet.id} className="col-md-6 col-lg-4 mb-4 fade-in">
                <div className="card h-100 pet-card">
                  <div className="position-relative">
                    <img 
                      src={`https://placebear.com/g/500/400`} 
                      className="card-img-top" 
                      alt={pet.kind} 
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{pet.kind}</h5>
                    <p className="card-text">
                      {pet.description.substring(0, 100)}...
                    </p>
                    
                    <div className="pet-feature">
                      <i className="bi bi-tag"></i>
                      <span><strong>Тип животного:</strong> {pet.kind}</span>
                    </div>
                    
                    {pet.mark && (
                      <div className="pet-feature">
                        <i className="bi bi-upc-scan"></i>
                        <span><strong>Номер чипа:</strong> {pet.mark}</span>
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

                    <button 
                      className="btn btn-outline-primary w-100 btn-animate" 
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

      {/* 4. Подписка на новости */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <h3 className="text-center section-title">Подпишитесь на новости</h3>
              
              {subscriptionSuccess ? (
                <div className="alert alert-success text-center">
                  <i className="bi bi-check-circle me-2"></i>
                  Спасибо за подписку!
                </div>
              ) : (
                <form id="subscription-form" onSubmit={handleSubscribe}>
                  <div className="input-group">
                    <input 
                      type="email" 
                      id="subscription-email" 
                      className="form-control" 
                      placeholder="Ваш email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-primary" type="submit">
                      Подписаться
                    </button>
                  </div>
                  <div className="form-text text-center mt-2">
                    Будем отправлять уведомления о новых найденных животных в вашем районе
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;