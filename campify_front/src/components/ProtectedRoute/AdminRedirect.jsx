import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

/**
 * Компонент AdminRedirect отслеживает состояние аутентификации
 * и автоматически перенаправляет администратора на страницу модерации
 */
const AdminRedirect = () => {
  const { currentUser, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, является ли пользователь администратором и перенаправляем его
  useEffect(() => {
    // Проверяем, что пользователь авторизован и есть данные о нем
    if (isAuthenticated && currentUser) {
      // Если это администратор и он не находится на странице модерации или логина
      if (currentUser.email === 'admin@adm.ru' && 
          location.pathname !== '/moderation' && 
          location.pathname !== '/login') {
        navigate('/moderation');
      }
    }
  }, [isAuthenticated, currentUser, location.pathname, navigate]);

  // Компонент не рендерит ничего, он только выполняет перенаправление
  return null;
};

export default AdminRedirect; 