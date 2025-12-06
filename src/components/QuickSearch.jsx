// src/components/search/QuickSearch.jsx
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

  // Функция для получения подсказок с сервера
  const fetchSuggestions = async (query) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://pets.сделай.site/api/search?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        if (response.status === 204) {
          // Нет результатов (статус 204)
          setSuggestions([]);
        } else {
          const data = await response.json();
          if (data.data && Array.isArray(data.data.orders)) {
            setSuggestions(data.data.orders);
          } else {
            setSuggestions([]);
          }
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
      setShowSuggestions(true);
    }
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Если запрос меньше 4 символов, сразу скрываем подсказки
    if (query.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Функция для обработки поиска (переход на страницу поиска)
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  // Функция для получения короткого описания
  const getShortDescription = (description) => {
    if (!description) return 'Нет описания';
    if (description.length > 60) {
      return description.substring(0, 60) + '...';
    }
    return description;
  };

  // Функция для выделения совпадающего текста (с экранированием специальных символов)
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    // Экранируем специальные символы в запросе для RegExp
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="position-relative">
      <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
        <div className="position-relative">
          <input
            ref={searchInputRef}
            className="form-control me-2"
            type="search"
            placeholder="Поиск по описанию..."
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (suggestions.length > 0 || searchQuery.length > 3) {
                setShowSuggestions(true);
              }
            }}
          />
          {isLoading && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          )}
          {searchQuery.length > 0 && searchQuery.length < 4 && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <small className="text-muted">Введите минимум 4 символа</small>
            </div>
          )}
        </div>
        <button 
          className="btn btn-primary" 
          type="button"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          Поиск
        </button>
      </form>

      {/* Выпадающий список с подсказками */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="position-absolute top-100 start-0 end-0 mt-1 bg-white rounded shadow-lg border"
          style={{ zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
        >
          <div className="p-2 border-bottom bg-light">
            <small className="text-muted">
              Найдено {suggestions.length} {suggestions.length === 1 ? 'результат' : 
              suggestions.length > 1 && suggestions.length < 5 ? 'результата' : 'результатов'}
            </small>
          </div>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 border-bottom hover-bg-light cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
            >
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <strong className="text-primary">{suggestion.kind}</strong>
                    <small className="text-muted">
                      {suggestion.date ? new Date(suggestion.date).toLocaleDateString('ru-RU') : 'Не указана'}
                    </small>
                  </div>
                  <div 
                    className="text-muted small mb-1"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(getShortDescription(suggestion.description), searchQuery) 
                    }}
                  />
                  <div className="d-flex flex-wrap gap-2 small">
                    {suggestion.mark && suggestion.mark.trim() && (
                      <span className="badge bg-secondary">
                        <i className="bi bi-tag me-1"></i> {suggestion.mark}
                      </span>
                    )}
                    {suggestion.district && suggestion.district.trim() && (
                      <span className="badge bg-info text-dark">
                        <i className="bi bi-geo-alt me-1"></i> {suggestion.district}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="p-2 border-top text-center">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={handleSearch}
            >
              <i className="bi bi-search me-1"></i>
              Показать все результаты
            </button>
          </div>
        </div>
      )}

      {showSuggestions && searchQuery.length > 3 && suggestions.length === 0 && !isLoading && (
        <div 
          ref={suggestionsRef}
          className="position-absolute top-100 start-0 end-0 mt-1 bg-white rounded shadow-lg border p-3"
          style={{ zIndex: 1050 }}
        >
          <div className="text-center text-muted">
            <i className="bi bi-search display-6 mb-2"></i>
            <p className="mb-0">Ничего не найдено по запросу "{searchQuery}"</p>
            <small>Попробуйте изменить запрос</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;