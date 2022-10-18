import { useState, useEffect } from "react";
import "./Weight.scss";

export interface Force {
  magnitude: number;
  directionInDegrees: number;
}
export interface IWeightProps {
  startPosX: number;
  startPosY: number;
  startVelX?: number;
  startVelY?: number;
  startAccX?: number;
  startAccY?: number;
  radius?: number;
  color: string;
  mass: number;
  timestepSize: number;
  incrementTime: number;
  paused: boolean;
}

export const Weight = (props: IWeightProps) => {
  const {
    startPosX,
    startPosY,
    startVelX,
    startVelY,
    startAccX,
    startAccY,
    radius,
    color,
    mass,
    timestepSize,
    incrementTime,
    paused,
  } = props;

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);
  const [xAcceleration, setXAcceleration] = useState(startAccX ?? 0);
  const [yAcceleration, setYAcceleration] = useState(startAccY ?? 0);

  useEffect(() => {
    if (!paused) {
      updatePos(timestepSize);
      updateVelocity(timestepSize);
    }
  }, [incrementTime]);

  const updatePos = (timestep: number) => {
    const newXPos =
      xPosition +
      xVelocity * timestep +
      0.5 * xAcceleration * timestep * timestep;
    setXPosition(newXPos);
    const newYPos =
      -1 *
      (yPosition +
        yVelocity * timestep +
        0.5 * yAcceleration * timestep * timestep);
    setYPosition(newYPos);
  };

  const updateVelocity = (timestep: number) => {
    const newXVelocity = xVelocity + xAcceleration * timestep;
    setXVelocity(newXVelocity);
    const newYVelocity = yVelocity + yAcceleration * timestep;
    setYVelocity(newYVelocity);
  };

  const weightStyle = {
    backgroundColor: color,
    borderStyle: "solid",
    borderColor: "black",
    position: "relative" as "relative",
    left: xPosition,
    top: yPosition,
    width: 2 * (radius ?? 5) + "vw",
    height: 2 * (radius ?? 5) + "vw",
    borderRadius: 50 + "%",
  };

  return (
    <div key={incrementTime} className="weight" style={weightStyle}>
      <div className="weightLabelContainer">
        <p className="weightLabel">{mass} kg</p>
      </div>
    </div>
  );
};
