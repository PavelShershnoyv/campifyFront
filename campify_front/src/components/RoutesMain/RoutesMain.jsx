import React from "react";
import classes from "./RoutesMain.module.scss";
import hikesImage from "../../assets/img/hikes.png";
import arrow from "../../assets/icon/Arrow.png";
import { Link } from "react-router-dom";

const RoutesMain = () => {
  return (
    <div className={classes.routesBlock}>
      <div className={classes.routesBlock__header}>
        <h2 className={classes.routesBlock__title}>Маршруты</h2>
      </div>
      <div className={classes.routesBlock__content}>
        <div className={classes.routesCard}>
          <div className={classes.routesCard__number}>01</div>
          <div className={classes.routesCard__image}>
            <img src={hikesImage} alt="Пешие походы" />
          </div>
          <div className={classes.routesCard__content}>
            <h3 className={classes.routesCard__title}>Дикие<br />тропы</h3>
            <Link to="/routes?type=wild">
            <button className={`${classes.routesCard__button} ${classes.routesCard__button_primary}`}>
              Подробнее
              <img src={arrow} alt="Arrow" className={classes.routesCard__button__arrow} />
            </button>
            </Link>
          </div>
        </div>
        <div className={`${classes.routesCard} ${classes.routesCard__secondary}`}>
          <div className={classes.routesCard__number}>02</div>
          <div className={classes.routesCard__content}>
            <h3 className={classes.routesCard__title}>Обустроенный<br />отдых</h3>
            <Link to="/routes?type=equipped">
            <button className={`${classes.routesCard__button} ${classes.routesCard__button_secondary}`}>
              Подробнее
              <img src={arrow} alt="Arrow" className={classes.routesCard__button__arrow} />
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutesMain; 