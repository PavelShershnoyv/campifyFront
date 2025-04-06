import classes from "./BtnEntrance.module.scss";

const BtnEntrance = ({ text, styleBtn }) => {
  return (
    <div className={classes.btn} style={styleBtn}>
      <p className={classes.btn__text}>{text}</p>
    </div>
  );
};

export default BtnEntrance;
