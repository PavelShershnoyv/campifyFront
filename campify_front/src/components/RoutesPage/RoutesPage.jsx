import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import FilterModal from '../FilterModal/FilterModal';
import styles from './RoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";
import { useRoutes } from '../../hooks/useRoutes';
import { useUser } from '../../hooks/useUser';

const RoutesPage = () => {
  const [activeTab, setActiveTab] = useState('wild');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: '',
    distance: '',
    duration: '',
    distanceValue: 15
  });
  
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

  // Функция фильтрации маршрутов
  const filterRoutes = (routes) => {
    return routes.filter(route => {
      // Фильтр по сложности
      if (filters.difficulty && route.difficulty !== parseInt(filters.difficulty)) {
        return false;
      }
      
      // Фильтр по дистанции (используем значение слайдера)
      if (filters.distanceValue && filters.distanceValue !== 15) {
        // Извлекаем числовое значение из строки типа "15.5 км"
        const distanceMatch = route.distance.match(/(\d+\.?\d*)/);
        const routeDistance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
        
        // Фильтруем по максимальному значению слайдера
        if (routeDistance > filters.distanceValue) {
          return false;
        }
      }
      
      // Фильтр по продолжительности
      if (filters.duration) {
        // Извлекаем числовое значение из строки типа "3 ч 30 мин"
        const timeMatch = route.time.match(/(\d+)/);
        const duration = timeMatch ? parseFloat(timeMatch[1]) : 0;
        switch (filters.duration) {
          case 'short':
            if (duration >= 4) return false;
            break;
          case 'medium':
            if (duration < 4 || duration > 8) return false;
            break;
          case 'long':
            if (duration <= 8) return false;
            break;
        }
      }
      
      return true;
    });
  };

  // Обработчик открытия модального окна фильтров
  const handleFilterButtonClick = () => {
    setIsFilterModalOpen(true);
  };

  // Обработчик применения фильтров
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Определяем, какие маршруты показывать в зависимости от активной вкладки
  const baseRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;
  
  // Применяем фильтры к маршрутам
  const currentRoutes = filterRoutes(baseRoutes);
  
  // Получаем основной маршрут для большой карточки (если есть)
  const mainRoute = currentRoutes.length > 0 ? currentRoutes[0] : null;
  
  // Остальные маршруты для обычных карточек
  const regularRoutes = currentRoutes.length > 1 ? currentRoutes.slice(1) : [];

  // Проверяем, активны ли какие-либо фильтры
  const hasActiveFilters = filters.difficulty !== '' || 
                           filters.duration !== '' || 
                           (filters.distanceValue && filters.distanceValue !== 15);

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
          <button 
            className={`${styles.filterButton} ${hasActiveFilters ? styles.filterActive : ''}`}
            onClick={handleFilterButtonClick}
          >
            <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
            <span>Фильтры</span>
            {hasActiveFilters && <span className={styles.filterBadge}></span>}
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
            {hasActiveFilters ? (
              <>
                <p>По выбранным фильтрам маршруты не найдены</p>
                <button 
                  className={styles.resetFiltersButton}
                  onClick={() => handleApplyFilters({
                    difficulty: '',
                    distance: '',
                    duration: '',
                    distanceValue: 15
                  })}
                >
                  Сбросить фильтры
                </button>
              </>
            ) : (
              activeTab === 'wild' ? 'Дикие маршруты не найдены' : 'Обустроенные маршруты не найдены'
            )}
          </div>
        ) : (
          <>
            {mainRoute && (
              <div className={styles.mainRoute}>
                <BigCellRoute 
                  image={bigRouteImage} 
                  title={mainRoute.title}
                  country={mainRoute.country}
                  region={mainRoute.region}
                  distance={mainRoute.distance}
                  time={mainRoute.time}
                  rating={parseFloat(mainRoute.rating) || 5.0}
                  isFavorite={isRouteFavorite(mainRoute.id)}
                  onFavoriteToggle={() => toggleFavorite(mainRoute.id)}
                  link={`/route-details/${mainRoute.id}`}
                />
              </div>
            )}
            
            {regularRoutes.map((route, index) => (
              <div className={styles.routeContainer} key={route.id}>
                <CellRoute 
                  image={leftImage}
                  title={route.title}
                  description={route.description || "Нет описания"}
                  country={route.country}
                  region={route.region}
                  distance={route.distance}
                  time={route.time}
                  rating={parseFloat(route.rating) || 5.0}
                  difficulty={route.difficulty === 1 ? "Легкий" : 
                             route.difficulty === 2 ? "Средний" : "Сложный"}
                  imagePosition={index % 2 !== 0 ? "right" : "left"}
                  isFavorite={isRouteFavorite(route.id)}
                  onFavoriteToggle={() => toggleFavorite(route.id)}
                  link={`/route-details/${route.id}`}
                />
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Модальное окно фильтров */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  );
};

export default RoutesPage; 