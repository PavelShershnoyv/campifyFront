import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import styles from './RoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";
import { useRoutes } from '../../hooks/useRoutes';
import { useUser } from '../../hooks/useUser';

const RoutesPage = () => {
  const [activeTab, setActiveTab] = useState('wild');
  const { routes, wildRoutes, equippedRoutes, loading, error, loadRoutes } = useRoutes();
  const { isAuthenticated, favorites, addRouteToFavorites, removeRouteFromFavorites, isRouteFavorite } = useUser();
  
  // Загрузка маршрутов при монтировании компонента
  useEffect(() => {
    loadRoutes();
  }, []);

  // Функция для переключения избранного статуса
  const toggleFavorite = (routeId) => {
    if (isAuthenticated) {
      if (isRouteFavorite(routeId)) {
        removeRouteFromFavorites(routeId);
      } else {
        addRouteToFavorites(routeId);
      }
    } else {
      // Можно добавить перенаправление на страницу логина
      alert('Чтобы добавлять маршруты в избранное, необходимо авторизоваться');
    }
  };

  // Определяем, какие маршруты показывать в зависимости от активной вкладки
  const currentRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;
  
  // Получаем основной маршрут для большой карточки (если есть)
  const mainRoute = currentRoutes.length > 0 ? currentRoutes[0] : null;
  
  // Остальные маршруты для обычных карточек
  const regularRoutes = currentRoutes.length > 1 ? currentRoutes.slice(1) : [];

  if (loading) {
    return <div className={styles.loading}>Загрузка маршрутов...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>Лучшие маршруты</h1>
          <button className={styles.filterButton}>
            <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
            <span>Фильтры</span>
          </button>
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
        
        {currentRoutes.length === 0 ? (
          <div className={styles.noRoutes}>
            {activeTab === 'wild' ? 'Дикие маршруты не найдены' : 'Обустроенные маршруты не найдены'}
          </div>
        ) : (
          <>
            {mainRoute && (
              <div className={styles.mainRoute}>
                <BigCellRoute 
                  image={bigRouteImage} // Временно используем заглушку, в будущем здесь будет mainRoute.image
                  title={mainRoute.title}
                  country={mainRoute.country}
                  region={mainRoute.region}
                  distance={mainRoute.distance}
                  time={mainRoute.time}
                  rating={mainRoute.rating}
                  isFavorite={isAuthenticated && isRouteFavorite(mainRoute.id)}
                  onFavoriteToggle={() => toggleFavorite(mainRoute.id)}
                  link={`/route-details/${mainRoute.id}`}
                />
              </div>
            )}
            
            {regularRoutes.map((route, index) => (
              <div className={styles.routeContainer} key={route.id}>
                <CellRoute 
                  image={leftImage} // Временно используем заглушку, в будущем здесь будет route.image
                  title={route.title}
                  description={route.description}
                  country={route.country}
                  region={route.region}
                  distance={route.distance}
                  time={route.time}
                  rating={route.rating}
                  difficulty={route.difficulty === 1 ? "Легкий" : 
                             route.difficulty === 2 ? "Средний" : "Сложный"}
                  duration={route.time}
                  imagePosition={index % 2 !== 0 ? "right" : "left"}
                  isFavorite={isAuthenticated && isRouteFavorite(route.id)}
                  onFavoriteToggle={() => toggleFavorite(route.id)}
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

export default RoutesPage; 