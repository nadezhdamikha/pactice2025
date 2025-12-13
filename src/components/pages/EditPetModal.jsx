// src/components/pages/EditPetModal.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'https://pets.xn--80ahdri7a.site';

const EditPetModal = ({ pet, token, onClose, onSuccess, showNotification }) => {
  const [formData, setFormData] = useState({
    description: pet.description || '',
    mark: pet.mark || ''
  });
  const [photos, setPhotos] = useState({
    photo1: null,
    photo2: null,
    photo3: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleFileChange = (e, photoNumber) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка формата PNG
      if (!file.name.toLowerCase().endsWith('.png')) {
        setErrors(prev => ({
          ...prev,
          [`photo${photoNumber}`]: 'Фото должно быть в формате PNG'
        }));
        return;
      }
      
      setPhotos(prev => ({
        ...prev,
        [`photo${photoNumber}`]: file
      }));
      
      if (errors[`photo${photoNumber}`]) {
        setErrors(prev => ({ ...prev, [`photo${photoNumber}`]: '' }));
      }
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание';
    } else if (formData.description.length < 10 || formData.description.length > 1000) {
      newErrors.description = 'Описание должно содержать от 10 до 1000 символов';
    }
    
    // Проверка номера чипа если заполнен
    if (formData.mark.trim() && !/^[A-Za-z0-9\-]+$/.test(formData.mark)) {
      newErrors.mark = 'Номер чипа может содержать только латинские буквы, цифры и дефисы';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      showNotification('Пожалуйста, исправьте ошибки в форме', 'danger');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Добавляем текстовые поля
      submitData.append('description', formData.description);
      if (formData.mark.trim()) {
        submitData.append('mark', formData.mark);
      }
      
      // Добавляем фото если есть новые
      if (photos.photo1) submitData.append('photo1', photos.photo1);
      if (photos.photo2) submitData.append('photo2', photos.photo2);
      if (photos.photo3) submitData.append('photo3', photos.photo3);
      
      console.log('Отправляю данные для редактирования:', {
        description: formData.description,
        mark: formData.mark,
        hasPhoto1: !!photos.photo1,
        hasPhoto2: !!photos.photo2,
        hasPhoto3: !!photos.photo3
      });
      
      const response = await fetch(`${API_BASE_URL}/api/pets/${pet.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData,
      });
      
      console.log('Статус ответа:', response.status);
      
      // Читаем ответ как текст для отладки
      const responseText = await response.text();
      console.log('Текст ответа:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('JSON ответа:', data);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError, 'Текст:', responseText);
        // Если не JSON, но статус 200, считаем успехом
        if (response.ok) {
          console.log('Не JSON, но статус 200 - считаем успехом');
          onSuccess();
          return;
        } else {
          throw new Error(`Некорректный ответ сервера: ${responseText}`);
        }
      }
      
      if (response.ok) {
        // Успешные статусы: 200, 201, 204 и т.д.
        console.log('Редактирование успешно, данные:', data);
        onSuccess();
      } else if (response.status === 401) {
        setServerError('Сессия истекла. Войдите снова.');
        showNotification('Сессия истекла. Войдите снова.', 'warning');
        setTimeout(() => onClose(), 2000);
      } else if (response.status === 403) {
        setServerError('Недостаточно прав для редактирования этого объявления');
        showNotification('Недостаточно прав для редактирования этого объявления', 'danger');
      } else if (response.status === 422) {
        const errorMsg = data.error?.message || data.message || 'Ошибка валидации';
        setServerError(errorMsg);
        showNotification(errorMsg, 'danger');
      } else {
        const errorMsg = data.error?.message || data.message || `Ошибка сервера: ${response.status}`;
        setServerError(errorMsg);
        showNotification(errorMsg, 'danger');
      }
    } catch (error) {
      console.error('Ошибка при редактировании объявления:', error);
      const errorMsg = error.message || 'Произошла ошибка при обновлении объявления';
      setServerError(errorMsg);
      showNotification(errorMsg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Редактировать объявление</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {serverError && (
              <div className="alert alert-danger">
                <strong>Ошибка сервера:</strong> {serverError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Вид животного</label>
                <input
                  type="text"
                  className="form-control"
                  value={pet.kind}
                  readOnly
                  disabled
                />
                <div className="form-text">Вид животного нельзя изменить</div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Район</label>
                <input
                  type="text"
                  className="form-control"
                  value={pet.district}
                  readOnly
                  disabled
                />
                <div className="form-text">Район нельзя изменить</div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="mark" className="form-label">Номер чипа/клеймо</label>
                <input
                  type="text"
                  className={`form-control ${errors.mark ? 'is-invalid' : ''}`}
                  id="mark"
                  name="mark"
                  value={formData.mark}
                  onChange={handleInputChange}
                  placeholder="Например: VL-0214"
                />
                {errors.mark && <div className="invalid-feedback">{errors.mark}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Описание <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                <div className="form-text">Минимум 10 символов, максимум 1000 символов</div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Фотографии животного</label>
                <div className="alert alert-info">
                  <small><i className="bi bi-info-circle" /> Загружайте новые фотографии только если хотите заменить старые. Все фотографии должны быть в формате PNG</small>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="photo1" className="form-label">
                      Фото 1 {photos.photo1 && <span className="text-success">(новое)</span>}
                    </label>
                    <input
                      type="file"
                      className={`form-control ${errors.photo1 ? 'is-invalid' : ''}`}
                      id="photo1"
                      accept=".png"
                      onChange={(e) => handleFileChange(e, 1)}
                    />
                    {errors.photo1 && <div className="invalid-feedback">{errors.photo1}</div>}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="photo2" className="form-label">
                      Фото 2 {photos.photo2 && <span className="text-success">(новое)</span>}
                    </label>
                    <input
                      type="file"
                      className={`form-control ${errors.photo2 ? 'is-invalid' : ''}`}
                      id="photo2"
                      accept=".png"
                      onChange={(e) => handleFileChange(e, 2)}
                    />
                    {errors.photo2 && <div className="invalid-feedback">{errors.photo2}</div>}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="photo3" className="form-label">
                      Фото 3 {photos.photo3 && <span className="text-success">(новое)</span>}
                    </label>
                    <input
                      type="file"
                      className={`form-control ${errors.photo3 ? 'is-invalid' : ''}`}
                      id="photo3"
                      accept=".png"
                      onChange={(e) => handleFileChange(e, 3)}
                    />
                    {errors.photo3 && <div className="invalid-feedback">{errors.photo3}</div>}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Сохранение...
                    </>
                  ) : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPetModal;