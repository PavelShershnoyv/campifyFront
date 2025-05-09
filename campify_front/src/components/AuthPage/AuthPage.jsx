import React, { useState, useEffect } from 'react';
import styles from './AuthPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/Logo.png';
import Tree from '../../assets/img/Tree.png';
import Tent from '../../assets/img/Tent.png';
import { useUser } from '../../hooks/useUser';

const AuthPage = () => {
  const navigate = useNavigate();
  const { 
    login, 
    error, 
    loading, 
    isAuthenticated, 
    clearUserErrors,
    getCsrfToken 
  } = useUser();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Получение CSRF токена при загрузке компонента

  // Очистка ошибок при монтировании/размонтировании компонента
  useEffect(() => {
    clearUserErrors();
    return () => {
      clearUserErrors();
    };
  }, [clearUserErrors]);

  // Перенаправление после успешной авторизации
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRememberChange = () => {
    setRememberPassword(!rememberPassword);
  };

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
    if (!formData.email || !formData.password) {
      setValidationError('Пожалуйста, заполните все поля');
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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Очистка ошибок
    setValidationError('');
    clearUserErrors();
    
    // Проверка формы
    if (!validateForm()) {
      return;
    }
    
    // Отправка данных через redux
    login({
      ...formData,
      remember: rememberPassword
    });
  };

  return (
    <div className={styles.authPageContainer}>
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
          <h1 className={styles.title}>Вход</h1>
          
          {(validationError || error) && (
            <p className={styles.errorMessage}>
              {validationError || error}
            </p>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className={styles.optionsRow}>
              <div className={styles.rememberMeContainer}>
                <label className={styles.checkbox}>
                  <input 
                    type="checkbox" 
                    checked={rememberPassword} 
                    onChange={handleRememberChange}
                  />
                  <span className={styles.checkmark}></span>
                  <span>Запомнить пароль</span>
                </label>
              </div>
              <div className={styles.forgotPasswordContainer}>
                <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                  Забыли пароль?
                </Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
      <div className={styles.rightDecoration}>
        <img src={Tent} alt="Tent" className={styles.tentImage} />
      </div>
      <div className={styles.bottomEllipse}></div>
    </div>
  );
};

export default AuthPage; 