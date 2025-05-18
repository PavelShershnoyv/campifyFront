import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthRequiredModal.module.scss';

const AuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRegister = () => {
    navigate('/registration');
    // onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Необходима регистрация</h2>
        <p className={styles.modalText}>
          Чтобы продолжить, вам нужно зарегистрироваться или войти в аккаунт
        </p>
        <div className={styles.modalActions}>
          <button 
            className={styles.registerButton} 
            onClick={handleRegister}
          >
            Зарегистрироваться
          </button>
          <button 
            className={styles.cancelButton} 
            onClick={handleClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal; 