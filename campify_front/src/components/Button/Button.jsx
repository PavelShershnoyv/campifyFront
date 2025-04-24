import React from 'react';
import styles from './Button.module.scss';

const Button = ({ text, onClick, className, variant = 'primary', disabled = false }) => {
  const buttonClassName = `${styles.button} ${styles[variant]} ${className || ''}`;
  
  return (
    <button 
      className={buttonClassName} 
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button; 