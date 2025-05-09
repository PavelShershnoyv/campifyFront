import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import styles from './MyRoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";
import { fetchUserRoutesThunk, deleteRouteThunk } from '../../features/map/mapPointsSlice';

// Компонент для страницы "Мои Маршруты"
const MyRoutesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRoutes, userRoutesLoading, userRoutesError, deleteRouteLoading } = useSelector(state => state.mapPoints);
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  
  // Состояние для активной вкладки (дикие/обустроенные)
  const [activeTab, setActiveTab] = useState('wild');
  
  // Загрузка маршрутов пользователя при монтировании компонента
  useEffect(() => {
    console.log('MyRoutesPage - Проверка авторизации:', isAuthenticated);
    console.log('MyRoutesPage - Данные пользователя:', currentUser);
    
    if (isAuthenticated && currentUser?.id) {
      console.log('Запрашиваем маршруты для пользователя ID:', currentUser.id);
      dispatch(fetchUserRoutesThunk(currentUser.id));
    } else {
      console.log('Пользователь не авторизован или нет ID');
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, currentUser, navigate]);

  // Обработчик удаления маршрута
  const handleDeleteRoute = (routeId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      dispatch(deleteRouteThunk(routeId))
        .unwrap()
        .then(() => {
          console.log(`Маршрут с ID: ${routeId} успешно удален`);
        })
        .catch(error => {
          console.error(`Ошибка при удалении маршрута: ${error}`);
          alert(`Ошибка при удалении маршрута: ${error}`);
        });
    }
  };

  // Разделение маршрутов на дикие и обустроенные
  const wildRoutes = userRoutes.filter(route => route.type === 2); // type 2 - дикие
  const equippedRoutes = userRoutes.filter(route => route.type === 1); // type 1 - обустроенные
  
  // Определяем, какие маршруты показывать в зависимости от активной вкладки
  const currentRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;
  
  // Получаем основной маршрут для большой карточки (если есть)
  const mainRoute = currentRoutes.length > 0 ? currentRoutes[0] : null;
  
  // Остальные маршруты для обычных карточек
  const regularRoutes = currentRoutes.length > 1 ? currentRoutes.slice(1) : [];

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

  if (userRoutesLoading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка ваших маршрутов...</div>
        </div>
      </div>
    );
  }

  if (userRoutesError) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.error}>Ошибка: {userRoutesError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>Мои маршруты</h1>
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
        
        {userRoutes.length === 0 ? (
          <div className={styles.noRoutes}>
            <p>У вас пока нет сохраненных маршрутов.</p>
            <button 
              className={styles.createRouteButton}
              onClick={() => navigate('/scheduler')}
            >
              Создать маршрут
            </button>
          </div>
        ) : currentRoutes.length === 0 ? (
          <div className={styles.noRoutes}>
            {activeTab === 'wild' ? 'У вас нет диких маршрутов' : 'У вас нет обустроенных маршрутов'}
            <button 
              className={styles.createRouteButton}
              onClick={() => navigate('/scheduler')}
            >
              Создать маршрут
            </button>
          </div>
        ) : (
          <>
            {mainRoute && (
              <div className={styles.mainRoute}>
                <BigCellRoute 
                  image={bigRouteImage} 
                  title={mainRoute.name}
                  country="Россия"
                  region={mainRoute.location_area ? mainRoute.location_area.split(' ')[1] : "Свердловская область"}
                  distance={formatDistance(mainRoute.length_in_km)}
                  time={formatDuration(mainRoute.duration)}
                  rating={mainRoute.rating || 5.0}
                  isUserRoute={true}
                  onDelete={() => handleDeleteRoute(mainRoute.id)}
                  link={`/route-details/${mainRoute.id}`}
                />
              </div>
            )}
            
            {regularRoutes.map((route, index) => (
              <div className={styles.routeContainer} key={route.id}>
                <CellRoute 
                  image={leftImage}
                  title={route.name}
                  description={route.description || "Нет описания"}
                  country="Россия"
                  region={route.location_area ? route.location_area.split(' ')[1] : "Свердловская область"}
                  distance={formatDistance(route.length_in_km)}
                  time={formatDuration(route.duration)}
                  rating={route.rating || 5.0}
                  difficulty={route.difficulty === 1 ? "Легкий" : 
                             route.difficulty === 2 ? "Средний" : "Сложный"}
                  imagePosition={index % 2 !== 0 ? "right" : "left"}
                  isUserRoute={true}
                  onDelete={() => handleDeleteRoute(route.id)}
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

export default MyRoutesPage; 