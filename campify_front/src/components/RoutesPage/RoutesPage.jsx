import React, { useState } from 'react';
import Header from '../Header/Header';
import BigCellRoute from '../BigCellRoute/BigCellRoute';
import CellRoute from '../CellRoute/CellRoute';
import styles from './RoutesPage.module.scss';
import filterIcon from '../../assets/icon/Filter.png';
import leftImage from '../../assets/img/LeftCellRoute.jpg';
import bigRouteImage from "../../assets/img/BigCellRoute.jpg";

const RoutesPage = () => {
  const [activeTab, setActiveTab] = useState('wild');

  const wildRoutes = [
    {
      id: 1,
      image: bigRouteImage,
      title: "Природный парк «Бажовские места»",
      country: "Россия",
      region: "Свердловская область",
      distance: "23,6 км",
      time: "7,29 ч",
      rating: "4,7",
      type: "big"
    },
    {
      id: 2,
      image: leftImage,
      title: "Долина реки Архыз",
      description: "Живописный маршрут вдоль реки с посещением водопадов и горных озер. Подходит для семейного отдыха.",
      difficulty: "Легкий",
      duration: "3 дня",
      distance: "24 км",
      type: "regular"
    },
    {
      id: 3,
      image: leftImage,
      title: "Кавказские минеральные воды",
      description: "Маршрут по историческим местам и природным достопримечательностям региона. Включает посещение термальных источников.",
      difficulty: "Средний",
      duration: "5 дней",
      distance: "45 км",
      imagePosition: "right",
      type: "regular"
    },
    {
      id: 4,
      image: leftImage,
      title: "Озеро Кардывач",
      description: "Путешествие к высокогорному озеру через реликтовые леса и альпийские луга. Возможность увидеть редких животных.",
      difficulty: "Средний",
      duration: "4 дня",
      distance: "36 км",
      type: "regular"
    }
  ];

  const equippedRoutes = [
    {
      id: 5,
      image: bigRouteImage,
      title: "Озеро Байкал",
      country: "Россия",
      region: "Иркутская область",
      distance: "32,8 км",
      time: "10,15 ч",
      rating: "4,9",
      type: "big"
    },
    {
      id: 6,
      image: leftImage,
      title: "Алтайские горы",
      description: "Путешествие по оборудованным тропам с местами для отдыха и смотровыми площадками.",
      difficulty: "Средний",
      duration: "6 дней",
      distance: "58 км",
      type: "regular"
    },
    {
      id: 7,
      image: leftImage,
      title: "Камчатские вулканы",
      description: "Поход к действующим вулканам по обустроенным маршрутам с гидами и базовыми лагерями.",
      difficulty: "Сложный",
      duration: "8 дней",
      distance: "75 км",
      imagePosition: "right",
      type: "regular"
    }
  ];

  const currentRoutes = activeTab === 'wild' ? wildRoutes : equippedRoutes;

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
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'wild' ? styles.active : ''}`}
            onClick={() => setActiveTab('wild')}
          >
            Дикие
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'equipped' ? styles.active : ''}`}
            onClick={() => setActiveTab('equipped')}
          >
            Обустроенные
          </button>
        </div>
        
        {currentRoutes.map(route => (
          route.type === 'big' ? (
            <div className={styles.mainRoute} key={route.id}>
              <BigCellRoute 
                image={route.image}
                title={route.title}
                country={route.country}
                region={route.region}
                distance={route.distance}
                time={route.time}
                rating={route.rating}
              />
            </div>
          ) : (
            <div className={styles.routeContainer} key={route.id}>
              <CellRoute 
                image={route.image}
                title={route.title}
                description={route.description}
                difficulty={route.difficulty}
                duration={route.duration}
                distance={route.distance}
                imagePosition={route.imagePosition}
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default RoutesPage; 