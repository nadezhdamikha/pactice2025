import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    district: '',
    kind: ''
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [districts, setDistricts] = useState([]);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const sampleDistricts = [
      'Адмиралтейский',
      'Василеостровский',
      'Выборгский',
      'Калининский',
      'Кировский',
      'Колпинский',
      'Красногвардейский',
      'Красносельский',
      'Кронштадтский',
      'Курортный',
      'Московский',
      'Невский',
      'Петроградский',
      'Петродворцовый',
      'Приморский',
      'Пушкинский',
      'Фрунзенский',
      'Центральный'
  ];
    const uniqueDistricts = [...new Set(sampleDistricts)].sort();
    setDistricts(uniqueDistricts);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const district = params.get('district') || '';
    const kind = params.get('kind') || '';
    const page = parseInt(params.get('page')) || 1;
    
    setSearchParams({ district, kind });
    setCurrentPage(page);
    
    if (district || kind) {
      performSearch({ district, kind, page });
    }
  }, [location.search]);

  const performSearch = async (params = searchParams, page = currentPage) => {
    if (!params.district && !params.kind) {
      setError('Введите хотя бы один параметр для поиска');
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params.district) queryParams.append('district', params.district);
      if (params.kind) queryParams.append('kind', params.kind);
      
      const response = await fetch(`https://pets.сделай.site/api/search/order?${queryParams.toString()}`);
      
      console.log('Search response:', response.status); // Отладка
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search data:', data); // Отладка
        
        if (data.data && Array.isArray(data.data.orders)) {
          const allResults = data.data.orders;
          setTotalResults(allResults.length);
          
          const totalPages = Math.ceil(allResults.length / itemsPerPage);
          setTotalPages(totalPages);
          
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedResults = allResults.slice(startIndex, endIndex);
          
          setResults(paginatedResults);
        } else {
          setResults([]);
          setTotalResults(0);
          setTotalPages(0);
        }
      } else {
        setError(`Ошибка сервера: ${response.status}`);
        setResults([]);
      }
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setError('Ошибка сети. Пожалуйста, проверьте соединение.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения URL изображения - исправлена!
  const getImageUrl = (photo) => {
    console.log('Getting image URL for:', photo); // Отладка
    
    if (!photo) {
      console.log('No photo provided, using fallback');
      return 'https://placebear.com/400/300';
    }
    
    // Проверяем, это уже полный URL?
    if (photo.startsWith('http')) {
      console.log('Already full URL:', photo);
      return photo;
    }
    
    // Проверяем, начинается ли с /storage/images/
    if (photo.startsWith('/storage/images/')) {
      const fullUrl = `https://pets.сделай.site${photo}`;
      console.log('Building URL from relative path:', fullUrl);
      return fullUrl;
    }
    
    // Если путь просто начинается с /, добавляем домен
    if (photo.startsWith('/')) {
      const fullUrl = `https://pets.сделай.site${photo}`;
      console.log('Building URL from root path:', fullUrl);
      return fullUrl;
    }
    
    // В остальных случаях добавляем домен и /storage/images/
    const fullUrl = `https://pets.сделай.site/storage/images/${photo}`;
    console.log('Building default URL:', fullUrl);
    return fullUrl;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    if (searchParams.district) queryParams.append('district', searchParams.district);
    if (searchParams.kind) queryParams.append('kind', searchParams.kind);
    
    navigate(`/search?${queryParams.toString()}`);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', page);
    navigate(`/search?${queryParams.toString()}`);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearchParams({ district: '', kind: '' });
    setResults([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
    setError(null);
    navigate('/search');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      return dateString;
    }
  };

  const handlePetDetails = (petId) => {
    navigate(`/pet/${petId}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(i)}
            disabled={currentPage === i}
          >
            {i}
          </button>
        </li>
      );
    }
    
    return pages;
  };

  return (
    <div className="search-page">
      <div className="container py-5">
        <h1 className="text-center mb-4">Поиск животных</h1>
        
        <div className="card mb-5">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="district" className="form-label">Район</label>
                  <select
                    id="district"
                    name="district"
                    className="form-select"
                    value={searchParams.district}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите район...</option>
                    {districts.map((district, index) => (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">Поиск по полному соответствию</div>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="kind" className="form-label">Вид животного</label>
                  <input
                    type="text"
                    id="kind"
                    name="kind"
                    className="form-control"
                    placeholder="Например: кошка, собака..."
                    value={searchParams.kind}
                    onChange={handleInputChange}
                  />
                  <div className="form-text">Поиск по частичному соответствию</div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isLoading || (!searchParams.district && !searchParams.kind)}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Поиск...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i>
                          Найти животных
                        </>
                      )}
                    </button>
                    
                    {(searchParams.district || searchParams.kind || results.length > 0) && (
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={handleReset}
                        disabled={isLoading}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Сбросить фильтры
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Ищем животных...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Результаты поиска</h3>
              <div>
                <span className="badge bg-primary me-2">
                  Найдено: {totalResults} животных
                </span>
                <span className="badge bg-secondary">
                  Страница {currentPage} из {totalPages}
                </span>
              </div>
            </div>

            <div className="row">
              {results.map((pet) => {
                // photos - это СТРОКА, а не массив!
                const photoUrl = pet.photos ? getImageUrl(pet.photos) : null;
                
                return (
                  <div key={pet.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 pet-card">
                      <div className="position-relative">
                        <img 
                          src={photoUrl || 'https://placebear.com/400/300'} 
                          className="card-img-top" 
                          alt={pet.kind || 'Животное'}
                          style={{ height: '250px', objectFit: 'cover' }}
                          onError={(e) => {
                            console.log('Error loading image:', e.target.src);
                            e.target.src = 'https://placebear.com/400/300';
                            e.target.onerror = null;
                          }}
                          onLoad={() => console.log('Image loaded:', photoUrl)}
                        />
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">{pet.kind || 'Не указан'}</h5>
                        <p className="card-text">
                          {pet.description && pet.description.length > 100 
                            ? `${pet.description.substring(0, 100)}...` 
                            : pet.description || 'Описание отсутствует'}
                        </p>
                        
                        <div className="pet-feature">
                          <i className="bi bi-tag"></i>
                          <span><strong>Тип животного:</strong> {pet.kind || 'Не указан'}</span>
                        </div>
                        
                        {pet.mark && pet.mark.trim() && (
                          <div className="pet-feature">
                            <i className="bi bi-upc-scan"></i>
                            <span><strong>Номер чипа:</strong> {pet.mark}</span>
                          </div>
                        )}
                        
                        <div className="pet-feature">
                          <i className="bi bi-person"></i>
                          <span><strong>Нашедший:</strong> {pet.name || 'Не указан'}</span>
                        </div>
                        
                        <div className="pet-feature">
                          <i className="bi bi-geo-alt"></i>
                          <span><strong>Район:</strong> {pet.district || 'Не указан'}</span>
                        </div>
                        
                        <div className="pet-feature">
                          <i className="bi bi-calendar"></i>
                          <span><strong>Дата находки:</strong> {formatDate(pet.date)}</span>
                        </div>

                        {pet.phone && (
                          <div className="pet-feature">
                            <i className="bi bi-telephone"></i>
                            <span><strong>Телефон:</strong> {pet.phone}</span>
                          </div>
                        )}

                        <button 
                          className="btn btn-outline-primary w-100 mt-3" 
                          onClick={() => handlePetDetails(pet.id)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Навигация по страницам" className="mt-5">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i> Назад
                    </button>
                  </li>
                  
                  {renderPageNumbers()}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Вперед <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
                
                <div className="text-center mt-2 text-muted">
                  Показано {Math.min(currentPage * itemsPerPage, totalResults)} из {totalResults} результатов
                </div>
              </nav>
            )}
          </>
        ) : (searchParams.district || searchParams.kind) ? (
          <div className="text-center py-5">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              По вашему запросу ничего не найдено.
              <div className="mt-3">
                {searchParams.district && (
                  <div>
                    <strong>Район:</strong> {searchParams.district}
                  </div>
                )}
                {searchParams.kind && (
                  <div>
                    <strong>Вид животного:</strong> {searchParams.kind}
                  </div>
                )}
              </div>
              <div className="mt-3">
                Попробуйте изменить параметры поиска.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="alert alert-light">
              <i className="bi bi-search display-4 text-muted mb-3"></i>
              <h4 className="text-muted">Начните поиск животных</h4>
              <p className="text-muted">
                Выберите район и/или введите вид животного для поиска
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;