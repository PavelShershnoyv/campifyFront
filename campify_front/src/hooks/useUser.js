import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  logout, 
  addToFavorites, 
  removeFromFavorites,
  updateUserProfile 
} from '../store/slices/userSlice';

export const useUser = () => {
  const dispatch = useDispatch();
  const { 
    currentUser, 
    isAuthenticated, 
    loading, 
    error,
    favorites 
  } = useSelector(state => state.user);

  // Авторизация пользователя
  const login = (credentials) => {
    return dispatch(loginUser(credentials));
  };

  // Выход из системы
  const logoutUser = () => {
    dispatch(logout());
  };

  // Добавление маршрута в избранное
  const addRouteToFavorites = (routeId) => {
    dispatch(addToFavorites(routeId));
  };

  // Удаление маршрута из избранного
  const removeRouteFromFavorites = (routeId) => {
    dispatch(removeFromFavorites(routeId));
  };

  // Обновление профиля пользователя
  const updateProfile = (profileData) => {
    dispatch(updateUserProfile(profileData));
  };

  // Проверка, находится ли маршрут в избранном
  const isRouteFavorite = (routeId) => {
    return favorites.includes(routeId);
  };

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    favorites,
    login,
    logoutUser,
    addRouteToFavorites,
    removeRouteFromFavorites,
    updateProfile,
    isRouteFavorite
  };
}; 