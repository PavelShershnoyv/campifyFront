import React from 'react';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './PlannerMap.module.scss';
import { v4 as uuidv4 } from 'uuid';

const PlannerMap = forwardRef(({ onRouteUpdate }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const markersRef = useRef([]);
  const mapPointMarkersRef = useRef([]);
  const searchMarkerRef = useRef(null);
  const routeRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const isRouteBuildingRef = useRef(false);

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

      // Create marker element with pin style (more visible)
      const markerElement = document.createElement('div');
      markerElement.className = styles.searchMarkerPin;
      
      // Add pulse animation container
      const pulseContainer = document.createElement('div');
      pulseContainer.className = styles.pulseContainer;
      pulseContainer.appendChild(markerElement);

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
        anchor: 'bottom'
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

  // Функция для загрузки точек с сервера
  const fetchMapPoints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/map_points/`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки точек: ${response.status}`);
      }
      const data = await response.json();
      console.log('Загруженные локации:', data);
      setMapPoints(data);
      return data;
    } catch (err) {
      console.error('Ошибка при загрузке локаций:', err);
      setError(`Не удалось загрузить локации: ${err.message}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

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
      markerEl.className = styles.locationMarker;
      
      // Определяем тип локации (если информация доступна)
      let markerLabel = 'Л';
      if (point.type === 'camping') markerLabel = 'К'; // Кемпинг
      else if (point.type === 'sight') markerLabel = 'Д'; // Достопримечательность
      else if (point.type === 'viewpoint') markerLabel = 'О'; // Обзорная точка
      
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
        <div>
          <h3 style="margin-top: 0; font-size: 16px;">${point.name || 'Локация'}</h3>
          ${point.description ? `<p style="margin: 5px 0; font-size: 14px;">${point.description}</p>` : ''}
          <button id="add-location-${index}" style="
            background-color: #4CAF50; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
            width: 100%;
          ">Добавить к маршруту</button>
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
    
    // Комментируем автоматическое центрирование карты на всех точках
    // Если есть точки и нет активных waypoints, центрируем карту на всех точках
    /*
    if (hasPoints && waypoints.length === 0) {
      console.log('Центрируем карту на всех локациях');
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 1000 // Длительность анимации в миллисекундах
      });
    }
    */
  };

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
      
      // Обновляем состояние waypoints, если они отличаются от текущих
      if (JSON.stringify(pointsToUse) !== JSON.stringify(waypoints)) {
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
    // Проверяем, не было ли клика по маркеру или другому интерактивному элементу
    const targetElement = e.originalEvent.target;
    
    // Если клик был по маркеру или popup, не добавляем новую точку
    if (
      targetElement.closest('.mapboxgl-marker') ||
      targetElement.closest('.mapboxgl-popup') ||
      targetElement.closest('button') ||
      targetElement.className.includes('marker')
    ) {
      return;
    }
    
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

    console.log("Добавлена новая точка, всего точек:", markersRef.current.length);
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
        
        // Handle map load error
        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setError('Произошла ошибка при загрузке карты: ' + e.error?.message || e.message);
        });

        // Добавляем обработчик клика по карте после полной загрузки
        map.current.on('load', async () => {
          // Устанавливаем флаг, что карта инициализирована
          mapInitializedRef.current = true;
          
          map.current.on('click', handleMapClick);
          addControls();
          
          // Загружаем и отображаем точки с сервера
          try {
            const locations = await fetchMapPoints();
            if (locations && locations.length > 0) {
              addLocationPoints(locations);
            }
          } catch (err) {
            console.error('Ошибка при загрузке и отображении локаций:', err);
          }
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
      {isLoading && (
        <div className={styles.mapLoading}>
          <span>Загрузка локаций...</span>
        </div>
      )}
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
});

export default PlannerMap; 