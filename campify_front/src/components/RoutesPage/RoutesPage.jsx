import React from 'react';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import styles from './RoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";

const RoutesPage = () => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1 className={styles.title}>Лучшие маршруты</h1>
          <button className={styles.filterButton}>
            <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
            <span>Фильтры</span>
          </button>
        </div>
        
        <div className={styles.mainRoute}>
          <BigCellRoute 
            image={bigRouteImage}
            title="Природный парк «Бажовские места»"
            country="Россия"
            region="Свердловская область"
            distance="23,6 км"
            time="7,29 ч"
            rating="4,7"
          />
        </div>
        
        <div className={styles.routeContainer}>
          <CellRoute 
            image={leftImage}
            title="Долина реки Архыз"
            description="Живописный маршрут вдоль реки с посещением водопадов и горных озер. Подходит для семейного отдыха."
            difficulty="Легкий"
            duration="3 дня"
            distance="24 км"
          />
        </div>
        
        <div className={styles.routeContainer}>
          <CellRoute 
            image={leftImage}
            title="Кавказские минеральные воды"
            description="Маршрут по историческим местам и природным достопримечательностям региона. Включает посещение термальных источников."
            difficulty="Средний"
            duration="5 дней"
            distance="45 км"
            imagePosition="right"
          />
        </div>
        
        <div className={styles.routeContainer}>
          <CellRoute 
            image={leftImage}
            title="Озеро Кардывач"
            description="Путешествие к высокогорному озеру через реликтовые леса и альпийские луга. Возможность увидеть редких животных."
            difficulty="Средний"
            duration="4 дня"
            distance="36 км"
          />
        </div>
      </div>
    </div>
  );
};

export default RoutesPage; 