import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../Header/Header';
import styles from './Scheduler.module.scss';
import PlannerMap from '../Map/PlannerMap';
import { createGPXFromCoordinates, gpxStringToBlob } from '../../utils/gpxUtils';
import { saveRouteThunk } from '../../features/map/mapPointsSlice';
import AuthRequiredModal from '../AuthRequiredModal/AuthRequiredModal';

const Scheduler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.user);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeType, setPlaceType] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  
  // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Ссылка на карту
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Проверяем авторизацию при загрузке компонента
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    navigate('/');
  };
  
  // Функция для преобразования минут в часы и минуты
  const formatDuration = (seconds) => {
    if (!seconds) return '0 мин';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    } else {
      return `${minutes} мин`;
    }
  };
  
  // Функция для преобразования секунд в формат HH:MM:SS
  const formatDurationForAPI = (seconds) => {
    if (!seconds) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDistance = (meters) => {
    if (!meters) return '0 км';
    
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(2)} км`;
    }
  };
  
  // Функция для определения сложности маршрута на основе его длины
  const getDifficultyByDistance = (distanceInMeters) => {
    const distanceInKm = distanceInMeters / 1000;
    
    if (distanceInKm <= 15) {
      return { value: 1, label: 'Легкая' };
    } else if (distanceInKm <= 50) {
      return { value: 2, label: 'Средняя' };
    } else {
      return { value: 3, label: 'Тяжелая' };
    }
  };
  
  // Функция для получения информации о местоположении по координатам
  const getLocationFromCoordinates = async (coordinates) => {
    try {
      if (!coordinates || !coordinates.length) return null;
      
      // Берем точку из середины маршрута для определения местоположения
      const midPoint = Math.floor(coordinates.length / 2);
      const [longitude, latitude] = coordinates[midPoint];
      
      // Получаем API-ключ Mapbox из текущего окружения
      const mapboxApiKey = process.env.REACT_APP_MAPBOX_KEY;
      
      // Запрос к Mapbox Geocoding API для получения информации о местоположении
      // Расширяем типы, чтобы получить больше информации: region (область/край), place (город/населенный пункт), country (страна)
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxApiKey}&language=ru&types=region,place,country&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`Ошибка получения местоположения: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Данные о местоположении:', data);
      
      // Извлекаем информацию о местоположении из ответа
      if (data.features && data.features.length > 0) {
        // Создаем пустой объект для хранения различных типов мест
        const locationInfo = {
          country: null,
          region: null,
          place: null
        };
        
        // Проходим по всем найденным точкам и собираем информацию
        data.features.forEach(feature => {
          if (feature.place_type.includes('country')) {
            locationInfo.country = feature.text;
          } else if (feature.place_type.includes('region')) {
            locationInfo.region = feature.text;
          } else if (feature.place_type.includes('place')) {
            locationInfo.place = feature.text;
          }
        });
        
        // Собираем полное название места в зависимости от доступной информации
        let locationString = '';
        
        if (locationInfo.country) {
          locationString += locationInfo.country;
        }
        
        if (locationInfo.region) {
          if (locationString) locationString += ' ';
          locationString += locationInfo.region;
        }
        
        if (locationInfo.place) {
          if (locationString) locationString += ', ';
          locationString += locationInfo.place;
        }
        
        // Если удалось собрать информацию о местоположении, возвращаем её
        if (locationString) {
          console.log('Определено местоположение:', locationString);
          return locationString;
        }
      }
      
      // Более подробно логируем проблему, если не удалось определить местоположение
      console.warn('Не удалось определить достаточно детальное местоположение, данные:', data);
      
      // Если не удалось определить местоположение, возвращаем дефолтное значение
      return 'Россия Свердловская область';
    } catch (error) {
      console.error('Ошибка при определении местоположения:', error);
      return 'Россия Свердловская область';
    }
  };
  
  // Функция для поиска локаций
  const searchLocations = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Сначала ищем среди существующих локаций
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/map_points/`);
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке локаций: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Фильтруем локации по запросу
      const filteredLocations = data.filter(location => 
        location.name && location.name.toLowerCase().includes(query.toLowerCase())
      ).map(location => ({
        ...location,
        source: 'database',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
      }));
      
      /* Закомментировано: поиск через Mapbox API
      // Если база данных не дала результатов или их мало, ищем с помощью MapBox
      let mapboxResults = [];
      if (filteredLocations.length < 5) {
        const mapboxResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.REACT_APP_MAPBOX_KEY}&country=ru&language=ru&limit=5`
        );
        
        if (mapboxResponse.ok) {
          const mapboxData = await mapboxResponse.json();
          
          mapboxResults = mapboxData.features.map(feature => ({
            id: feature.id,
            name: feature.place_name,
            description: feature.place_type.join(', '),
            coordinates: feature.center,
            source: 'mapbox'
          }));
        }
      }
      
      // Объединяем результаты с приоритетом на локации из базы
      const combinedResults = [...filteredLocations, ...mapboxResults].slice(0, 8);
      */
      
      // Используем только результаты из базы данных
      const combinedResults = filteredLocations.slice(0, 8);
      setSearchResults(combinedResults);
      
      console.log('Результаты поиска:', combinedResults);
    } catch (error) {
      console.error('Ошибка при поиске локаций:', error);
      toast.error('Ошибка при поиске локаций');
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик изменения поискового запроса с debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
  };

  const handleSearchResultClick = (location) => {
    console.log('Выбрана локация:', location);
    setSearchQuery(location.name);
    setShowResults(false);
    
    // Если у нас есть координаты, перемещаем карту к ним
    if (location.coordinates && location.coordinates.length === 2) {
      if (mapRef.current && mapRef.current.flyToLocation) {
        // Передаем полный объект локации, а не только координаты
        mapRef.current.flyToLocation({
          ...location,
          onAddToRoute: () => {
            // Очищаем поисковый запрос после добавления в маршрут
            setSearchQuery('');
          }
        });
      } else {
        console.log('Ссылка на карту недоступна');
      }
    }
  };

  const handleSearchButtonClick = () => {
    if (!searchQuery) return;
    
    // Если есть активные результаты поиска, используем первый
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    } else {
      // Иначе выполняем новый поиск
      searchLocations(searchQuery);
    }
  };
  
  // Обработчик изменения маршрута
  const handleRouteCreated = async (routeData) => {
    setRoute(routeData);
    
    if (routeData) {
      // Определяем сложность маршрута
      const routeDifficulty = getDifficultyByDistance(routeData.distance);
      setDifficulty(routeDifficulty);
      
      // Определяем местоположение по координатам маршрута
      if (routeData.coordinates && routeData.coordinates.length > 0) {
        const location = await getLocationFromCoordinates(routeData.coordinates);
        if (location) {
          setLocationArea(location);
        }
      }
    } else {
      // Сбрасываем сложность если маршрут очищен
      setDifficulty(null);
    }
  };
  
  // Функция для валидации формы
  const validateForm = () => {
    if (!routeName.trim()) {
      toast.error('Введите название маршрута');
      return false;
    }
    
    if (!route) {
      toast.error('Пожалуйста, создайте маршрут с хотя бы двумя точками');
      return false;
    }
    
    if (!placeDescription.trim()) {
      toast.error('Пожалуйста, добавьте описание места');
      return false;
    }
    
    if (!placeType) {
      toast.error('Выберите тип места');
      return false;
    }
    
    return true;
  };
  
  // Получение числового значения типа места для API
  const getPlaceTypeValue = () => {
    // Для API: 1 - обустроенные, 2 - дикие
    return placeType === 'Обустроенный' ? 1 : 2;
  };
  
  // Обработчик сохранения маршрута
  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      
      setIsLoading(true);
      setError(null);
      
      // Преобразуем продолжительность для API
      const durationForAPI = formatDurationForAPI(route.duration);
      
      // Данные для создания маршрута
      const routeData = {
        name: routeName,
        description: placeDescription,
        location_area: locationArea || "Россия Свердловская область",
        duration: durationForAPI,
        views: 0,
        length_in_km: route.distance / 1000, // конвертируем метры в километры
        height: route.elevationGain || 0,
        difficulty: difficulty ? difficulty.value : 1, // используем определенную сложность или базовую
        type: getPlaceTypeValue(), // 1 - обустроенный, 2 - дикий
        place_type: placeType, // текстовое значение для отображения
        coordinates: route.coordinates // Добавляем координаты маршрута
      };
      
      console.log('Отправляем данные маршрута через Redux:', routeData);
      
      // Используем Redux thunk для сохранения маршрута
      const resultAction = await dispatch(saveRouteThunk(routeData));
      
      // Проверяем результат
      if (saveRouteThunk.fulfilled.match(resultAction)) {
        const result = resultAction.payload;
        const routeId = result.id;
        
        console.log('Маршрут создан с ID:', routeId);
        
        // Создаем GPX файл из координат
        const gpxString = createGPXFromCoordinates(route.coordinates, routeName);
        const gpxBlob = gpxStringToBlob(gpxString);
        
        // Создаем FormData для отправки файла
        const formData = new FormData();
        formData.append('gpx_file', gpxBlob, `${routeName.replace(/\s+/g, '_')}.gpx`);
        
        // Отправляем GPX файл
        const gpxResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/routes/${routeId}/upload_gpx/`, {
          method: 'POST',
          body: formData,
        });
        
        if (!gpxResponse.ok) {
          throw new Error(`Ошибка при загрузке GPX файла: ${gpxResponse.status}`);
        }
        
        toast.success('Маршрут успешно сохранен!');
        
        // Небольшая задержка перед перенаправлением
        setTimeout(() => {
          navigate('/routes');
          setIsLoading(false);
        }, 2000);
      } else {
        // Обрабатываем ошибку, если запрос не удался
        const errorMessage = resultAction.payload || 'Неизвестная ошибка при сохранении маршрута';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Ошибка при сохранении маршрута:', err);
      setError(err.message);
      toast.error(`Ошибка при сохранении маршрута: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  // Добавляем обработчик для закрытия результатов поиска при клике вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик был вне области результатов поиска и поискового ввода
      if (showResults && 
          !event.target.closest(`.${styles.searchResults}`) && 
          !event.target.closest(`.${styles.searchInput}`)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showResults, styles.searchResults, styles.searchInput]);
  
  return (
    <div className={styles.wrapper}>
      <Header />
      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={handleCloseAuthModal} 
      />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Scheduler; 