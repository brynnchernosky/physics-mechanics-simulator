import "./Weight.scss";
export interface IWeightProps {
  posX: number;
  posY: number;
  radius: number;
  color: string;
  mass: number;
  forces: number[];
}

export const Weight = (props: IWeightProps) => {
  const { posX, posY, radius, color, mass, forces } = props;

  const weightStyle = {
    backgroundColor: color,
    borderStyle: "solid",
    borderColor: "black",
    left: posX,
    top: posY,
    width: 2 * radius + "vw",
    height: 2 * radius + "vw",
    borderRadius: 50 + "%",
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: 20 + "px",
  };

  return (
    <div className="weight" style={weightStyle}>
      <div className="labelContainer">
        <p style={labelStyle}>{mass} kg</p>
      </div>
    </div>
  );
};
