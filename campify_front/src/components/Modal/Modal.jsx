import React from 'react';
import styles from './Modal.module.scss';

/**
 * Модальное окно
 * @param {Object} props - Параметры компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Обработчик закрытия
 * @param {string} props.title - Заголовок модального окна
 * @param {string} props.message - Сообщение в модальном окне
 * @param {Object} props.buttons - Кнопки в модальном окне
 * @param {string} props.buttons.confirm - Текст кнопки подтверждения
 * @param {string} props.buttons.cancel - Текст кнопки отмены
 * @param {Function} props.onConfirm - Обработчик нажатия на кнопку подтверждения
 * @param {Function} props.onCancel - Обработчик нажатия на кнопку отмены
 * @param {string} props.type - Тип модального окна (info, success, warning, error)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttons = { confirm: 'Подтвердить', cancel: 'Отмена' },
  onConfirm,
  onCancel,
  type = 'info',
  children
}) => {
  // Если окно не открыто, не рендерим ничего
  if (!isOpen) return null;
  
  // Обработчик для клика по заднему фону - закрытие модального окна
  const handleBackdropClick = (e) => {
    // Закрываем только если клик был на заднем фоне, а не на содержимом
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Обработчик кнопки подтверждения
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  // Обработчик кнопки отмены
  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={`${styles.modalContent} ${styles[type]}`}>
        {title && <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>}
        
        <div className={styles.modalBody}>
          {message && <p>{message}</p>}
          {children}
        </div>
        
        <div className={styles.modalFooter}>
          {buttons.cancel && (
            <button 
              className={`${styles.button} ${styles.cancelButton}`} 
              onClick={handleCancel}
            >
              {buttons.cancel}
            </button>
          )}
          
          {buttons.confirm && (
            <button 
              className={`${styles.button} ${styles.confirmButton}`} 
              onClick={handleConfirm}
            >
              {buttons.confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 