import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import BtnEntrance from "../BtnEntrance/BtnEntrance";
import classes from "./Header.module.scss";

const Header = () => {
  // Получаем информацию о пользователе из Redux
  const { isAuthenticated, user } = useSelector(state => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  console.log(isAuthenticated);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={classes.header}>
      <Link to="/" className={classes.header__logo}>Campify</Link>
      
      {/* Десктопная навигация */}
      <div className={classes.header__nav}>
        <Link to="/routes"><p>Маршруты</p></Link>
        <Link to="/scheduler"><p>Планировщик</p></Link>
        {isAuthenticated && (
          <>
            <Link to="/my-routes"><p>Мои маршруты</p></Link>
            <Link to="/recommendations"><p>Рекомендации</p></Link>
          </>
        )}
        <Link to="/about"><p>О нас</p></Link>
      </div>

      {/* Десктопные кнопки входа */}
      <div className={classes.header__entrance}>
        {isAuthenticated ? (
          <div className={classes.userInfo}>
            <button 
              className={classes.logoutBtn}
              onClick={() => {
                // Добавить логику выхода (можно реализовать позже)
                localStorage.removeItem('token');
                window.location.reload(); // Временное решение для перезагрузки страницы
              }}
            >
              Выход
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">
              <BtnEntrance
                text={"Вход"}
                styleBtn={{ border: "1px solid #DBAB49", padding: "5px 18px" }}
              />
            </Link>
            <Link to="/registration">
              <BtnEntrance
                text={"Регистрация"}
                styleBtn={{ background: "#DBAB49", padding: "5px" }}
              />
            </Link>
          </>
        )}
      </div>

      {/* Гамбургер меню для мобильных */}
      <button 
        className={classes.hamburger}
        onClick={toggleMobileMenu}
        aria-label="Открыть меню"
      >
        <span className={`${classes.hamburger__line} ${isMobileMenuOpen ? classes.hamburger__line_active : ''}`}></span>
        <span className={`${classes.hamburger__line} ${isMobileMenuOpen ? classes.hamburger__line_active : ''}`}></span>
        <span className={`${classes.hamburger__line} ${isMobileMenuOpen ? classes.hamburger__line_active : ''}`}></span>
      </button>

      {/* Мобильное меню */}
      <div className={`${classes.mobileMenu} ${isMobileMenuOpen ? classes.mobileMenu_open : ''}`}>
        <div className={classes.mobileMenu__content}>
          <Link to="/routes" onClick={closeMobileMenu}>
            <p>Маршруты</p>
          </Link>
          <Link to="/scheduler" onClick={closeMobileMenu}>
            <p>Планировщик</p>
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/my-routes" onClick={closeMobileMenu}>
                <p>Мои маршруты</p>
              </Link>
              <Link to="/recommendations" onClick={closeMobileMenu}>
                <p>Рекомендации</p>
              </Link>
            </>
          )}
          <Link to="/about" onClick={closeMobileMenu}>
            <p>О нас</p>
          </Link>
          
          {/* Кнопки входа в мобильном меню */}
          <div className={classes.mobileMenu__buttons}>
            {isAuthenticated ? (
              <button 
                className={classes.logoutBtn}
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                  closeMobileMenu();
                }}
              >
                Выход
              </button>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu}>
                  <BtnEntrance
                    text={"Вход"}
                    styleBtn={{ border: "1px solid #DBAB49", padding: "8px 20px", width: "100%" }}
                  />
                </Link>
                <Link to="/registration" onClick={closeMobileMenu}>
                  <BtnEntrance
                    text={"Регистрация"}
                    styleBtn={{ background: "#DBAB49", padding: "8px 20px", width: "100%" }}
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Оверлей для закрытия меню */}
      {isMobileMenuOpen && (
        <div 
          className={classes.overlay}
          onClick={closeMobileMenu}
        ></div>
      )}
    </div>
  );
};

export default Header;
