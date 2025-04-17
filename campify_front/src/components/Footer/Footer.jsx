import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import YouTube from '../../assets/icon/YouTube.png';
import Instagram from '../../assets/icon/Instagram.png';
import FaceBook from '../../assets/icon/FaceBook.png';
import Twitter from '../../assets/icon/Twitter.png';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* About section */}
          <div className={styles.about}>
            <div className={styles.logo}>Campify</div>
            <div className={styles.social}>
              <Link to="#" className={styles.socialLink} onClick={(e) => { e.preventDefault(); window.open('https://www.youtube.com', '_blank'); }}>
                <div className={styles.socialIcon}>
                  <img src={YouTube} alt="YouTube" className={styles.iconInner} />
                </div>
              </Link>
              <Link to="#" className={styles.socialLink} onClick={(e) => { e.preventDefault(); window.open('https://www.instagram.com', '_blank'); }}>
                <div className={styles.socialIcon}>
                  <img src={Instagram} alt="Instagram" className={styles.iconInner} />
                </div>
              </Link>
              <Link to="#" className={styles.socialLink} onClick={(e) => { e.preventDefault(); window.open('https://www.facebook.com', '_blank'); }}>
                <div className={styles.socialIcon}>
                  <img src={FaceBook} alt="Facebook" className={styles.iconInner} />
                </div>
              </Link>
              <Link to="#" className={styles.socialLink} onClick={(e) => { e.preventDefault(); window.open('https://twitter.com', '_blank'); }}>
                <div className={styles.socialIcon}>
                  <img src={Twitter} alt="Twitter" className={styles.iconInner} />
                </div>
              </Link>
            </div>
          </div>
          
          {/* Information section */}
          <div className={styles.menu}>
            <h3 className={styles.menuTitle}>Information</h3>
            <ul className={styles.menuList}>
              <li className={styles.menuItem}><Link to="/facilities" className={styles.menuLink}>Facilities</Link></li>
              <li className={styles.menuItem}><Link to="/news" className={styles.menuLink}>News</Link></li>
              <li className={styles.menuItem}><Link to="/events" className={styles.menuLink}>Events</Link></li>
              <li className={styles.menuItem}><Link to="/blog" className={styles.menuLink}>Blog</Link></li>
            </ul>
          </div>
          
          {/* Useful Links section */}
          <div className={styles.menu}>
            <h3 className={styles.menuTitle}>Useful Links</h3>
            <ul className={styles.menuList}>
              <li className={styles.menuItem}><Link to="/" className={styles.menuLink}>Home</Link></li>
              <li className={styles.menuItem}><Link to="/package" className={styles.menuLink}>Package</Link></li>
              <li className={styles.menuItem}><Link to="/ticket" className={styles.menuLink}>Ticket</Link></li>
              <li className={styles.menuItem}><Link to="/about" className={styles.menuLink}>About Us</Link></li>
            </ul>
          </div>

          {/* Contact section */}
          <div className={styles.menu}>
            <h3 className={styles.menuTitle}>Contact</h3>
            <ul className={styles.menuList}>
              <li className={styles.menuItem}><Link to="/headquarters" className={styles.menuLink}>Headquarters</Link></li>
              <li className={styles.menuItem}><Link to="/manager" className={styles.menuLink}>Manager</Link></li>
              <li className={styles.menuItem}><Link to="/sales" className={styles.menuLink}>Sales</Link></li>
              <li className={styles.menuItem}><Link to="/why-us" className={styles.menuLink}>Why Us</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 