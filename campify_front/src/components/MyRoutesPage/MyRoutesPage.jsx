import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import Modal from '../Modal/Modal';
import FilterModal from '../FilterModal/FilterModal';
import styles from './MyRoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";
import { fetchUserRoutesThunk, deleteRouteThunk } from '../../features/map/mapPointsSlice';
import { updateRoutePublicStatus } from '../../store/slices/routesSlice';

// Компонент для страницы "Мои Маршруты"
const MyRoutesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userRoutes, userRoutesLoading, userRoutesError, deleteRouteLoading } = useSelector(state => state.mapPoints);
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  
  // Состояние для активной вкладки (дикие/обустроенные)
  const [activeTab, setActiveTab] = useState('wild');
  
  // Состояние для фильтров
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: '',
    type: '',
    distance: '',
    duration: ''
  });
  
  // Состояния для модальных окон
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    routeId: null
  });
  
  const [shareModal, setShareModal] = useState({
    isOpen: false,
    routeId: null
  });
  
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
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

  // Функция фильтрации маршрутов
  const filterRoutes = (routes) => {
    return routes.filter(route => {
      // Фильтр по сложности
      if (filters.difficulty && route.difficulty !== parseInt(filters.difficulty)) {
        return false;
      }
      
      // Фильтр по типу (уже применяется через вкладки, но можно дополнительно фильтровать)
      if (filters.type && route.type !== parseInt(filters.type)) {
        return false;
      }
      
      // Фильтр по дистанции
      if (filters.distance) {
        const distance = parseFloat(route.length_in_km) || 0;
        switch (filters.distance) {
          case 'short':
            if (distance >= 10) return false;
            break;
          case 'medium':
            if (distance < 10 || distance > 30) return false;
            break;
          case 'long':
            if (distance <= 30) return false;
            break;
        }
      }
      
      // Фильтр по продолжительности
      if (filters.duration) {
        // Парсим продолжительность из формата "HH:MM:SS" или числа
        let durationHours = 0;
        if (typeof route.duration === 'string' && route.duration.includes(':')) {
          const parts = route.duration.split(':');
          durationHours = parseInt(parts[0]) + (parseInt(parts[1]) / 60);
        } else {
          durationHours = parseFloat(route.duration) || 0;
        }
        
        switch (filters.duration) {
          case 'short':
            if (durationHours >= 4) return false;
            break;
          case 'medium':
            if (durationHours < 4 || durationHours > 8) return false;
            break;
          case 'long':
            if (durationHours <= 8) return false;
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

  // Показать модальное окно для подтверждения удаления
  const showDeleteConfirmation = (routeId) => {
    setDeleteModal({
      isOpen: true,
      routeId
    });
  };
  
  // Показать модальное окно для подтверждения публикации
  const showShareConfirmation = (routeId) => {
    setShareModal({
      isOpen: true,
      routeId
    });
  };
  
  // Показать модальное окно с результатом операции
  const showResultModal = (title, message, type = 'info') => {
    setResultModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Обработчик удаления маршрута
  const handleDeleteRoute = () => {
    const routeId = deleteModal.routeId;
    
    setDeleteModal({ isOpen: false, routeId: null });
    
    dispatch(deleteRouteThunk(routeId))
      .unwrap()
      .then(() => {
        console.log(`Маршрут с ID: ${routeId} успешно удален`);
        showResultModal('Успешно', 'Маршрут успешно удален.', 'success');
      })
      .catch(error => {
        console.error(`Ошибка при удалении маршрута: ${error}`);
        showResultModal('Ошибка', `Не удалось удалить маршрут: ${error}`, 'error');
      });
  };

  // Обработчик публикации маршрута
  const handleShareRoute = () => {
    const routeId = shareModal.routeId;
    
    setShareModal({ isOpen: false, routeId: null });
    
    dispatch(updateRoutePublicStatus({ routeId, isPublic: true }))
      .unwrap()
      .then(() => {
        console.log(`Маршрут с ID: ${routeId} успешно опубликован`);
        // Обновляем список маршрутов пользователя
        dispatch(fetchUserRoutesThunk(currentUser.id));
        showResultModal('Успешно', 'Маршрут успешно опубликован! Теперь он доступен всем пользователям.', 'success');
      })
      .catch(error => {
        console.error(`Ошибка при публикации маршрута: ${error}`);
        showResultModal('Ошибка', `Не удалось опубликовать маршрут: ${error}`, 'error');
      });
  };

  // Разделение маршрутов на дикие и обустроенные
  const wildRoutes = userRoutes.filter(route => route.type === 2); // type 2 - дикие
  const equippedRoutes = userRoutes.filter(route => route.type === 1); // type 1 - обустроенные
  
  // Определяем базовые маршруты в зависимости от активной вкладки
  const baseRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;
  
  // Применяем фильтры к маршрутам
  const currentRoutes = filterRoutes(baseRoutes);
  
  // Получаем основной маршрут для большой карточки (если есть)
  const mainRoute = currentRoutes.length > 0 ? currentRoutes[0] : null;
  
  // Остальные маршруты для обычных карточек
  const regularRoutes = currentRoutes.length > 1 ? currentRoutes.slice(1) : [];
  
  // Проверяем, активны ли какие-либо фильтры
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

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
            {hasActiveFilters ? (
              <>
                <p>По выбранным фильтрам маршруты не найдены</p>
                <button 
                  className={styles.resetFiltersButton}
                  onClick={() => handleApplyFilters({
                    difficulty: '',
                    type: '',
                    distance: '',
                    duration: ''
                  })}
                >
                  Сбросить фильтры
                </button>
              </>
            ) : (
              <>
                <p>{activeTab === 'wild' ? 'У вас нет диких маршрутов' : 'У вас нет обустроенных маршрутов'}</p>
                <button 
                  className={styles.createRouteButton}
                  onClick={() => navigate('/scheduler')}
                >
                  Создать маршрут
                </button>
              </>
            )}
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
                  onDelete={() => showDeleteConfirmation(mainRoute.id)}
                  isPublic={mainRoute.is_public}
                  onShare={() => showShareConfirmation(mainRoute.id)}
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
                  onDelete={() => showDeleteConfirmation(route.id)}
                  isPublic={route.is_public}
                  onShare={() => showShareConfirmation(route.id)}
                  link={`/route-details/${route.id}`}
                />
              </div>
            ))}
          </>
        )}
        
        {/* Модальное окно подтверждения удаления */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, routeId: null })}
          title="Удаление маршрута"
          message="Вы уверены, что хотите удалить этот маршрут? Это действие невозможно отменить."
          buttons={{
            confirm: "Удалить",
            cancel: "Отмена"
          }}
          onConfirm={handleDeleteRoute}
          type="warning"
        />
        
        {/* Модальное окно подтверждения публикации */}
        <Modal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, routeId: null })}
          title="Публикация маршрута"
          message="Вы уверены, что хотите опубликовать этот маршрут? После публикации он будет доступен всем пользователям."
          buttons={{
            confirm: "Опубликовать",
            cancel: "Отмена"
          }}
          onConfirm={handleShareRoute}
          type="info"
        />
        
        {/* Модальное окно с результатом операции */}
        <Modal
          isOpen={resultModal.isOpen}
          onClose={() => setResultModal({ ...resultModal, isOpen: false })}
          title={resultModal.title}
          message={resultModal.message}
          buttons={{
            confirm: "ОК",
            cancel: null
          }}
          type={resultModal.type}
        />
        
        {/* Модальное окно фильтров */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      </div>
    </div>
  );
};

export default MyRoutesPage; 