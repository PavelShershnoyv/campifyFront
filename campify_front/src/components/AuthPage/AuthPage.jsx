import React, { useState } from 'react';
import styles from './AuthPage.module.scss';
import { Link } from 'react-router-dom';
import Logo from '../../assets/img/Logo.png';
import Tree from '../../assets/img/Tree.png';
import Tent from '../../assets/img/Tent.png';

const AuthPage = () => {
  const [rememberPassword, setRememberPassword] = useState(false);

  const handleRememberChange = () => {
    setRememberPassword(!rememberPassword);
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
          <form>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="Email" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" placeholder="Пароль" required />
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
            
            <button type="submit" className={styles.submitButton}>
              Войти
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