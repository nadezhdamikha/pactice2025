import React, { useState } from 'react';

const NewsletterSection = ({ showNotification }) => {
  const [email, setEmail] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Валидация email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Подписка на рассылку через API
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Сброс предыдущих ошибок
    setError(null);
    setValidationErrors({});
    
    // Клиентская валидация
    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      showNotification('Пожалуйста, введите email', 'danger');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Введите корректный email адрес');
      showNotification('Введите корректный email адрес', 'danger');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('https://pets.сделай.site/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      if (response.status === 204) {
        // Успешная подписка (No Content)
        setSubscriptionSuccess(true);
        setEmail('');
        showNotification('Спасибо за подписку! Вы будете получать уведомления о новых найденных животных.', 'success');
      } else if (response.status === 422) {
        // Ошибка валидации
        const errorData = await response.json();
        
        if (errorData.error && errorData.error.errors) {
          setValidationErrors(errorData.error.errors);
          
          // Показываем первую ошибку
          const firstErrorKey = Object.keys(errorData.error.errors)[0];
          const firstErrorMessage = errorData.error.errors[firstErrorKey]?.[0];
          
          if (firstErrorMessage) {
            setError(firstErrorMessage);
            showNotification(firstErrorMessage, 'danger');
          } else {
            setError('Ошибка валидации данных');
            showNotification('Ошибка валидации данных', 'danger');
          }
        } else if (errorData.message) {
          setError(errorData.message);
          showNotification(errorData.message, 'danger');
        } else {
          setError('Ошибка при валидации данных');
          showNotification('Ошибка при валидации данных', 'danger');
        }
      } else {
        // Другие ошибки
        let errorMessage = `Ошибка сервера: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Если ответ не в JSON формате
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        }
        
        setError(errorMessage);
        showNotification(errorMessage, 'danger');
      }
    } catch (error) {
      console.error('Ошибка сети при подписке:', error);
      setError('Ошибка сети. Пожалуйста, проверьте соединение.');
      showNotification('Ошибка сети. Пожалуйста, проверьте соединение.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс формы
  const handleReset = () => {
    setSubscriptionSuccess(false);
    setEmail('');
    setError(null);
    setValidationErrors({});
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <h2 className="text-center section-title mb-4">Подпишитесь на новости</h2>
            <p className="text-center mb-4">
              Получайте уведомления о новых найденных животных в вашем районе. 
              Мы будем отправлять только важную информацию о найденных питомцах.
            </p>
            
            {subscriptionSuccess ? (
              <div className="text-center">
                <div className="alert alert-success">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
                    <div>
                      <h5 className="alert-heading">Вы успешно подписались!</h5>
                      <p className="mb-0">
                        На email <strong>{email}</strong> будут приходить уведомления о новых найденных животных.
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={handleReset}
                >
                  <i className="bi bi-envelope-plus me-2"></i>
                  Подписать другой email
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form id="subscription-form" onSubmit={handleSubscribe} noValidate>
                  <div className="mb-3">
                    <label htmlFor="subscription-email" className="form-label">
                      Email адрес <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="subscription-email" 
                      className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                      placeholder="Ваш email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Очищаем ошибку при вводе
                        if (validationErrors.email || error) {
                          setValidationErrors({});
                          setError(null);
                        }
                      }}
                      disabled={isLoading}
                      required
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email[0]}
                      </div>
                    )}

                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-lg" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Отправка...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope-check me-2"></i>
                          Подписаться на новости
                        </>
                      )}
                    </button>
                  </div>

                </form>
                

              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;