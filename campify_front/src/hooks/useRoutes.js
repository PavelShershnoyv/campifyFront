import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchRoutes, 
  fetchRouteById,
  fetchRoutePhotos,
  fetchRouteGpx,
  downloadRouteGpx,
  downloadRouteChecklist,
  uploadRoutePhoto,
  fetchUncheckedPhotos,
  approvePhoto,
  rejectPhoto,
  fetchRecommendedRoutes,
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
    uncheckedPhotos,
    recommendedRoutes,
    loading, 
    photosLoading,
    gpxLoading,
    downloadLoading,
    checklistDownloadLoading,
    photoUploadLoading,
    moderationLoading,
    recommendedLoading,
    error,
    photosError,
    gpxError,
    downloadError,
    checklistDownloadError,
    photoUploadError,
    moderationError,
    recommendedError,
    wildRoutes,
    equippedRoutes
  } = useSelector(state => state.routes);

  // Получение всех маршрутов
  const loadRoutes = () => {
    dispatch(fetchRoutes());
  };

  // Получение рекомендованных маршрутов для пользователя
  const loadRecommendedRoutes = (userId) => {
    dispatch(fetchRecommendedRoutes(userId));
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

  // Скачивание чек-листа маршрута по ID
  const downloadChecklistFile = (routeId) => {
    dispatch(downloadRouteChecklist(routeId));
  };

  // Загрузка новой фотографии для маршрута
  const uploadPhoto = (routeId, image) => {
    return dispatch(uploadRoutePhoto({ routeId, image }));
  };

  // Получение фотографий для конкретного маршрута
  const getRoutePhotos = (routeId) => {
    return routePhotos[routeId] || [];
  };

  // Получение GPX-данных для конкретного маршрута
  const getRouteGpxData = (routeId) => {
    return routeGpxData[routeId] || null;
  };

  // Установка текущего маршрута
  const selectRoute = (route) => {
    dispatch(setCurrentRoute(route));
  };

  // Фильтрация маршрутов
  const applyFilters = (filters) => {
    dispatch(filterRoutes(filters));
  };

  // Добавление комментария к маршруту
  const postComment = (routeId, comment) => {
    dispatch(addComment({ routeId, comment }));
  };

  // Получение деталей маршрута по ID
  const getRouteById = (id) => {
    return routes.find(route => route.id === id) || null;
  };

  // Загрузка непроверенных фотографий для модерации
  const loadUncheckedPhotos = () => {
    dispatch(fetchUncheckedPhotos());
  };

  // Одобрение фотографии в процессе модерации
  const approvePhotoMod = (photoId) => {
    return dispatch(approvePhoto(photoId));
  };

  // Отклонение фотографии в процессе модерации
  const rejectPhotoMod = (photoId) => {
    return dispatch(rejectPhoto(photoId));
  };

  return {
    routes,
    wildRoutes,
    equippedRoutes,
    currentRoute,
    routePhotos,
    routeGpxData,
    uncheckedPhotos,
    recommendedRoutes,
    loading,
    photosLoading,
    gpxLoading,
    downloadLoading,
    checklistDownloadLoading,
    photoUploadLoading,
    moderationLoading,
    recommendedLoading,
    error,
    photosError,
    gpxError,
    downloadError,
    checklistDownloadError,
    photoUploadError,
    moderationError,
    recommendedError,
    loadRoutes,
    loadRecommendedRoutes,
    loadRouteById,
    loadRoutePhotos,
    loadRouteGpx,
    downloadGpxFile,
    downloadChecklistFile,
    uploadPhoto,
    getRoutePhotos,
    getRouteGpxData,
    selectRoute,
    applyFilters,
    postComment,
    getRouteById,
    loadUncheckedPhotos,
    approvePhotoMod,
    rejectPhotoMod
  };
}; 