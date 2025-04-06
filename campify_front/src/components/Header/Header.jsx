import BtnEntrance from "../BtnEntrance/BtnEntrance";
import classes from "./Header.module.scss";

const Header = () => {
  return (
    <div className={classes.header}>
      <p className={classes.header__logo}>Campify</p>
      <div className={classes.header__nav}>
        <p>Маршруты</p>
        <p>Планировщик</p>
        <p>О нас</p>
      </div>
      <div className={classes.header__entrance}>
        <BtnEntrance
          text={"Вход"}
          styleBtn={{ border: "1px solid #DBAB49", padding: "5px 18px" }}
        />
        <BtnEntrance
          text={"Регистрация"}
          styleBtn={{ background: "#DBAB49", padding: "5px" }}
        />
      </div>
    </div>
  );
};

export default Header;
