import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './AboutUsPage.module.scss';

const AboutUsPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutPage__background}>
        <Header />
        <div className={styles.aboutPage__content}>
          <div className={styles.contentCard}>
            <h1 className={styles.title}>О НАС</h1>
            <div className={styles.text}>
              <p>
                <span className={styles.boldText}>Campify</span> — это современный онлайн-сервис, который помогает планировать 
                идеальные кемпинг- и походные приключения на любой вкус и уровень подготовки. 
                Наша цель — сэкономить ваше время на сборе информации, облегчить логистику 
                в дикой природе и сделать каждую поездку безопасной и комфортной.
              </p>
              
              <p className={styles.subtitle}><span className={styles.boldText}>Наша миссия</span></p>
              <p>
                Мы верим, что путешествия на свежем воздухе раскрывают в человеке лучшее. 
                Поэтому мы создаем инструменты, которые учитывают сезонные ограничения, 
                отмечают зоны связи, показывают источники воды и опасные участки, а также 
                предлагают персонализированные чек-листы и интеграцию с местными сервисами. 
                С Campify вы всегда будете готовы к любым сюрпризам природы.
              </p>
              
              <p className={styles.subtitle}><span className={styles.boldText}>Наши ценности</span></p>
              
              <ul className={styles.valuesList}>
                <li>
                  <span className={styles.valueName}>Свобода</span>
                  <p>Открывайте новые уголки природы и прокладывайте собственный путь.</p>
                </li>
                <li>
                  <span className={styles.valueName}>Надежность</span>
                  <p>Точный сбор данных и своевременные оповещения о ЧП.</p>
                </li>
                <li>
                  <span className={styles.valueName}>Открытия</span>
                  <p>Делимся секретными маршрутами и историями выживальщиков.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 