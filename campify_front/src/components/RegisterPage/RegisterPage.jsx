import React from 'react';
import styles from './RegisterPage.module.scss';
import { Link } from 'react-router-dom'; // Предполагаем, что для ссылки "У вас есть аккаунт? Войти" понадобится Link
import Logo from '../../assets/img/Logo.png';
import Tree from '../../assets/img/Tree.png';
import Tent from '../../assets/img/Tent.png';

const RegisterPage = () => {
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
          <p className={styles.noAccountText}>У вас нет учетной записи?</p>

          <form>
            <div className={styles.inputGroup}>
              <input type="text" placeholder="Логин" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="Email" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" placeholder="Пароль" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" placeholder="Повторите пароль" required />
            </div>
            <button type="submit" className={styles.submitButton}>
              Зарегистрироваться
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