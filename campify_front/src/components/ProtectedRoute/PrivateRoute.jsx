import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Компонент PrivateRoute защищает маршруты, доступные только для авторизованных пользователей
 * @param {Object} props - Свойства компонента
 * @param {React.Component} props.element - Компонент для рендеринга, если пользователь авторизован
 * @returns {React.Component} - Защищенный маршрут или перенаправление на страницу входа
 */
const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useSelector(state => state.user);

  // Пока проверяем авторизацию, показываем заглушку
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь авторизован, показываем защищенный компонент
  return element;
};

export default PrivateRoute; 