import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { fetchRouteReviews, createReview } from '../../store/slices/reviewsSlice';
import { fetchUserById } from '../../store/slices/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const dispatch = useDispatch();
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
    downloadError,
    downloadChecklistFile,
    checklistDownloadLoading,
    checklistDownloadError,
    uploadPhoto,
    photoUploadLoading,
    photoUploadError
  } = useRoutes();
  
  // Получаем данные из Redux для отзывов
  const { 
    reviews, 
    loading: reviewsLoading, 
    error: reviewsError,
    createReviewLoading,
    createReviewError
  } = useSelector(state => state.reviews);
  
  // Проверяем авторизацию пользователя
  const { isAuthenticated } = useSelector(state => state.user);
  
  // Получаем данные из Redux для пользователей
  const { usersCache } = useSelector(state => state.user);
  
  // Состояние для хранения фотографий текущего маршрута
  const [photos, setPhotos] = useState([]);
  
  // Состояния для формы комментариев
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Состояния для загрузки фото
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    success: false,
    error: null
  });
  
  // Состояние для отслеживания запрошенных пользователей
  const [requestedUsers, setRequestedUsers] = useState(new Set());
  
  // Реф для input file
  const fileInputRef = useRef(null);
  
  // Референс для контейнера с отзывами
  const reviewsRowRef = useRef(null);
  
  // Состояния для реализации drag-to-scroll
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Получаем отзывы для текущего маршрута и нормализуем их
  const routeReviews = reviews[id] || [];
  console.log('Отзывы для маршрута ID', id, ':', routeReviews);
  
  // Убедимся, что routeReviews всегда массив
  const normalizedReviews = Array.isArray(routeReviews) ? routeReviews : [routeReviews];
  console.log('Нормализованные отзывы:', normalizedReviews);
  
  // Загружаем маршрут, отзывы и информацию о пользователях при монтировании компонента
  useEffect(() => {
    if (id) {
      loadRouteById(id);
      loadRoutePhotos(id);
      loadRouteGpx(id);
      // Загружаем отзывы для маршрута
      dispatch(fetchRouteReviews(id));
      console.log('Запрошены отзывы для маршрута ID:', id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);
  
  // Эффект для загрузки информации о пользователях при получении отзывов
  useEffect(() => {
    if (normalizedReviews && normalizedReviews.length > 0) {
      console.log('Загружаем информацию о пользователях для отзывов');
      // Получаем уникальные ID пользователей из отзывов
      const userIds = [...new Set(normalizedReviews
        .filter(review => review && review.user)
        .map(review => review.user))];
      
      // Загружаем информацию о каждом пользователе, если его нет в кэше и не был запрошен
      userIds.forEach(userId => {
        if (userId && !usersCache[userId] && !requestedUsers.has(userId)) {
          console.log('Запрашиваем данные пользователя с ID:', userId);
          setRequestedUsers(prev => new Set([...prev, userId]));
          dispatch(fetchUserById(userId));
        }
      });
    }
  }, [normalizedReviews, usersCache, dispatch, requestedUsers]);
  
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

  // Функция для начала перетаскивания
  const handleMouseDown = (e) => {
    if (!reviewsRowRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - reviewsRowRef.current.offsetLeft);
    setScrollLeft(reviewsRowRef.current.scrollLeft);
    reviewsRowRef.current.style.cursor = 'grabbing';
  };
  
  // Функция для перетаскивания
  const handleMouseMove = (e) => {
    if (!isDragging || !reviewsRowRef.current) return;
    
    const x = e.pageX - reviewsRowRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Множитель скорости прокрутки
    reviewsRowRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Функция для завершения перетаскивания
  const handleMouseUp = () => {
    setIsDragging(false);
    if (reviewsRowRef.current) {
      reviewsRowRef.current.style.cursor = 'grab';
    }
  };
  
  // Функция для отмены перетаскивания при выходе курсора за пределы контейнера
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (reviewsRowRef.current) {
        reviewsRowRef.current.style.cursor = 'grab';
      }
    }
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
  
  // Обработчик отправки комментария (используем Redux thunk)
  const handleSubmitComment = () => {
    if (commentText.trim() === '' || commentRating === 0) {
      alert('Пожалуйста, напишите комментарий и выберите рейтинг');
      return;
    }
    
    if (!isAuthenticated) {
      alert('Необходимо авторизоваться для добавления отзыва');
      return;
    }
    
    const reviewData = {
      comment: commentText,
      rating: commentRating,
      routeId: id
    };
    
    dispatch(createReview(reviewData))
      .unwrap()
      .then(() => {
        // Если отзыв успешно создан, очищаем форму
        setCommentText('');
        setCommentRating(0);
      })
      .catch(error => {
        console.error('Ошибка при создании отзыва:', error);
        alert(`Ошибка при создании отзыва: ${error}`);
      });
  };

  // Функция для получения username пользователя по ID
  const getUsernameById = (userId) => {
    if (!userId) return 'Пользователь';
    
    // Проверяем, есть ли пользователь в кэше
    const user = usersCache[userId];
    if (user) {
      return user.username || 'Пользователь';
    }
    
    // Если пользователя нет в кэше, возвращаем "Загрузка..."
    // Запрос будет выполнен в useEffect выше
    return 'Загрузка...';
  };

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

  // Функция для открытия диалога выбора файла
  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };
  
  // Функция для обработки выбора файла
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения (JPG, PNG)');
      return;
    }
    
    // Проверяем размер файла (не более 5 МБ)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    setUploadStatus({
      isUploading: true,
      success: false,
      error: null
    });
    
    try {
      // Отправляем файл на сервер
      await uploadPhoto(id, file);
      
      // Обновляем список фотографий
      loadRoutePhotos(id);
      
      setUploadStatus({
        isUploading: false,
        success: true,
        error: null
      });
      
      // Показываем уведомление об успешной загрузке
      toast.success('Фотография успешно отправлена на проверку', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        success: false,
        error: error.message || 'Ошибка при загрузке файла'
      });
      
      toast.error(`Ошибка при загрузке файла: ${error.message || 'Неизвестная ошибка'}`, {
        position: "bottom-right"
      });
    }
    
    // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
    e.target.value = '';
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
                    ) : gpxData && gpxData.coordinates ? (
                      <RouteMap 
                        coords={gpxData.coordinates} 
                        centerCoordinate={gpxData.centerCoordinate}
                        routeName={routeData.title || 'Маршрут'}
                      />
                    ) : (
                      <div className={styles.loading}>Подготовка карты...</div>
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
                  <button 
                    className={styles.checklistButton}
                    onClick={() => downloadChecklistFile(id)}
                    disabled={checklistDownloadLoading}
                  >
                    <ChecklistIcon />
                    {checklistDownloadLoading ? 'Загрузка...' : 'Чек-лист'}
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
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Фото</h2>
                {isAuthenticated && (
                  <div>
                    <button 
                      className={styles.uploadPhotoButton} 
                      onClick={handleUploadButtonClick}
                      disabled={photoUploadLoading}
                    >
                      {photoUploadLoading ? 'Загрузка...' : 'Загрузить фото'}
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      className={styles.fileInput} 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
              
              {photosLoading ? (
                <div className={styles.photoLoading}>Загрузка фотографий...</div>
              ) : photosError ? (
                <div className={styles.photoError}>Ошибка загрузки фотографий: {photosError}</div>
              ) : (
                renderPhotoGrid()
              )}
            </div>
            
            <div className={styles.commentsSection}>
              <h2 className={styles.sectionTitle}>Отзывы</h2>
              <div className={styles.commentsContainer}>
                <div className={styles.commentForm}>
                  <input 
                    type="text" 
                    placeholder="Оставьте ваш отзыв..." 
                    className={styles.commentInput}
                    value={commentText}
                    onChange={handleCommentTextChange}
                    disabled={!isAuthenticated || createReviewLoading}
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
                    disabled={!isAuthenticated || commentText.trim() === '' || commentRating === 0 || createReviewLoading}
                  >
                    {createReviewLoading ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
                
                {createReviewError && (
                  <div className={styles.error}>
                    Ошибка при отправке отзыва: {createReviewError}
                  </div>
                )}
                
                {reviewsLoading ? (
                  <div className={styles.loading}>Загрузка отзывов...</div>
                ) : reviewsError ? (
                  <div className={styles.error}>Ошибка при загрузке отзывов: {reviewsError}</div>
                ) : (
                  <div className={styles.reviewsContainer}>
                    {normalizedReviews && normalizedReviews.length > 0 ? (
                      <>
                        <div 
                          className={styles.reviewsScrollContainer} 
                          ref={reviewsRowRef}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className={styles.reviewsRow}>
                            {normalizedReviews.map((review) => {
                              // Проверяем наличие необходимых полей
                              if (!review) return null;
                              
                              // Получаем username пользователя
                              const username = getUsernameById(review.user);
                              
                              return (
                                <div key={review.id || Math.random()} className={styles.reviewCard}>
                                  <div className={styles.commentHeader}>
                                    <div className={styles.commentRating}>
                                      {Array(5).fill(0).map((_, i) => (
                                        <span 
                                          key={i} 
                                          className={`${styles.ratingIcon} ${i < (review.rating || 0) ? styles.active : ''}`}
                                        ></span>
                                      ))}
                                    </div>
                                    <span className={styles.commentAuthor}>
                                      {username}
                                    </span>
                                    {review.created_at && (
                                      <span className={styles.commentDate}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p className={styles.commentText}>{review.comment || review.text || 'Без комментария'}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className={styles.reviewsCount}>
                          Всего отзывов: {normalizedReviews.length}
                        </div>
                      </>
                    ) : (
                      <div className={styles.noComments}>
                        Пока нет отзывов. Будьте первым!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ fontSize: '16px', fontWeight: '500' }}
        toastStyle={{
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'Poppins, Arial, sans-serif',
          padding: '12px 20px'
        }}
      />
    </div>
  );
};

export default CardRoute; 