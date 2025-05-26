import React from 'react';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './PlannerMap.module.scss';
import { v4 as uuidv4 } from 'uuid';
import { fetchMapPoints, buildRouteThunk, clearRoute, saveRouteThunk } from '../../features/map/mapPointsSlice';

const PlannerMap = forwardRef(({ onRouteUpdate }, ref) => {
  const dispatch = useDispatch();
  
  // Получаем данные из Redux store
  const { points: mapPoints, loading: isLoading, error: reduxError, currentRoute, routeLoading, routeError, saveRouteLoading, saveRouteError } = useSelector(state => state.mapPoints);
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  
  console.log('PlannerMap - Redux state:', useSelector(state => state));
  console.log('PlannerMap - User state:', useSelector(state => state.user));
  console.log('PlannerMap - CurrentUser:', currentUser);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const markersRef = useRef([]);
  const mapPointMarkersRef = useRef([]);
  const searchMarkerRef = useRef(null);
  const routeRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const isRouteBuildingRef = useRef(false);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');

  // Экспортируем методы для внешнего доступа через ref
  useImperativeHandle(ref, () => ({
    // Функция для перемещения карты к заданной локации
    flyToLocation: (location) => {
      if (!location || !location.coordinates || !map.current) {
        console.error('Invalid location data or map not initialized');
        return;
      }

      // Remove previous search marker if exists
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }

      // Создаем контейнер для маркера
      const markerContainer = document.createElement('div');
      markerContainer.className = styles.markerContainer;

      // Create marker element with pin style (more visible)
      const markerElement = document.createElement('div');
      markerElement.className = styles.searchMarkerPin;
      
      // Добавляем маркер в контейнер
      markerContainer.appendChild(markerElement);
      
      // Add pulse animation container
      const pulseContainer = document.createElement('div');
      pulseContainer.className = styles.pulseContainer;
      pulseContainer.appendChild(markerContainer);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: styles.markerPopup
      });

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = styles.popupContent;
      
      // Add location name
      const locationName = document.createElement('div');
      locationName.className = styles.locationName;
      locationName.textContent = location.name || 'Найденное место';
      popupContent.appendChild(locationName);
      
      // Add buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = styles.popupButtons;
      
      // Add "Add to route" button
      const addButton = document.createElement('button');
      addButton.className = styles.popupButton;
      addButton.textContent = 'Добавить в маршрут';
      addButton.onclick = () => {
        // Create a waypoint at this location
        const coordinates = location.coordinates;
        
        // Create marker for route point
        const routeMarker = createMarker(coordinates, waypoints.length);
        
        // Save marker reference for later removal
        markersRef.current.push(routeMarker);
        
        // Update waypoints
        const newWaypoints = [...waypoints, coordinates];
        setWaypoints(newWaypoints);
        
        // Update marker labels
        updateMarkerLabels();
        
        // Close the popup and remove search marker
        popup.remove();
        
        // Remove search marker
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
          searchMarkerRef.current = null;
        }
        
        // Вызываем callback для очистки поискового запроса, если он есть
        if (location.onAddToRoute && typeof location.onAddToRoute === 'function') {
          location.onAddToRoute();
        }
        
        console.log(`Точка поиска добавлена к маршруту, всего точек:`, newWaypoints.length);
        
        // After adding a point, check if we can build a route
        if (newWaypoints.length >= 2) {
          console.log('Можно построить маршрут, у нас достаточно точек:', newWaypoints.length);
        }
      };
      buttonsContainer.appendChild(addButton);
      popupContent.appendChild(buttonsContainer);
      
      // Set popup content
      popup.setDOMContent(popupContent);

      // Create the marker
      searchMarkerRef.current = new mapboxgl.Marker({
        element: pulseContainer,
        anchor: 'center',
        offset: [0, 0]
      })
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current);
      
      // Open popup automatically
      searchMarkerRef.current.togglePopup();

      // Fly to the location with animation
      map.current.flyTo({
        center: location.coordinates,
        essential: true,
        speed: 0.8,
        curve: 1.42
      });
    },
    
    // Функция для получения текущих координат центра карты
    getCurrentCenter: () => {
      if (!map.current) return null;
      return map.current.getCenter();
    },
    
    // Функция для получения текущего зума карты
    getCurrentZoom: () => {
      if (!map.current) return null;
      return map.current.getZoom();
    }
  }));

  // Функция для добавления точек локаций на карту
  const addLocationPoints = (points) => {
    // Удаляем предыдущие маркеры локаций
    mapPointMarkersRef.current.forEach(marker => marker.remove());
    mapPointMarkersRef.current = [];
    
    // Создаем границы для всех точек
    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;
    
    points.forEach((point, index) => {
      // Проверяем, есть ли координаты
      if (!point.longitude || !point.latitude) {
        console.warn(`Локация ${point.name} не имеет координат`);
        return;
      }
      
      const coordinates = [parseFloat(point.longitude), parseFloat(point.latitude)];
      
      // Расширяем границы
      bounds.extend(coordinates);
      hasPoints = true;
      
      // Создаем элемент маркера
      const markerEl = document.createElement('div');
      
      // Определяем тип локации и стиль маркера
      let markerLabel = 'Л';
      let markerClass = styles.locationMarker;
      
      if (point.type === 'camping') markerLabel = 'К'; // Кемпинг
      else if (point.type === 'sight') markerLabel = 'Д'; // Достопримечательность
      else if (point.type === 'viewpoint') markerLabel = 'О'; // Обзорная точка
      else if (point.type === 'danger') {
        markerLabel = '⚠'; // Знак опасности
        markerClass = styles.dangerMarker; // Красный стиль
      }
      
      markerEl.className = markerClass;
      markerEl.innerText = markerLabel;
      markerEl.title = point.name || 'Локация';
    
      // Добавляем data-атрибут с информацией о точке
      markerEl.dataset.locationName = point.name || 'Локация';
      
      // Создаем всплывающую подсказку
      const tooltipDiv = document.createElement('div');
      tooltipDiv.className = styles.markerTooltip;
      tooltipDiv.textContent = point.name || 'Локация';
      markerEl.appendChild(tooltipDiv);
      
      // Показываем/скрываем подсказку при наведении
      markerEl.addEventListener('mouseenter', () => {
        tooltipDiv.style.display = 'block';
      });
      
      markerEl.addEventListener('mouseleave', () => {
        tooltipDiv.style.display = 'none';
      });
        
        // Создаем popup с информацией о точке
        const popupContent = `
          <div style="max-width: 200px;">
          ${point.image ? `<img src="${point.image}" alt="${point.name || 'Локация'}" style="
              width: 100%; 
              height: 80px; 
              object-fit: cover; 
              border-radius: 6px; 
              margin-bottom: 8px;
            ">` : ''}
            <h3 style="
              margin: 0 0 6px 0; 
              font-size: 14px; 
              color: #333; 
              font-weight: 600;
              line-height: 1.3;
          ">${point.name || 'Локация'}</h3>
                    ${point.description ? `<p style="
            margin: 0 0 10px 0; 
            font-size: 12px; 
            color: #666; 
            line-height: 1.4;
          ">${point.description}</p>` : ''}
          ${point.type !== 'danger' ? `<button id="add-location-${index}" style="
            background-color: #4CAF50; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            font-size: 12px;
            font-weight: 500;
          ">Добавить к маршруту</button>` : ''}
          </div>
        `;
        
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25
      }).setHTML(popupContent);
      
      // Создаем маркер
      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'bottom'
        })
          .setLngLat(coordinates)
        .setPopup(popup)
          .addTo(map.current);
        
      // Сохраняем маркер в ref
      mapPointMarkersRef.current.push(marker);
      
            // Добавляем обработчик для кнопки в popup после добавления popup в DOM
      popup.on('open', () => {
        // Пропускаем добавление обработчика для опасных локаций
        if (point.type === 'danger') {
          console.log(`Локация ${point.name} помечена как опасная, кнопка не добавляется`);
          return;
        }
        
        console.log(`Popup для локации ${point.name} открыт, ищем кнопку #add-location-${index}`);
        setTimeout(() => {
          const addButton = document.getElementById(`add-location-${index}`);
          console.log(`Кнопка для локации ${point.name}:`, addButton);
          
          if (addButton) {
            // Удаляем предыдущие обработчики, если они есть
            addButton.replaceWith(addButton.cloneNode(true));
            const newAddButton = document.getElementById(`add-location-${index}`);
            
            // Добавляем новый обработчик
            newAddButton.addEventListener('click', function(e) {
              // Предотвращаем распространение события вверх
                  e.preventDefault();
                  e.stopPropagation();
                  
              console.log(`Кнопка "Добавить к маршруту" нажата для локации ${point.name}`);
                  console.log(`Координаты локации:`, coordinates);
                  
                  // Создаем маркер маршрута
                  const routeMarker = createMarker(coordinates, waypoints.length);
                  
                  // Сохраняем маркер в ref для последующего удаления
                  markersRef.current.push(routeMarker);
                  
                  // Обновляем состояние точек
                  const newWaypoints = [...waypoints, coordinates];
                  setWaypoints(newWaypoints);
                  
                  // Обновляем метки для всех маркеров
                  updateMarkerLabels();
                  
                  // Закрываем popup после добавления точки к маршруту
              marker.togglePopup();
                  
                  // После добавления точки, проверяем можно ли построить маршрут
                  if (newWaypoints.length >= 2) {
                    console.log('Можно построить маршрут, у нас достаточно точек:', newWaypoints.length);
                  }
                  
              console.log(`Точка локации ${point.name} добавлена к маршруту, всего точек:`, markersRef.current.length);
                });
            
            console.log(`Обработчик клика добавлен для кнопки локации ${point.name}`);
          } else {
            console.warn(`Не удалось найти кнопку для локации ${point.name} с ID #add-location-${index}`);
              }
            }, 100);
          });
      });
  };

  // Функция для создания маркера
  const createMarker = (lngLat, index) => {
    // Используем стандартный маркер MapboxGL с цветом
    const color = index === 0 ? '#4CAF50' : '#ff6b35';
    const marker = new mapboxgl.Marker({ color })
      .setLngLat(lngLat)
      .addTo(map.current);
    return marker;
  };

  // Функция для обновления нумерации маркеров (теперь не нужна, но оставим для popup)
  const updateMarkerLabels = () => {
    markersRef.current.forEach((marker, index) => {
      // Можно добавить popup с буквой/цифрой, если нужно:
      // marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(...))
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
    
    // Проверяем, есть ли достаточно точек для построения маршрута
    if (markersRef.current.length < 2) {
      console.log("Недостаточно точек для построения маршрута");
      alert("Добавьте как минимум 2 точки на карту для построения маршрута");
      isRouteBuildingRef.current = false; // Сбрасываем флаг
      return;
    }
    
    // Используем точки из маркеров
    const pointsToUse = currentWaypoints;
    
    console.log("Будем использовать точки:", pointsToUse, "Количество:", pointsToUse.length);

    try {
      // Формируем координаты для запроса в формате строки
      const coordinates = pointsToUse.map(point => `${point[0]},${point[1]}`).join(';');
      
      console.log("Построение маршрута между точками:", pointsToUse);
      
      // Используем Redux Toolkit для запроса
      const resultAction = await dispatch(buildRouteThunk({
        coordinates,
        accessToken: mapboxgl.accessToken
      }));
      
      // Проверяем результат
      if (buildRouteThunk.fulfilled.match(resultAction)) {
        const route = resultAction.payload;
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
        
        // Приблизительная оценка: 10 метров набора высоты на каждый километр маршрута
        elevationGain = Math.round(route.distance / 1000 * 10);
        
        // Сохраняем информацию о маршруте
        routeRef.current = {
          distance: route.distance, // в метрах
          duration: route.duration, // в секундах
          coordinates: routeCoordinates,
          elevationGain: elevationGain
        };

        // Вызываем колбэк с информацией о маршруте, если он предоставлен
        if (onRouteUpdate) {
          onRouteUpdate({
            distance: route.distance,
            duration: route.duration,
            coordinates: routeCoordinates,
            elevationGain: elevationGain 
          });
        }

        // Подгоняем карту под маршрут
        const bounds = new mapboxgl.LngLatBounds();
        routeCoordinates.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14
        });
        
        // Обновляем состояние waypoints, если они отличаются от текущих
        if (JSON.stringify(pointsToUse) !== JSON.stringify(waypoints)) {
          console.log("Обновляем waypoints с новыми координатами");
          setWaypoints(pointsToUse);
        }
      } else {
        // Обрабатываем ошибку, если запрос не удался
        const errorMessage = resultAction.payload || 'Ошибка при построении маршрута';
        alert(`Ошибка при построении маршрута: ${errorMessage}. Проверьте API-ключ Mapbox в файле .env.`);
        setError(`Ошибка при построении маршрута: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Ошибка при построении маршрута:', err);
      alert(`Ошибка при построении маршрута: ${err.message}. Проверьте API-ключ Mapbox в файле .env.`);
      setError(`Ошибка при построении маршрута: ${err.message}`);
    } finally {
      isRouteBuildingRef.current = false; // Сбрасываем флаг построения маршрута
    }
  };

  // Функция для сохранения маршрута
  const saveRoute = () => {
    if (!routeRef.current) {
      alert('Сначала постройте маршрут для сохранения');
      return;
    }
    
    // Проверяем авторизацию пользователя
    if (!isAuthenticated || !currentUser || !currentUser.id) {
      alert('Необходимо авторизоваться для сохранения маршрута');
      return;
    }
    
    console.log('Данные о пользователе при сохранении маршрута:', currentUser);
    console.log('ID пользователя для сохранения:', currentUser.id);
    
    // Получаем название маршрута
    const routeName = prompt('Введите название маршрута', 'Новый маршрут');
    if (!routeName || !routeName.trim()) {
      alert('Название маршрута не может быть пустым');
      return; // Пользователь отменил операцию или ввел пустое имя
    }

    // Форматируем продолжительность в формат HH:MM:SS
    const formatDuration = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Формируем данные маршрута в соответствии с ожидаемым форматом API и mapPointsSlice
    const routeData = {
      name: routeName.trim(),
      description: routeDescription.trim() || "",
      location_area: "Россия Свердловская область",
      duration: formatDuration(routeRef.current.duration),
      chat_link: "http://127.0.0.1:8000/example/",
      views: 0,
      is_public: false,
      length_in_km: routeRef.current.distance / 1000, // конвертируем метры в километры
      height: routeRef.current.elevationGain || 0,
      difficulty: 1, // базовая сложность
      type: 1, // тип маршрута
      coordinates: routeRef.current.coordinates,
      waypoints: waypoints
    };
    
    console.log('Данные маршрута для сохранения:', routeData);
    console.log('ID пользователя:', currentUser.id);
    
    // Отправляем запрос на сохранение маршрута
    dispatch(saveRouteThunk(routeData))
      .unwrap()
      .then(data => {
        console.log('Маршрут успешно сохранен:', data);
        alert('Маршрут успешно сохранен!');
        setRouteName('');
        setRouteDescription('');
      })
      .catch(error => {
        console.error('Ошибка при сохранении маршрута:', error);
        alert(`Ошибка при сохранении маршрута: ${error.message || error}`);
      });
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
      
      // Прямая проверка количества маркеров (актуальных точек на карте)
      if (markersRef.current.length < 2) {
        console.log("Недостаточно точек для построения маршрута");
        alert("Добавьте как минимум 2 точки на карту для построения маршрута");
        return;
      }
      
      // Вызываем функцию построения маршрута напрямую
      buildRoute();
    });
    
    // Кнопка для очистки маршрута
    const clearRouteBtn = document.createElement('button');
    clearRouteBtn.className = styles.mapControlButton;
    clearRouteBtn.textContent = 'Очистить';
    clearRouteBtn.addEventListener('click', clearRouteHandler);
    
    // Добавляем кнопки в контейнер
    controlContainer.appendChild(buildRouteBtn);
    controlContainer.appendChild(clearRouteBtn);
    
    // Добавляем контейнер на карту - проверяем существование
    if (mapContainer.current) {
      mapContainer.current.appendChild(controlContainer);
    }
  };

  // Функция для очистки маршрута
  const clearRouteHandler = () => {
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
    
    // Очищаем маршрут в Redux
    dispatch(clearRoute());
    
    // Вызываем колбэк с обнуленной информацией о маршруте
    if (onRouteUpdate) {
      onRouteUpdate(null);
    }
    // Очищаем также имя и описание маршрута
    setRouteName('');
    setRouteDescription('');
  };

  // Устанавливаем ошибку из Redux если она есть
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    } else if (routeError) {
      setError(routeError);
    }
  }, [reduxError, routeError]);

  // Добавляем обработчик клика по карте после полной загрузки
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
          zoom: 9 // Увеличиваем стартовый зум для лучшей видимости
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Handle map load error (только если map.current существует)
        if (map.current) {
          map.current.on('error', (e) => {
            console.error('Map error:', e);
            setError('Произошла ошибка при загрузке карты: ' + e.error?.message || e.message);
          });

          // Добавляем обработчик клика по карте после полной загрузки
          map.current.on('load', async () => {
            // Устанавливаем флаг, что карта инициализирована
            mapInitializedRef.current = true;

            // Добавляем обработчик клика непосредственно на карту через API Mapbox
            // Этот метод обеспечивает точные географические координаты
            map.current.on('click', function(e) {
              // Проверяем, не был ли клик по маркеру или элементу управления
              // Используем проверку оригинального события
              if (e.originalEvent && e.originalEvent.target) {
                const target = e.originalEvent.target;
                
                // Если клик был по маркеру или элементу управления - игнорируем
                if (target.closest('.mapboxgl-marker') || 
                    target.closest('.mapboxgl-ctrl') || 
                    target.closest('.mapboxgl-popup') || 
                    (target.closest('.' + styles.mapControls))) {
                  console.log('Клик по маркеру или элементу управления - игнорируем');
                  return;
                }
              }
              
              // Получаем координаты клика напрямую из события Mapbox
              // Это гарантирует точность позиционирования
              const lngLat = e.lngLat;
              
              console.log('Координаты клика от API Mapbox:', [lngLat.lng, lngLat.lat]);
              
              // Создаем маркер точно в точке клика
              const newWaypoint = [lngLat.lng, lngLat.lat];
              const marker = createMarker(newWaypoint, waypoints.length);
              
              // Сохраняем маркер
              markersRef.current.push(marker);
              
              // Обновляем состояние точек
              const newWaypoints = [...waypoints, newWaypoint];
              setWaypoints(newWaypoints);
              
              // Обновляем метки
              updateMarkerLabels();
              
              console.log(`Добавлена новая точка #${markersRef.current.length}, всего точек:`, markersRef.current.length);
            });
            
            addControls();
            
            // Загружаем точки с помощью Redux
            dispatch(fetchMapPoints());
          });
        }
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
        if (mapContainer.current) {
          // Удаляем обработчик клика, чтобы избежать утечек памяти
          mapContainer.current.removeEventListener('click', null);
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Отображаем точки на карте, когда они загружены из Redux
  useEffect(() => {
    if (mapPoints && mapPoints.length > 0 && map.current && mapInitializedRef.current) {
      addLocationPoints(mapPoints);
    }
  }, [mapPoints]);

  // Эффект, который срабатывает только при изменении точек маршрута
  // useEffect(() => {
  //   // Отключено: теперь маршрут строится только по кнопке
  //   // if (!mapInitializedRef.current || waypoints.length < 2) return;
  //   // if (isRouteBuildingRef.current) return;
  //   // if (markersRef.current.length !== waypoints.length) return;
  //   // buildRoute();
  // }, [waypoints]);

  if (error) {
    return (
      <div className={styles.mapError}>
        <h3>Ошибка карты</h3>
        <p>{error}</p>
        <div style={{ marginTop: '10px', fontSize: '14px' }}>
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
      {isLoading && (
        <div className={styles.mapLoading}>
          <span>Загрузка локаций...</span>
        </div>
      )}
      {saveRouteLoading && (
        <div className={styles.mapLoading}>
          <span>Сохранение маршрута...</span>
        </div>
      )}
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
});

export default PlannerMap; 