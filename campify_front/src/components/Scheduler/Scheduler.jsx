import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../Header/Header';
import styles from './Scheduler.module.scss';
import PlannerMap from '../Map/PlannerMap';
import { createGPXFromCoordinates, gpxStringToBlob } from '../../utils/gpxUtils';

const Scheduler = () => {
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeType, setPlaceType] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  
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
      const mapboxApiKey = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibmF2aWdhdG9yMiIsImEiOiJjbHdjdnF4OGYwNGYwMm1xejdobXEwM3cwIn0.-1FJQTxzzRhsHDYhMg8qtw';
      
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
      };
      
      console.log('Отправляем данные маршрута:', routeData);
      
      // Отправляем данные маршрута
      const response = await fetch('http://127.0.0.1:8000/api/routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при создании маршрута: ${response.status}`);
      }
      
      const result = await response.json();
      const routeId = result.id;
      
      console.log('Маршрут создан с ID:', routeId);
      
      // Создаем GPX файл из координат
      const gpxString = createGPXFromCoordinates(route.coordinates, routeName);
      const gpxBlob = gpxStringToBlob(gpxString);
      
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('gpx_file', gpxBlob, `${routeName.replace(/\s+/g, '_')}.gpx`);
      
      // Отправляем GPX файл
      const gpxResponse = await fetch(`http://127.0.0.1:8000/api/routes/${routeId}/upload_gpx/`, {
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
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка при сохранении маршрута:', err);
      setError(err.message);
      toast.error(`Ошибка при сохранении маршрута: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Планирование маршрута</h1>
          <p className={styles.subtitle}>Создайте маршрут, кликая по карте для добавления точек</p>
        </div>
        
        <div className={styles.instructionContainer}>
          <div className={styles.instructionStep}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepText}>Нажмите на карту, чтобы установить начальную точку (зеленый маркер)</div>
          </div>
          <div className={styles.instructionStep}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepText}>Добавьте еще точки, чтобы создать маршрут</div>
          </div>
          <div className={styles.instructionStep}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepText}>Нажмите "Построить маршрут", чтобы увидеть оптимальный путь</div>
          </div>
        </div>
        
        <div className={styles.schedulerContainer}>
          <div className={styles.mapSection}>
            <div className={styles.searchInputs}>
              <div className={styles.inputContainer}>
                <input 
                  type="text" 
                  placeholder="Введите название маршрута" 
                  className={styles.routeNameInput}
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  required
                />
                {error && <div className={styles.errorMessage}>{error}</div>}
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
              <PlannerMap onRouteUpdate={handleRouteCreated} />
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h2 className={styles.infoTitle}>Характеристика</h2>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дистанция</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>{route ? formatDistance(route.distance) : '-- км'}</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Время</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>{route ? formatDuration(route.duration) : '-- ч'}</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Набор высоты</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>{route && route.elevationGain ? `${route.elevationGain} м` : '-- м'}</span>
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
                <span>{difficulty ? difficulty.label : '--'}</span>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Регион</span>
              <div className={styles.infoValue}>
                <div className={styles.marker}></div>
                <span>{locationArea || 'Определяется...'}</span>
              </div>
            </div>

            <button 
              className={`${styles.saveButton} ${isLoading ? styles.loading : ''}`} 
              onClick={handleSave}
              disabled={isLoading || !route || !routeName.trim() || !placeDescription.trim() || !placeType}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
        
        <div className={styles.placeTypeContainer}>
          <h2 className={styles.placeTypeTitle}>Описание</h2>
          <div className={styles.placeTypeWrapper}>
            <input 
              type="text" 
              placeholder="Расскажите про это место" 
              className={styles.placeDescription}
              value={placeDescription}
              onChange={(e) => setPlaceDescription(e.target.value)}
              required
            />
            
            <div className={styles.placeTypeButtons}>
              <button 
                className={`${styles.placeTypeButton} ${placeType === 'Обустроенный' ? styles.active : ''}`}
                onClick={() => setPlaceType('Обустроенный')}
              >
                Обустроенный
              </button>
              <button 
                className={`${styles.placeTypeButton} ${placeType === 'Дикий' ? styles.active : ''}`}
                onClick={() => setPlaceType('Дикий')}
              >
                Дикий
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Scheduler; 