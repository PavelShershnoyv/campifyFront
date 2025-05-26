import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.scss';

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters = {} }) => {
  const [filters, setFilters] = useState({
    difficulty: currentFilters.difficulty || '',
    duration: currentFilters.duration || '',
    distance: currentFilters.distance || ''
  });

  const [distanceValue, setDistanceValue] = useState(0); // Значение слайдера дистанции

  // Обновляем локальные фильтры при изменении внешних
  useEffect(() => {
    setFilters({
      difficulty: currentFilters.difficulty || '',
      duration: currentFilters.duration || '',
      distance: currentFilters.distance || ''
    });
  }, [currentFilters]);

  // Обработчик изменения фильтров
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Применение фильтров
  const handleApply = () => {
    // Добавляем значение дистанции в фильтры
    const updatedFilters = {
      ...filters,
      distanceValue: distanceValue // Добавляем значение слайдера
    };
    onApplyFilters(updatedFilters);
    onClose();
  };

  // Сброс фильтров
  const handleReset = () => {
    const resetFilters = {
      difficulty: '',
      duration: '',
      distance: '',
      distanceValue: 0
    };
    setFilters({
      difficulty: '',
      duration: '',
      distance: ''
    });
    setDistanceValue(0);
    onApplyFilters(resetFilters);
  };

  // Закрытие модального окна при клике на фон
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Обработчик изменения слайдера дистанции
  const handleDistanceChange = (e) => {
    const value = parseInt(e.target.value);
    setDistanceValue(value);
    
    // Автоматически устанавливаем категорию дистанции на основе значения слайдера
    let distanceCategory = '';
    if (value <= 10) {
      distanceCategory = 'short';
    } else if (value <= 30) {
      distanceCategory = 'medium';
    } else {
      distanceCategory = 'long';
    }
    
    handleFilterChange('distance', distanceCategory);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Фильтры</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Фильтр по сложности */}
          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>
              <div className={styles.filterIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21L12 3L21 21H3Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className={styles.filterTitle}>Сложность</h3>
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.filterButton} ${filters.difficulty === '1' ? styles.active : ''}`}
                onClick={() => handleFilterChange('difficulty', filters.difficulty === '1' ? '' : '1')}
              >
                легкий
              </button>
              <button
                className={`${styles.filterButton} ${filters.difficulty === '2' ? styles.active : ''}`}
                onClick={() => handleFilterChange('difficulty', filters.difficulty === '2' ? '' : '2')}
              >
                умеренно
              </button>
              <button
                className={`${styles.filterButton} ${filters.difficulty === '3' ? styles.active : ''}`}
                onClick={() => handleFilterChange('difficulty', filters.difficulty === '3' ? '' : '3')}
              >
                сложный
              </button>
            </div>
          </div>

          {/* Фильтр по времени (продолжительности) */}
          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>
              <div className={styles.filterIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className={styles.filterTitle}>Время</h3>
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.filterButton} ${filters.duration === 'short' ? styles.active : ''}`}
                onClick={() => handleFilterChange('duration', filters.duration === 'short' ? '' : 'short')}
              >
                до 4 часов
              </button>
              <button
                className={`${styles.filterButton} ${filters.duration === 'medium' ? styles.active : ''}`}
                onClick={() => handleFilterChange('duration', filters.duration === 'medium' ? '' : 'medium')}
              >
                4-8 часов
              </button>
              <button
                className={`${styles.filterButton} ${filters.duration === 'long' ? styles.active : ''}`}
                onClick={() => handleFilterChange('duration', filters.duration === 'long' ? '' : 'long')}
              >
                более 8 часов
              </button>
            </div>
          </div>

          {/* Фильтр по дистанции */}
          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>
              <div className={styles.filterIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className={styles.filterTitle}>Дистанция</h3>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="1"
                max="50"
                value={distanceValue}
                onChange={handleDistanceChange}
                className={styles.slider}
              />
              <div className={styles.sliderValue}>{distanceValue} км</div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.showButton} onClick={handleApply}>
            Показать
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal; 