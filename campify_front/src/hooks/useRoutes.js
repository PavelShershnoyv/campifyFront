import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchRoutes, 
  fetchRouteById,
  fetchRoutePhotos,
  fetchRouteGpx,
  downloadRouteGpx,
  setCurrentRoute, 
  filterRoutes,
  addComment 
} from '../store/slices/routesSlice';

export const useRoutes = () => {
  const dispatch = useDispatch();
  const { 
    routes, 
    currentRoute, 
    routePhotos,
    routeGpxData,
    loading, 
    photosLoading,
    gpxLoading,
    downloadLoading,
    error,
    photosError,
    gpxError,
    downloadError,
    wildRoutes,
    equippedRoutes
  } = useSelector(state => state.routes);

  // Получение всех маршрутов
  const loadRoutes = () => {
    dispatch(fetchRoutes());
  };

  // Получение маршрута по ID
  const loadRouteById = (routeId) => {
    dispatch(fetchRouteById(routeId));
  };

  // Загрузка фотографий маршрута по ID
  const loadRoutePhotos = (routeId) => {
    dispatch(fetchRoutePhotos(routeId));
  };

  // Загрузка GPX-данных маршрута по ID
  const loadRouteGpx = (routeId) => {
    dispatch(fetchRouteGpx(routeId));
  };

  // Скачивание GPX файла маршрута по ID
  const downloadGpxFile = (routeId) => {
    dispatch(downloadRouteGpx(routeId));
  };

  // Получение фотографий для конкретного маршрута
  const getRoutePhotos = (routeId) => {
    return routePhotos[routeId] || [];
  };

  // Получение GPX-данных для конкретного маршрута
  const getRouteGpxData = (routeId) => {
    return routeGpxData[routeId] || { coordinates: [], centerCoordinate: null };
  };

  // Установка текущего маршрута
  const selectRoute = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      dispatch(setCurrentRoute(route));
    } else {
      loadRouteById(routeId);
    }
  };

  // Фильтрация маршрутов
  const applyFilters = (filters) => {
    dispatch(filterRoutes(filters));
  };

  // Добавление комментария к маршруту
  const postComment = (routeId, commentData) => {
    const comment = {
      id: Date.now(), // временный id
      author: 'Текущий пользователь', // в реальном приложении брать из user state
      text: commentData.text,
      rating: commentData.rating,
      date: new Date().toISOString()
    };
    
    dispatch(addComment({ routeId, comment }));
  };

  // Получение деталей маршрута по ID
  const getRouteById = (routeId) => {
    return routes.find(route => route.id === routeId) || null;
  };

  return {
    routes,
    wildRoutes,
    equippedRoutes,
    currentRoute,
    routePhotos,
    routeGpxData,
    loading,
    photosLoading,
    gpxLoading,
    downloadLoading,
    error,
    photosError,
    gpxError,
    downloadError,
    loadRoutes,
    loadRouteById,
    loadRoutePhotos,
    loadRouteGpx,
    downloadGpxFile,
    getRoutePhotos,
    getRouteGpxData,
    selectRoute,
    applyFilters,
    postComment,
    getRouteById
  };
}; 