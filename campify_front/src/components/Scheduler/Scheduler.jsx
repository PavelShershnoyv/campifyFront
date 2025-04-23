import React from 'react';
import Header from '../Header/Header';
import styles from './Scheduler.module.scss';

const Scheduler = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Планирование маршрута</h1>
        
        <div className={styles.schedulerContainer}>
          <div className={styles.mapSection}>
            <div className={styles.searchInputs}>
              <div className={styles.inputContainer}>
                <input 
                  type="text" 
                  placeholder="Введите название маршрута" 
                  className={styles.routeNameInput}
                />
              </div>
              
              <div className={styles.searchRow}>
                <div className={styles.inputWithIcon}>
                  <div className={styles.searchIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Поиск места или адреса" 
                    className={styles.searchInput}
                  />
                </div>
                <button className={styles.searchButton}>Найти</button>
              </div>
            </div>
            
            <div className={styles.mapContainer}>
              <div className={styles.mapboxPlaceholder}>
                {/* Здесь будет интеграция карты Mapbox */}
                <div className={styles.mapPlaceholderText}>Карта Mapbox будет интегрирована здесь</div>
              </div>
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h2 className={styles.infoTitle}>Характеристика</h2>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дистанция</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>-- км</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Время</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>-- ч</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Набор высоты</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>-- м</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Сложность</span>
              <div className={styles.infoValue}>
                <div className={styles.difficultyIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3L4 15H20L16 3M12 15V19M8 19H16" stroke="#619766" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>--</span>
              </div>
            </div>
            
            <button className={styles.saveButton}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler; 