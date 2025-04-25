import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './CardRoute.module.scss';
import Header from '../Header/Header';
import Map from '../Map/Map';
import { useRoutes } from '../../hooks/useRoutes';
// import { ReactComponent as StarIcon } from '../../assets/icons/star-icon.svg';
// import { ReactComponent as LikeIcon } from '../../assets/icons/like-icon.svg';
// import { ReactComponent as LocationIcon } from '../../assets/icons/location-icon.svg';
// import { ReactComponent as ShareIcon } from '../../assets/icons/share-icon.svg';
// import { ReactComponent as UserIcon } from '../../assets/icons/user-icon.svg';
// import { ReactComponent as ClockIcon } from '../../assets/icons/clock-icon.svg';
// import { ReactComponent as LevelIcon } from '../../assets/icons/level-icon.svg';
import RouteMap from '../Map/RouteMap';

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

export const CardRoute = () => {
  const { id } = useParams();
  const { 
    currentRoute, 
    loading, 
    error, 
    loadRouteById, 
    routePhotos, 
    photosLoading, 
    photosError, 
    loadRoutePhotos, 
    getRoutePhotos,
    loadRouteGpx,
    getRouteGpxData,
    routeGpxData,
    gpxLoading,
    gpxError,
    downloadGpxFile,
    downloadLoading,
    downloadError
  } = useRoutes();
  
  // Состояние для хранения фотографий текущего маршрута
  const [photos, setPhotos] = useState([]);
  
  // Состояния для формы комментариев
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Загружаем маршрут при монтировании компонента
  useEffect(() => {
    if (id) {
      loadRouteById(id);
      loadRoutePhotos(id);
      loadRouteGpx(id);
    }
  }, [id]);
  
  // Обновляем фотографии, когда они загружены
  useEffect(() => {
    if (id && routePhotos[id]) {
      setPhotos(routePhotos[id]);
    }
  }, [id, routePhotos]);
  
  // Показываем состояние загрузки
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка информации о маршруте...</div>
        </div>
      </div>
    );
  }
  
  // Показываем ошибку, если есть
  if (error) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.error}>Ошибка: {error}</div>
        </div>
      </div>
    );
  }
  
  // Если маршрут не загружен, показываем заглушку
  if (!currentRoute) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Маршрут не найден</div>
        </div>
      </div>
    );
  }

  // Используем данные из Redux
  const routeData = currentRoute;

  // Получаем GPX-данные для текущего маршрута
  const gpxData = getRouteGpxData(id);

  // Определяем фотографии для отображения (с учетом API структуры)
  const firstThreePhotos = photos.slice(0, 3);

  // Рендерим разные компоненты в зависимости от количества фотографий
  const renderPhotoGrid = () => {
    if (photos.length === 0) {
      return <div className={styles.noPhotos}>У этого маршрута пока нет фотографий</div>;
    }

    if (photos.length === 1) {
      return (
        <div className={`${styles.photoGrid} ${styles.singlePhoto}`}>
          <div className={styles.mainPhoto}>
            <img src={photos[0].image} alt="Фото маршрута" className={styles.photo} />
          </div>
        </div>
      );
    }

    if (photos.length === 2) {
      return (
        <div className={`${styles.photoGrid} ${styles.twoPhotos}`}>
          <div className={styles.mainPhoto}>
            <img src={photos[0].image} alt="Фото маршрута 1" className={styles.photo} />
          </div>
          <div className={styles.secondaryPhotos}>
            <div className={styles.photoItem}>
              <img src={photos[1].image} alt="Фото маршрута 2" className={styles.photo} />
            </div>
          </div>
        </div>
      );
    }

    // 3 и более фотографий
    return (
      <div className={styles.photoGrid}>
        <div className={styles.mainPhoto}>
          <img src={photos[0].image} alt="Фото маршрута 1" className={styles.photo} />
        </div>
        <div className={styles.secondaryPhotos}>
          <div className={styles.photoItem}>
            <img src={photos[1].image} alt="Фото маршрута 2" className={styles.photo} />
          </div>
          <div className={styles.photoItem}>
            <img src={photos[2].image} alt="Фото маршрута 3" className={styles.photo} />
          </div>
        </div>
      </div>
    );
  };

  // Обработчик изменения текста комментария
  const handleCommentTextChange = (e) => {
    setCommentText(e.target.value);
  };
  
  // Обработчик клика по звезде рейтинга
  const handleRatingClick = (rating) => {
    setCommentRating(rating);
  };
  
  // Обработчики наведения на звезды для эффекта hover
  const handleRatingMouseEnter = (rating) => {
    setHoverRating(rating);
  };
  
  const handleRatingMouseLeave = () => {
    setHoverRating(0);
  };
  
  // Обработчик отправки комментария
  const handleSubmitComment = () => {
    if (commentText.trim() === '' || commentRating === 0) {
      alert('Пожалуйста, напишите комментарий и выберите рейтинг');
      return;
    }
    
    // Здесь будет код для отправки комментария на бэкенд
    // Пока просто выводим в консоль
    console.log('Отправка комментария:', {
      text: commentText,
      rating: commentRating,
      routeId: id
    });
    
    // Сбрасываем форму
    setCommentText('');
    setCommentRating(0);
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
                    {gpxLoading ? (
                      <div className={styles.loading}>Загрузка карты...</div>
                    ) : gpxError ? (
                      <div className={styles.error}>Ошибка загрузки карты: {gpxError}</div>
                    ) : (
                      <RouteMap 
                        coords={gpxData.coordinates} 
                        centerCoordinate={gpxData.centerCoordinate}
                        routeName={routeData.title || 'Маршрут'}
                      />
                    )}
                  </div>
                </div>
                
                <div className={styles.actionsPanel}>
                  <button 
                    className={styles.downloadButton}
                    onClick={() => downloadGpxFile(id)}
                    disabled={downloadLoading}
                  >
                    <DownloadIcon />
                    {downloadLoading ? 'Загрузка...' : 'Скачать'}
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
                      <span className={styles.detailValue}>{routeData.distance}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Время</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailIcon}></span>
                      <span className={styles.detailValue}>{routeData.time}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Набор высоты</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailIcon}></span>
                      <span className={styles.detailValue}>{routeData.height}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Тип маршрута</span>
                    <div className={styles.detailValueContainer}>
                      <span className={styles.detailValue}>
                        {routeData.type === 'wild' ? 'Дикий' : 'Обустроенный'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Сложность</span>
                    <div className={styles.detailValueContainer}>
                      <div className={styles.difficultyContainer}>
                        <span className={styles.mountainIcon}></span>
                        <span className={styles.detailValue}>
                          {routeData.difficulty === 1 ? 'легкая' : 
                           routeData.difficulty === 2 ? 'средняя' : 'тяжелая'}
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
              {photosLoading ? (
                <div className={styles.photoLoading}>Загрузка фотографий...</div>
              ) : photosError ? (
                <div className={styles.photoError}>Ошибка загрузки фотографий: {photosError}</div>
              ) : (
                renderPhotoGrid()
              )}
            </div>
            
            <div className={styles.commentsSection}>
              <h2 className={styles.sectionTitle}>Комментарии</h2>
              <div className={styles.commentsContainer}>
                <div className={styles.commentForm}>
                  <input 
                    type="text" 
                    placeholder="Оставьте ваш комментарий..." 
                    className={styles.commentInput}
                    value={commentText}
                    onChange={handleCommentTextChange}
                  />
                  <div className={styles.ratingContainer}>
                    {Array(5).fill(0).map((_, i) => (
                      <span 
                        key={i} 
                        className={`${styles.ratingIcon} ${(i < commentRating || i < hoverRating) ? styles.active : ''}`}
                        onClick={() => handleRatingClick(i + 1)}
                        onMouseEnter={() => handleRatingMouseEnter(i + 1)}
                        onMouseLeave={handleRatingMouseLeave}
                      ></span>
                    ))}
                  </div>
                  <button 
                    className={styles.submitButton}
                    onClick={handleSubmitComment}
                    disabled={commentText.trim() === '' || commentRating === 0}
                  >
                    Отправить
                  </button>
                </div>
                
                <div className={styles.commentsList}>
                  {routeData.comments && routeData.comments.map((comment) => (
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
                  
                  {(!routeData.comments || routeData.comments.length === 0) && (
                    <div className={styles.noComments}>
                      Пока нет комментариев. Будьте первым!
                    </div>
                  )}
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