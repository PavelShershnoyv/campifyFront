import React from 'react';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './PlannerMap.module.scss';

const PlannerMap = ({ onRouteUpdate }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const markersRef = useRef([]);
  const routeRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const isRouteBuildingRef = useRef(false);

  // Функция для создания маркера
  const createMarker = (lngLat, index) => {
    const markerEl = document.createElement('div');
    
    // Различаем первую точку (начало) от других
    if (index === 0) {
      markerEl.className = styles.startMarker;
      markerEl.innerText = 'A';
    } else if (index === waypoints.length) {
      // Последняя точка (если маркер добавляется в конец)
      markerEl.className = styles.waypointMarker;
      markerEl.innerText = 'B';
    } else {
      markerEl.className = styles.waypointMarker;
      markerEl.innerText = index + 1;
    }
    
    // Добавление обработчика двойного клика для удаления маркера
    markerEl.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      
      const markerToRemove = markersRef.current.find(m => m.getElement() === markerEl);
      if (markerToRemove) {
        const indexToRemove = markersRef.current.indexOf(markerToRemove);
        console.log("Удаление маркера с индексом:", indexToRemove);
        
        // Удаляем маркер с карты
        markerToRemove.remove();
        
        // Удаляем маркер из списка
        markersRef.current = markersRef.current.filter(m => m !== markerToRemove);
        
        // Удаляем точку из waypoints
        const newWaypoints = [...waypoints];
        newWaypoints.splice(indexToRemove, 1);
        setWaypoints(newWaypoints);
        
        // Обновляем нумерацию маркеров
        updateMarkerLabels();
      }
    });
    
    return new mapboxgl.Marker({
      element: markerEl,
      draggable: false
    })
      .setLngLat(lngLat)
      .addTo(map.current);
  };

  // Функция для обновления нумерации маркеров
  const updateMarkerLabels = () => {
    markersRef.current.forEach((marker, index) => {
      const markerEl = marker.getElement();
      
      // Обновляем классы и текст
      if (index === 0) {
        markerEl.className = styles.startMarker;
        markerEl.innerText = 'A';
        markerEl.title = 'Начальная точка (двойной клик для удаления)';
      } else if (index === markersRef.current.length - 1) {
        markerEl.className = styles.waypointMarker;
        markerEl.innerText = 'B';
        markerEl.title = 'Конечная точка (двойной клик для удаления)';
      } else {
        markerEl.className = styles.waypointMarker;
        markerEl.innerText = index + 1;
        markerEl.title = 'Промежуточная точка (двойной клик для удаления)';
      }
    });
  };

  // Функция для построения маршрута
  const buildRoute = async () => {
    console.log("Вызвана функция buildRoute");
    
    // Если уже идет построение маршрута, выходим
    if (isRouteBuildingRef.current) {
      console.log("Построение маршрута уже в процессе, пропускаем");
      return;
    }
    
    // Устанавливаем флаг, что идет построение маршрута
    isRouteBuildingRef.current = true;
    
    console.log("Текущие точки waypoints:", waypoints);
    
    // Получаем актуальные координаты из маркеров
    const currentWaypoints = markersRef.current.map(marker => {
      const lngLat = marker.getLngLat();
      return [lngLat.lng, lngLat.lat];
    });
    
    console.log("Текущие маркеры:", markersRef.current.length);
    console.log("Координаты из маркеров:", currentWaypoints);
    
    // Используем координаты из маркеров, если waypoints пусто
    const pointsToUse = currentWaypoints.length >= 2 ? currentWaypoints : waypoints;
    
    if (pointsToUse.length < 2) {
      console.log("Недостаточно точек для построения маршрута");
      alert("Добавьте как минимум 2 точки на карту для построения маршрута");
      isRouteBuildingRef.current = false; // Сбрасываем флаг
      return;
    }

    try {
      // Формируем координаты для запроса
      const coordinates = pointsToUse.map(point => `${point[0]},${point[1]}`).join(';');
      
      console.log("Построение маршрута между точками:", pointsToUse);
      console.log("API Key:", mapboxgl.accessToken);
      
      // Проверяем API ключ на наличие переносов строк
      const cleanAccessToken = mapboxgl.accessToken;
      
      // Запрос к Mapbox Directions API с учетом высоты
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?access_token=${cleanAccessToken}&geometries=geojson&annotations=distance,duration&overview=full`;
      console.log("URL запроса:", url);
      
      const response = await fetch(url);
      
      console.log("Статус ответа:", response.status);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении маршрута: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Полученные данные:", data);
      
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Не удалось построить маршрут между выбранными точками');
      }
      
      const route = data.routes[0];
      const routeCoordinates = route.geometry.coordinates;
      
      // Удаляем существующий маршрут, если он есть
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Добавляем новый маршрут
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });
      
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff6b35',
          'line-width': 5
        }
      });

      // Вычисляем набор высоты из данных о маршруте
      let elevationGain = 0;
      
      // Поскольку мы не запрашиваем данные о высоте (API не поддерживает эту опцию для walking),
      // мы можем получить приблизительное значение из другого API или использовать плейсхолдер
      
      // Используем приблизительную оценку: 10 метров набора высоты на каждый километр маршрута
      elevationGain = Math.round(route.distance / 1000 * 10);
      
      // Сохраняем информацию о маршруте
      routeRef.current = {
        distance: route.distance, // в метрах
        duration: route.duration, // в секундах
        coordinates: routeCoordinates,
        elevationGain: elevationGain // приблизительный набор высоты
      };

      // Вызываем колбэк с информацией о маршруте, если он предоставлен
      if (onRouteUpdate) {
        onRouteUpdate({
          distance: route.distance, // Передаем дистанцию в метрах без преобразования
          duration: route.duration, // Передаем время в секундах без преобразования
          coordinates: routeCoordinates,
          elevationGain: elevationGain // приблизительный набор высоты
        });
      }

      // Подгоняем карту под маршрут
      const bounds = new mapboxgl.LngLatBounds();
      routeCoordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
      
      // Обновляем состояние waypoints, если мы использовали точки из маркеров
      // и они отличаются от текущих
      if (pointsToUse !== waypoints && JSON.stringify(pointsToUse) !== JSON.stringify(waypoints)) {
        console.log("Обновляем waypoints с новыми координатами");
        setWaypoints(pointsToUse);
      }

      isRouteBuildingRef.current = false; // Сбрасываем флаг построения маршрута
      return route;
    } catch (err) {
      console.error('Ошибка при построении маршрута:', err);
      alert(`Ошибка при построении маршрута: ${err.message}. Проверьте API-ключ Mapbox в файле .env.`);
      setError(`Ошибка при построении маршрута: ${err.message}`);
      isRouteBuildingRef.current = false; // Сбрасываем флаг построения маршрута
      return null;
    }
  };

  // Обработчик клика по карте для добавления точки
  const handleMapClick = (e) => {
    const newWaypoint = [e.lngLat.lng, e.lngLat.lat];
    
    // Создаем маркер
    const marker = createMarker(newWaypoint, waypoints.length);
    
    // Сохраняем маркер в ref для последующего удаления
    markersRef.current.push(marker);
    
    // Обновляем состояние точек
    const newWaypoints = [...waypoints, newWaypoint];
    setWaypoints(newWaypoints);
    
    // Обновляем метки для всех маркеров
    updateMarkerLabels();
  };

  // Функция для очистки маршрута
  const clearRoute = () => {
    // Сбрасываем флаг построения маршрута
    isRouteBuildingRef.current = false;
    
    // Удаляем все маркеры
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Удаляем маршрут с карты
    if (map.current && map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    
    // Сбрасываем точки
    setWaypoints([]);
    routeRef.current = null;
    
    // Вызываем колбэк с обнуленной информацией о маршруте
    if (onRouteUpdate) {
      onRouteUpdate(null);
    }
  };

  // Добавляем кнопки управления
  const addControls = () => {
    // Контейнер для кнопок
    const controlContainer = document.createElement('div');
    controlContainer.className = styles.mapControls;
    
    // Кнопка для построения маршрута
    const buildRouteBtn = document.createElement('button');
    buildRouteBtn.className = styles.mapControlButton;
    buildRouteBtn.textContent = 'Построить маршрут';
    buildRouteBtn.addEventListener('click', () => {
      console.log("Нажата кнопка 'Построить маршрут'");
      
      // Если уже идет построение маршрута, выходим
      if (isRouteBuildingRef.current) {
        console.log("Кнопка: построение маршрута уже в процессе, пропускаем");
        return;
      }
      
      console.log("Текущие точки waypoints:", waypoints);
      console.log("Количество точек:", waypoints.length);
      console.log("Текущие маркеры:", markersRef.current.length);
      
      // Обновляем waypoints из текущих маркеров для синхронизации
      const updatedWaypoints = markersRef.current.map(marker => {
        const lngLat = marker.getLngLat();
        return [lngLat.lng, lngLat.lat];
      });
      
      console.log("Обновленные точки из маркеров:", updatedWaypoints);
      
      if (updatedWaypoints.length >= 2) {
        // Проверяем, изменились ли точки
        const waypointsChanged = JSON.stringify(updatedWaypoints) !== JSON.stringify(waypoints);
        
        if (waypointsChanged) {
          // Обновляем стейт перед построением маршрута
          setWaypoints(updatedWaypoints);
        } else {
          // Вызываем buildRoute напрямую, если точки не изменились
          buildRoute();
        }
      } else {
        alert("Добавьте как минимум 2 точки на карту для построения маршрута");
      }
    });
    
    // Кнопка для очистки маршрута
    const clearRouteBtn = document.createElement('button');
    clearRouteBtn.className = styles.mapControlButton;
    clearRouteBtn.textContent = 'Очистить';
    clearRouteBtn.addEventListener('click', clearRoute);
    
    // Добавляем кнопки в контейнер
    controlContainer.appendChild(buildRouteBtn);
    controlContainer.appendChild(clearRouteBtn);
    
    // Добавляем контейнер на карту
    mapContainer.current.appendChild(controlContainer);
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Clear previous error
    setError(null);
    
    // Сбрасываем флаг построения маршрута
    isRouteBuildingRef.current = false;

    // Получаем API-ключ и очищаем его от переносов строк
    const rawMapboxToken = process.env.REACT_APP_MAPBOX_KEY;
    const cleanMapboxToken = rawMapboxToken ? rawMapboxToken.replace(/[\r\n]+/g, '') : '';
    
    if (!cleanMapboxToken) {
      setError('Отсутствует API-ключ Mapbox. Пожалуйста, добавьте REACT_APP_MAPBOX_KEY в файл .env');
      return;
    }
    
    mapboxgl.accessToken = cleanMapboxToken;
    
    console.log("Используется API-ключ Mapbox:", cleanMapboxToken);

    try {
      // Initialize map if not already initialized
      if (!map.current) {
        // Координаты Свердловской области (Екатеринбург)
        const initialCoordinate = [60.6122, 56.8519];
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: initialCoordinate,
          language: "ru",
          zoom: 7
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Handle map load error
        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setError('Произошла ошибка при загрузке карты: ' + e.error?.message || e.message);
        });

        // Добавляем обработчик клика по карте после полной загрузки
        map.current.on('load', () => {
          // Устанавливаем флаг, что карта инициализирована
          mapInitializedRef.current = true;
          
          map.current.on('click', handleMapClick);
          addControls();
        });
      }
    } catch (err) {
      setError(`Ошибка загрузки карты: ${err.message}`);
      console.error('Error initializing map:', err);
    }

    // Эффект для построения маршрута при изменении точек
    if (waypoints.length >= 2 && map.current && mapInitializedRef.current) {
      buildRoute();
    }

    // Cleanup function when the component unmounts
    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Эффект, который срабатывает только при изменении точек маршрута
  useEffect(() => {
    // Если карта еще не инициализирована или точек меньше 2, не строим маршрут
    if (!mapInitializedRef.current || waypoints.length < 2) return;
    
    // Если уже идет построение маршрута, выходим
    if (isRouteBuildingRef.current) {
      console.log("useEffect: построение маршрута уже в процессе, пропускаем");
      return;
    }
    
    console.log("useEffect: waypoints изменились, количество точек:", waypoints.length);
    
    // Проверяем, совпадает ли количество маркеров с waypoints
    if (markersRef.current.length !== waypoints.length) {
      console.log("Количество маркеров не совпадает с количеством точек в waypoints");
      console.log("Маркеры:", markersRef.current.length, "Waypoints:", waypoints.length);
      return;
    }
    
    // Строим маршрут только если есть минимум 2 точки и не идет уже построение
    buildRoute();
  }, [waypoints]);

  if (error) {
    return (
      <div className={styles.mapError}>
        <h3>Ошибка карты</h3>
        <p>{error}</p>
        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          <p>Возможные причины:</p>
          <ul style={{textAlign: 'left', paddingLeft: '20px'}}>
            <li>Отсутствует API-ключ Mapbox. Проверьте файл .env</li>
            <li>Некорректный формат API-ключа (есть переносы строк)</li>
            <li>Проблемы с подключением к серверам Mapbox</li>
            <li>Выбранные точки находятся слишком далеко друг от друга</li>
          </ul>
          <p style={{marginTop: '10px'}}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Перезагрузить страницу
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
};

export default PlannerMap; 