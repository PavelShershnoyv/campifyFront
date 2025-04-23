import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './RouteMap.module.scss';

// Маркер для начальной и конечной точки
const createMarkerElement = (type) => {
  const el = document.createElement('div');
  el.className = type === 'start' ? styles.startMarker : styles.endMarker;
  return el;
};

const RouteMap = ({ coords = [], centerCoordinate, routeName }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const markersRef = useRef([]);

  // Validate coordinates
  const validCoords = Array.isArray(coords) && coords.length >= 2 && 
    coords.every(coord => Array.isArray(coord) && coord.length === 2 && 
    !isNaN(coord[0]) && !isNaN(coord[1]));

  useEffect(() => {
    if (!mapContainer.current) return;
    console.log(coords);
    // Clear previous error
    setError(null);

    // Mapbox API token
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

    try {
      // Initialize map
      if (!map.current) {
        // Default to Moscow if no valid coordinates
        const initialCoordinate = centerCoordinate || 
          (validCoords ? coords[0] : [37.6173, 55.7558]);
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: initialCoordinate,
          language: "ru",
          zoom: 10
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Handle map load error
        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setError('Произошла ошибка при загрузке карты');
        });
      }

      // Clean up previous markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add route when map loads or is already loaded
      const addRouteToMap = () => {
        if (!validCoords) {
          return;
        }

        // Remove existing route if it exists
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
        
        // Add route source and layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
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

        // Add markers for start and end points using custom elements
        const startMarker = new mapboxgl.Marker(createMarkerElement('start'))
          .setLngLat(coords[0])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${routeName || 'Начало маршрута'}</h3>`))
          .addTo(map.current);
        
        const endMarker = new mapboxgl.Marker(createMarkerElement('end'))
          .setLngLat(coords[coords.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${routeName || 'Конец маршрута'}</h3>`))
          .addTo(map.current);
        
        markersRef.current.push(startMarker, endMarker);

        // Fit bounds to show the entire route with padding
        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14
        });
      };

      if (map.current.loaded()) {
        addRouteToMap();
      } else {
        map.current.on('load', addRouteToMap);
      }
    } catch (err) {
      setError(`Ошибка загрузки карты: ${err.message}`);
      console.error('Error initializing map:', err);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [coords, centerCoordinate, routeName, validCoords]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (error) {
    return <div className={styles.mapError}>{error}</div>;
  }

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainer} className={styles.map} />
      {!validCoords && (
        <div className={styles.noCoordinates}>
          Для этого маршрута координаты не указаны или некорректны
        </div>
      )}
    </div>
  );
};

export default RouteMap; 