import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import FooterLogo from '../../assets/img/FooterLogo.png';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.logoContainer}>
            <Link to="/">
              <img src={FooterLogo} alt="Campify" className={styles.logo} />
            </Link>
          </div>
          <div className={styles.navigation}>
            <Link to="/routes" className={styles.navLink}>Маршруты</Link>
            <Link to="/scheduler" className={styles.navLink}>Планировщик</Link>
            <Link to="/about" className={styles.navLink}>О нас</Link>
          </div>
        </div>
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>© 2025 Campify. Все права защищены</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 