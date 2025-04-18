import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BigCellRoute.module.scss';

const BigCellRoute = ({ 
  title = "Природный парк «Бажовские места»", 
  country = "Россия", 
  region = "Свердловская область", 
  distance = "23,6 км",
  time = "7,29 ч",
  rating = "4,7",
  link = "/route-details",
  image
}) => {
  return (
    <div className={styles.bigCellRoute} style={{ backgroundImage: `url(${image})` }}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        
        <div className={styles.footer}>
          <div className={styles.leftContent}>
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
          </div>
          
          <Link to={link} className={styles.button}>
            <span className={styles.buttonText}>Подробнее</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BigCellRoute; 