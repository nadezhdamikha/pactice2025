import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Встроенный кастомный хук useDebounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const QuickSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Используем встроенный хук useDebounce с задержкой 1000ms
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Эффект для выполнения поиска при изменении debounced значения
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length > 3) {
        await fetchSuggestions(debouncedSearchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Функция для получения подсказок с сервера и удаления дубликатов
  const fetchSuggestions = async (query) => {
    try {
      setIsLoading(true);
      setShowSuggestions(true);
      
      const response = await fetch(`https://pets.сделай.site/api/search?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data.orders) && data.data.orders.length > 0) {
          // Удаляем дубликаты по ID с помощью Map
          const uniqueOrders = Array.from(
            new Map(data.data.orders.map(order => [order.id, order])).values()
          );
          
          // Убираем дубликаты по описанию с помощью Set
          const seenDescriptions = new Set();
          const filteredOrders = uniqueOrders.filter(order => {
            if (!order.description) return true;
            
            const normalizedDesc = order.description.trim().toLowerCase();
            if (seenDescriptions.has(normalizedDesc)) {
              return false;
            }
            seenDescriptions.add(normalizedDesc);
            return true;
          });
          
          // Ограничиваем 5 результатами
          const limitedResults = filteredOrders.slice(0, 5);
          setSuggestions(limitedResults);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Функция для обработки поиска
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?kind=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  // Обработчик нажатия Enter в поле поиска
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Обработчик клика по подсказке
  const handleSuggestionClick = (suggestion) => {
    navigate(`/pet/${suggestion.id}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для выделения совпадающего текста
  const highlightMatch = (text, query) => {
    if (!text || !query) return text || '';
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return (text || '').replace(regex, '<mark>$1</mark>');
  };

  // Функция для отображения подсказки (только описание)
  const renderSuggestion = (suggestion) => {
    return (
      <div
        key={suggestion.id}
        className="p-2 border-bottom hover-bg-light cursor-pointer"
        onClick={() => handleSuggestionClick(suggestion)}
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
      >
        {/* Только описание животного */}
        {suggestion.description && (
          <div className="text-muted small">
            <span dangerouslySetInnerHTML={{ 
              __html: highlightMatch(suggestion.description, searchQuery) 
            }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="position-relative w-100">
      <form className="d-flex w-100" onSubmit={(e) => e.preventDefault()}>
        <div className="position-relative flex-grow-1 w-100">
          <input
            ref={searchInputRef}
            className="form-control w-100"
            type="search"
            placeholder="Поиск по описанию..."
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (suggestions.length > 0 && searchQuery.length > 3) {
                setShowSuggestions(true);
              }
            }}
            style={{ width: '100%' }}
          />
          
          {/* Сообщение о минимальной длине */}
          {searchQuery.length > 0 && searchQuery.length < 4 && !showSuggestions && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <small className="text-muted">Введите минимум 4 символа</small>
            </div>
          )}
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="btn btn-primary ms-2 flex-shrink-0" 
          type="button"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <i className="bi bi-search me-1"></i>
          Найти
        </button>
      </form>

      {/* Выпадающий список с подсказками */}
      {showSuggestions && searchQuery.length > 3 && (
        <div 
          ref={suggestionsRef}
          className="position-absolute top-100 start-0 end-0 mt-1 bg-white rounded shadow-lg border"
          style={{ 
            zIndex: 1050, 
            maxHeight: '250px', // Уменьшил высоту для 5 элементов
            overflowY: 'auto',
            width: '100%' // Добавил ширину 100% для адаптивности
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span className="text-muted">Ищем совпадения...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>

              {suggestions.map(renderSuggestion)}
              <div className="p-2 border-top text-center">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={handleSearch}
                >
                  <i className="bi bi-search me-1"></i>
                  Показать все результаты
                </button>
              </div>
            </>
          ) : (
            <div className="p-3 text-center text-muted">
              <i className="bi bi-search mb-2"></i>
              <p className="mb-0">Ничего не найдено по запросу "{searchQuery}"</p>
              <small>Попробуйте изменить запрос</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;