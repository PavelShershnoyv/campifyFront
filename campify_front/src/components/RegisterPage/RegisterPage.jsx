import React, { useState, useEffect } from 'react';
import styles from './RegisterPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/Logo.png';
import Tree from '../../assets/img/Tree.png';
import Tent from '../../assets/img/Tent.png';
import { useUser } from '../../hooks/useUser';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { 
    register, 
    error, 
    csrfError,
    loading, 
    registerSuccess, 
    clearUserErrors, 
    resetRegistrationSuccess,
    getCsrfToken
  } = useUser();
  
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationError, setValidationError] = useState('');


  // Очистка ошибок при монтировании/размонтировании компонента
  useEffect(() => {
    clearUserErrors();
    return () => {
      clearUserErrors();
    };
  }, [clearUserErrors]);

  // Перенаправление после успешной регистрации
  useEffect(() => {
    if (registerSuccess) {
      resetRegistrationSuccess();
      navigate('/login');
    }
  }, [registerSuccess, navigate, resetRegistrationSuccess]);

  // Функция для тестирования - выводит содержимое кук в консоль

  // Обработка изменений в полях формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Сбрасываем ошибку валидации при изменении полей
    setValidationError('');
  };

  // Проверка валидности формы
  const validateForm = () => {
    if (!formData.login || !formData.email || !formData.password || !formData.confirmPassword) {
      setValidationError('Пожалуйста, заполните все поля');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Пароли не совпадают');
      return false;
    }
    
    // Базовая проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Пожалуйста, введите корректный email');
      return false;
    }
    
    return true;
  };

  // Отправка данных на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Очистка ошибок
    setValidationError('');
    clearUserErrors();
    
    // Проверка формы
    if (!validateForm()) {
      console.log('Валидация не пройдена');
      return;
    }
    
    // Отправка данных через redux
    try {
      const result = await register(formData);
      console.log('Результат вызова register:', result);
    } catch (error) {
      console.error('Ошибка при вызове register:', error);
    }
  };

  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.logoContainer}>
        <Link to="/">
          <img src={Logo} alt="Campify Logo" className={styles.logo} />
        </Link>
      </div>
      <div className={styles.leftDecoration}>
        <img src={Tree} alt="Tree" className={styles.treeImage} />
      </div>
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <p className={styles.noAccountText} style={{ cursor: 'pointer' }}>
            У вас нет учетной записи?
          </p>
          
          {(validationError || error) && (
            <p className={styles.errorMessage}>
              {validationError || error}
            </p>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Логин" 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email" 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль" 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
      <div className={styles.rightDecoration}>
        <img src={Tent} alt="Tent" className={styles.tentImage} />
      </div>
      {/* Нижний декоративный эллипс, возможно, будет позиционироваться абсолютно */}
      <div className={styles.bottomEllipse}></div>
    </div>
  );
};

export default RegisterPage; 