import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CellRoute.module.scss';

export const CellRoute = ({ 
  title = "Природный парк", 
  country = "Россия", 
  region = "Свердловская область", 
  distance = "23,6 км",
  time = "7,29 ч",
  rating = "4,3",
  link = "/route-details",
  image,
  imagePosition = "left",
  isFavorite = false,
  onFavoriteToggle,
  isUserRoute = false,
  onDelete,
  description
}) => {
  const isImageLeft = imagePosition === 'left';
  
  return (
    <div className={`${styles.cellRoute} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}>
      <div className={styles.imageContainer}>
        <img src={image} alt={title} className={styles.image} />
        
        {/* Кнопки действий */}
        <div className={styles.actions}>
          {onFavoriteToggle && !isUserRoute && (
            <button 
              className={`${styles.actionButton} ${isFavorite ? styles.active : ''}`} 
              onClick={(e) => {
                e.preventDefault();
                onFavoriteToggle();
              }}
              title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            >
              <svg viewBox="0 0 24 24" fill={isFavorite ? "#FF6B35" : "white"}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          )}
          
          {isUserRoute && onDelete && (
            <button 
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              title="Удалить маршрут"
            >
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        
        {description && <p className={styles.description}>{description}</p>}
        
        <div className={styles.info}>
          <div className={styles.location}>
            <span className={styles.country}>{country}</span>
            <span className={styles.dot}></span>
            <span className={styles.region}>{region}</span>
          </div>
          
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.value}>{distance}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.value}>{time}</span>
            </div>
            <div className={styles.detailItem}>
              <svg className={styles.star} viewBox="0 0 24 24" fill="white">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className={styles.value}>{rating}</span>
            </div>
          </div>
          
          <Link to={link} className={styles.button}>
            <span className={styles.buttonText}>Подробнее</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CellRoute; 