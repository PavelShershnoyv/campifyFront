import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Moderation.module.scss';
import Header from '../Header/Header';
import { useRoutes } from '../../hooks/useRoutes';

const Moderation = () => {
  const { 
    uncheckedPhotos, 
    moderationLoading, 
    moderationError,
    loadUncheckedPhotos, 
    approvePhotoMod, 
    rejectPhotoMod 
  } = useRoutes();

  const [processedIds, setProcessedIds] = useState(new Set());
  
  // Загрузка непроверенных фотографий при монтировании компонента
  useEffect(() => {
    loadUncheckedPhotos();
  }, []);

  // Группировка фотографий по маршрутам для отображения
  const photosByRoute = React.useMemo(() => {
    const groupedPhotos = {};
    
    uncheckedPhotos.forEach(photo => {
      if (!groupedPhotos[photo.route]) {
        groupedPhotos[photo.route] = {
          routeId: photo.route,
          title: photo.routeTitle || `Маршрут #${photo.route}`,
          author: photo.authorName ? `Автор: ${photo.authorName}` : '',
          photos: []
        };
      }
      
      groupedPhotos[photo.route].photos.push({
        id: photo.id,
        image: photo.image,
        uploadedAt: new Date(photo.uploaded_at).toLocaleDateString('ru-RU')
      });
    });
    
    return Object.values(groupedPhotos);
  }, [uncheckedPhotos]);

  // Функция для обработки нажатия на кнопку "Одобрить"
  const handleApprove = async (photoId) => {
    if (processedIds.has(photoId)) return;
    
    try {
      setProcessedIds(prev => new Set([...prev, photoId]));
      await approvePhotoMod(photoId);
      toast.success('Фотография успешно одобрена!');
    } catch (error) {
      toast.error(`Ошибка при одобрении: ${error.message}`);
      setProcessedIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  // Функция для обработки нажатия на кнопку "Отклонить"
  const handleReject = async (photoId) => {
    if (processedIds.has(photoId)) return;
    
    try {
      setProcessedIds(prev => new Set([...prev, photoId]));
      await rejectPhotoMod(photoId);
      toast.info('Фотография отклонена');
    } catch (error) {
      toast.error(`Ошибка при отклонении: ${error.message}`);
      setProcessedIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  return (
    <div className={styles.moderationPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Модерация материала</h1>
        </div>

        {moderationLoading && (
          <div className={styles.loading}>
            Загрузка материалов для модерации...
          </div>
        )}

        {moderationError && (
          <div className={styles.error}>
            Ошибка загрузки: {moderationError}
          </div>
        )}

        {!moderationLoading && !moderationError && photosByRoute.length === 0 && (
          <div className={styles.noContent}>
            Все материалы проверены. Нет фотографий для модерации.
          </div>
        )}

        {photosByRoute.map((item, index) => (
          <div key={item.routeId} className={styles.moderationItem}>
            <div className={styles.itemHeader}>
              <h2 className={styles.itemTitle}>{item.title}</h2>
              <span className={styles.author}>{item.author}</span>
            </div>

            <div className={styles.imageGrid}>
              {item.photos.map((photo) => (
                <div key={photo.id} className={styles.imageWrapper}>
                  <img 
                    src={photo.image} 
                    alt={`${item.title} фото ${photo.id}`} 
                    className={styles.image}
                  />
                  <div className={styles.photoInfo}>
                    <span>Загружено: {photo.uploadedAt}</span>
                  </div>
                  <div className={styles.itemButtons}>
                    <button 
                      className={`${styles.button} ${styles.rejectButton}`}
                      onClick={() => handleReject(photo.id)}
                      disabled={processedIds.has(photo.id)}
                    >
                      <div className={styles.buttonIcon}>
                        <div className={styles.rejectIcon}></div>
                      </div>
                      Отклонить
                    </button>

                    <button 
                      className={`${styles.button} ${styles.approveButton}`}
                      onClick={() => handleApprove(photo.id)}
                      disabled={processedIds.has(photo.id)}
                    >
                      <div className={styles.buttonIcon}>
                        <div className={styles.approveIcon}></div>
                      </div>
                      Одобрить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {index < photosByRoute.length - 1 && (
              <div className={styles.divider}></div>
            )}
          </div>
        ))}
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
      />
    </div>
  );
};

export default Moderation; 