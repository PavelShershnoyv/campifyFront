import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './CardRoute.module.scss';
import Header from '../Header/Header';
import Map from '../Map/Map';

const DownloadIcon = () => (
  <span className={styles.buttonIcon}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 16.5L7.5 12H10.5V3H13.5V12H16.5L12 16.5Z" fill="currentColor"/>
      <path d="M20.25 19.5H3.75V12H1.5V19.5C1.5 20.745 2.505 21.75 3.75 21.75H20.25C21.495 21.75 22.5 20.745 22.5 19.5V12H20.25V19.5Z" fill="currentColor"/>
    </svg>
  </span>
);

const ChecklistIcon = () => (
  <span className={styles.buttonIcon}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M4 7H10V9H4V7Z" fill="currentColor"/>
      <path d="M4 11H10V13H4V11Z" fill="currentColor"/>
      <path d="M4 15H10V17H4V15Z" fill="currentColor"/>
      <path d="M14 7H20V9H14V7Z" fill="currentColor"/>
      <path d="M14 11H20V13H14V11Z" fill="currentColor"/>
      <path d="M14 15H20V17H14V15Z" fill="currentColor"/>
      <path d="M21 3H3C2.448 3 2 3.448 2 4V20C2 20.552 2.448 21 3 21H21C21.552 21 22 20.552 22 20V4C22 3.448 21.552 3 21 3ZM20 19H4V5H20V19Z" fill="currentColor"/>
    </svg>
  </span>
);

export const CardRoute = ({ route }) => {
  const { id } = useParams();
  
  const routeData = route || {
    id: id || '1',
    title: 'Природный парк «Бажовские места»',
    description: 'Природный парк «Бажовские места» назван в честь знаменитого уральского писателя Павла Петровича Бажова. Поскольку прошлое, настоящее и будущее Сысертского района связано с именем этого человека, любившего беззаветно свою родину, ее природу. Природный парк расположен рядом с малой родиной П.П. Бажова – г. Сысерть, в котором находится мемориальный дом –музей родителей П. П. Бажова. Он много раз бывал в этих местах, шел по знакомым с детства тропам, записывал народные предания, использовал путевые впечатления в своем творчестве. Образ родной ему Сысерти и окрестностей запечатлен во многих сказах, очерках и повестях.',
    details: {
      distance: 23.55,
      duration: '7 ч 29 мин',
      height: '255 м',
      routeType: 'В одном направлении',
      difficulty: 2,
    },
    photos: [
        "../../assets/img/FonCard.png",
        "../../assets/img/FonCard.png",
        "../../assets/img/FonCard.png",
        "../../assets/img/FonCard.png"

    ],
    comments: [
      {
        id: 1,
        author: 'Иван Иванович',
        text: 'Прекрасно место для похода! Советую всем',
        rating: 5
      }
    ]
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.headerBackground}>
        <div className={styles.container}>
          <h1 className={styles.title}>{routeData.title}</h1>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.mainContentCard}>
            <div className={styles.twoColumn}>
              <div className={styles.leftColumn}>
                <div className={styles.mapContainer}>
                  <div className={styles.mapPlaceholder}>
                    <Map />
                  </div>
                </div>
                
                <div className={styles.actionsPanel}>
                  <button className={styles.downloadButton}>
                    <DownloadIcon />
                    Скачать
                  </button>
                  <button className={styles.checklistButton}>
                    <ChecklistIcon />
                    Чек-лист
                  </button>
                </div>
              </div>
              
              <div className={styles.rightColumn}>
                <h2 className={styles.infoTitle}>Характеристика</h2>
                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Дистанция</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailIcon}></span>
                      <span className={styles.detailValue}>{routeData.details.distance} км</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Время</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailIcon}></span>
                      <span className={styles.detailValue}>{routeData.details.duration}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Набор высоты</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailIcon}></span>
                      <span className={styles.detailValue}>{routeData.details.height}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Тип маршрута</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailValue}>{routeData.details.routeType}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Сложность</span>
                    <div className={styles.detailValueContainer}>
                      <div className={styles.difficultyContainer}>
                        <span className={styles.mountainIcon}></span>
                        <span className={styles.detailValue}>
                          {routeData.details.difficulty === 1 ? 'легко' : 
                           routeData.details.difficulty === 2 ? 'умеренно' : 'сложно'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Описание</h2>
              <p className={styles.description}>{routeData.description}</p>
            </div>
            
            <div className={styles.photoSection}>
              <h2 className={styles.sectionTitle}>Фото</h2>
              <div className={styles.photoGrid}>
                <div className={styles.mainPhoto}>
                  <img src={require("../../assets/img/LeftCellRoute.jpg")} alt="Фото маршрута 1" className={styles.photo} />
                </div>
                <div className={styles.secondaryPhotos}>
                  <div className={styles.photoItem}>
                    <img src={require("../../assets/img/LeftCellRoute.jpg")} alt="Фото маршрута 2" className={styles.photo} />
                  </div>
                  <div className={styles.photoItem}>
                    <img src={require("../../assets/img/LeftCellRoute.jpg")} alt="Фото маршрута 3" className={styles.photo} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.commentsSection}>
              <h2 className={styles.sectionTitle}>Комментарии</h2>
              <div className={styles.commentsContainer}>
                <div className={styles.commentForm}>
                  <input 
                    type="text" 
                    placeholder="Оставьте ваш комментарий..." 
                    className={styles.commentInput} 
                  />
                  <div className={styles.ratingContainer}>
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={`${styles.ratingIcon} ${i < 4 ? styles.active : ''}`}></span>
                    ))}
                  </div>
                  <button className={styles.submitButton}>Отправить</button>
                </div>
                
                <div className={styles.commentsList}>
                  {routeData.comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentRating}>
                          {Array(5).fill(0).map((_, i) => (
                            <span 
                              key={i} 
                              className={`${styles.ratingIcon} ${i < comment.rating ? styles.active : ''}`}
                            ></span>
                          ))}
                        </div>
                        <span className={styles.commentAuthor}>{comment.author}</span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRoute; 