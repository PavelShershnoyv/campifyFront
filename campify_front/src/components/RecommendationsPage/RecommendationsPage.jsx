import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import styles from './RecommendationsPage.module.scss';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";
import { useRoutes } from '../../hooks/useRoutes';
import { useUser } from '../../hooks/useUser';

// Компонент для страницы "Рекомендации"
const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { 
    recommendedRoutes, 
    recommendedLoading, 
    recommendedError, 
    loadRecommendedRoutes,
    loadRoutePhotos,
    getRoutePhotos
  } = useRoutes();
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  const { hasPassedTest } = useUser();
  
  // Состояние для активной вкладки (дикие/обустроенные)
  const [activeTab, setActiveTab] = useState('wild');
  
  // Загрузка рекомендованных маршрутов при монтировании компонента
  useEffect(() => {
    console.log('RecommendationsPage - Проверка авторизации:', isAuthenticated);
    console.log('RecommendationsPage - Данные пользователя:', currentUser);
    
    if (isAuthenticated && currentUser?.id) {
      console.log('Запрашиваем рекомендации для пользователя ID:', currentUser.id);
      loadRecommendedRoutes(currentUser.id);
    } else {
      console.log('Пользователь не авторизован или нет ID');
      navigate('/login');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Получение URL фотографии для маршрута
  const getPhotoUrl = (routeId) => {
    const photos = getRoutePhotos(routeId);
    if (photos && photos.length > 0) {
      return photos[0].image;
    }
    return null;
  };

  // Форматирование времени
  const formatDuration = (durationString) => {
    if (!durationString) return '0 мин';
    
    // Если формат HH:MM:SS
    if (typeof durationString === 'string' && durationString.includes(':')) {
      const parts = durationString.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      
      if (hours > 0) {
        return `${hours} ч ${minutes > 0 ? minutes + ' мин' : ''}`;
      } else {
        return `${minutes} мин`;
      }
    }
    
    // Если передано число (секунды)
    const seconds = parseInt(durationString);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ч ${minutes > 0 ? minutes + ' мин' : ''}`;
    } else {
      return `${minutes} мин`;
    }
  };
  
  // Форматирование расстояния
  const formatDistance = (distance) => {
    if (!distance) return '0 км';
    
    // Проверяем, передано ли уже в км
    if (typeof distance === 'string' && distance.includes('км')) {
      return distance;
    }
    
    const distanceValue = parseFloat(distance);
    
    if (distanceValue >= 1) {
      return `${distanceValue.toFixed(1)} км`;
    } else {
      return `${(distanceValue * 1000).toFixed(0)} м`;
    }
  };

  // Фильтрация маршрутов по типу (дикие/обустроенные)
  const wildRoutes = recommendedRoutes.filter(route => route.type === 'wild');
  const equippedRoutes = recommendedRoutes.filter(route => route.type === 'equipped');
  
  // Определяем, какие маршруты показывать в зависимости от активной вкладки
  const currentRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;
  
  // Получаем основной маршрут для большой карточки (если есть)
  const mainRoute = currentRoutes.length > 0 ? currentRoutes[0] : null;
  
  // Остальные маршруты для обычных карточек
  const regularRoutes = currentRoutes.length > 1 ? currentRoutes.slice(1) : [];

  if (recommendedLoading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка рекомендованных маршрутов...</div>
        </div>
      </div>
    );
  }

  if (recommendedError) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.error}>Ошибка: {recommendedError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>Рекомендации</h1>
          {!hasPassedTest() && (
            <button 
              className={styles.surveyButton}
              onClick={() => navigate('/preferences-survey')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.surveyIcon}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              <span>Настроить предпочтения</span>
            </button>
          )}
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'wild' ? styles.active : ''}`}
            onClick={() => setActiveTab('wild')}
          >
            Дикие
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'equipped' ? styles.active : ''}`}
            onClick={() => setActiveTab('equipped')}
          >
            Обустроенные
          </button>
        </div>
        
        {recommendedRoutes.length === 0 ? (
          <div className={styles.noRoutes}>
            <p>У вас пока нет рекомендованных маршрутов.</p>
            <button 
              className={styles.createRouteButton}
              onClick={() => navigate('/routes')}
            >
              Все маршруты
            </button>
          </div>
        ) : currentRoutes.length === 0 ? (
          <div className={styles.noRoutes}>
            {activeTab === 'wild' ? 'У вас нет рекомендованных диких маршрутов' : 'У вас нет рекомендованных обустроенных маршрутов'}
            <button 
              className={styles.createRouteButton}
              onClick={() => navigate('/routes')}
            >
              Все маршруты
            </button>
          </div>
        ) : (
          <>
            {mainRoute && (
              <div className={styles.mainRoute}>
                <BigCellRoute 
                  image={getPhotoUrl(mainRoute.id) || bigRouteImage}
                  title={mainRoute.title}
                  country="Россия"
                  region={mainRoute.region || "Свердловская область"}
                  distance={formatDistance(mainRoute.distance)}
                  time={formatDuration(mainRoute.time)}
                  rating={mainRoute.rating || "5.0"}
                  link={`/route-details/${mainRoute.id}`}
                />
              </div>
            )}
            
            {regularRoutes.map((route, index) => (
              <div key={route.id} className={styles.routeContainer}>
                <CellRoute 
                  image={getPhotoUrl(route.id) || leftImage}
                  title={route.title}
                  description={route.description || "Нет описания"}
                  country="Россия"
                  region={route.region || "Свердловская область"}
                  distance={formatDistance(route.distance)}
                  time={formatDuration(route.time)}
                  rating={route.rating || "5.0"}
                  difficulty={route.difficulty === 1 ? "Легкий" : 
                              route.difficulty === 2 ? "Средний" : "Сложный"}
                  imagePosition={index % 2 !== 0 ? "right" : "left"}
                  link={`/route-details/${route.id}`}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage; 