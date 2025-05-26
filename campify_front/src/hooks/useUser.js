import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser,
  registerUser,
  fetchUserProfile,
  checkAuthStatus,
  logout, 
  clearErrors,
  resetRegisterSuccess,
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
    registerSuccess,
    favorites
  } = useSelector(state => state.user);

  // Регистрация пользователя
  const register = async (userData) => {
    return dispatch(registerUser(userData));
  };

  // Авторизация пользователя
  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    // После успешной авторизации получаем полную информацию о пользователе
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(fetchUserProfile());
    }
    return result;
  };

  // Проверка статуса авторизации
  const checkAuth = async () => {
    return dispatch(checkAuthStatus());
  };

  // Получение полной информации о текущем пользователе
  const getUserProfile = async () => {
    return dispatch(fetchUserProfile());
  };

  // Выход из системы
  const logoutUser = () => {
    dispatch(logout());
  };

  // Очистка ошибок
  const clearUserErrors = () => {
    dispatch(clearErrors());
  };

  // Сброс успешной регистрации
  const resetRegistrationSuccess = () => {
    dispatch(resetRegisterSuccess());
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

  // Проверка, является ли текущий пользователь администратором
  const isAdmin = () => {
    return isAuthenticated && 
           currentUser && 
           currentUser.email === 'admin@adm.ru';
  };
  
  // Проверка, прошел ли пользователь тест рекомендаций
  const hasPassedTest = () => {
    return isAuthenticated && 
           currentUser && 
           currentUser.is_pass_test === true;
  };

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    registerSuccess,
    favorites,
    register,
    login,
    getUserProfile,
    logoutUser,
    clearUserErrors,
    resetRegistrationSuccess,
    addRouteToFavorites,
    removeRouteFromFavorites,
    updateProfile,
    isRouteFavorite,
    isAdmin,
    checkAuth,
    hasPassedTest
  };
}; 