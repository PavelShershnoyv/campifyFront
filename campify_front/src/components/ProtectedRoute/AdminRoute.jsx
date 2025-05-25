import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';


const AdminRoute = ({ element }) => {
  const { isAuthenticated, isAdmin, loading } = useUser();
  
  // Пока загружаем информацию о пользователе, показываем заглушку
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    // Если пользователь не админ, перенаправляем на главную страницу
    return <Navigate to="/" replace />;
  }

  // Если пользователь админ, показываем защищенное содержимое
  return element;
};

export default AdminRoute; 