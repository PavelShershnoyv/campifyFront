import Header from "../Header/Header";
import RoutesMain from "../RoutesMain/RoutesMain";
import Footer from "../Footer/Footer";
import BigCellRoute from "../BigCellRoute/BigCellRoute";
import CellRoute from "../CellRoute/CellRoute";
import classes from "./MainPage.module.scss";
import mouse from "../../assets/img/Mouse.png";
import trekking from "../../assets/img/Trekking.png";
import arrow from "../../assets/icon/Arrow.png";
import leftImage from "../../assets/img/LeftCellRoute.jpg";
import rightImage from "../../assets/img/RightCellRoute.png";

const MainPage = () => {
  return (
    <div>
      <div className={classes.wrapper}>
        <Header />
        <div className={classes.mainBlock}>
          <div className={classes.verticalLine}>
            <div className={classes.verticalLine__line}></div>
            <p className={classes.verticalLine__text}>Scroll down</p>
            <img src={mouse} alt="Scroll icon" />
          </div>
          <div className={classes.mainBlock__block}>
            <div className={classes.mainBlock__block__title}>
              <p>
                Твой идеальный маршрут
                <br />в один клик
              </p>
            </div>
            <div className={classes.mainBlock__block__startRoute}>
              <div className={classes.mainBlock__block__startRoute__img}>
                <div className={classes.mainBlock__block__startRoute__img__header}>
                  <p>Подробнее</p>
                  <img src={arrow} alt="Arrow icon" />
                </div>
                <img src={trekking} alt="Trekking" />
              </div>
              <div className={classes.mainBlock__block__startRoute__description}>
                <p>
                  Откройте природу
                  <br />
                  Свердловской области
                </p>
                <p>
                  Ваши идеальные походы
                  <br />
                  начинаются здесь!
                </p>
                <p>
                  Планируйте свой поход легко и быстро - от лесов до
                  <br />
                  гор, мы организуем приключение для вас.
                </p>
              </div>
            </div>
          </div>
        </div>
        <RoutesMain />
      </div>
    </div>
  );
};

export default MainPage;
