import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import BtnEntrance from "../BtnEntrance/BtnEntrance";
import classes from "./Header.module.scss";

const Header = () => {
  // Получаем информацию о пользователе из Redux
  const { isAuthenticated, user } = useSelector(state => state.user);

  return (
    <div className={classes.header}>
      <Link to="/" className={classes.header__logo}>Campify</Link>
      <div className={classes.header__nav}>
        <Link to="/routes"><p>Маршруты</p></Link>
        <Link to="/scheduler"><p>Планировщик</p></Link>
        {isAuthenticated && (
          <Link to="/my-routes"><p>Мои маршруты</p></Link>
        )}
        <p>О нас</p>
      </div>
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
    </div>
  );
};

export default Header;
