import { useState, useEffect } from "react";
import { IWallProps } from "./Wall";
import "./Weight.scss";

export interface IForce {
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
  reset: boolean;
  walls: IWallProps[];
  forces: IForce[];
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
    reset,
    walls,
    forces,
  } = props;

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);
  const [xAcceleration, setXAcceleration] = useState(startAccX ?? 0);
  const [yAcceleration, setYAcceleration] = useState(startAccY ?? 0);

  useEffect(() => {
    if (!paused) {
      if (yAcceleration != 0) {
        updatePos(timestepSize);
        updateVelocity(timestepSize);
        checkForCollisions();
      }
    }
  }, [incrementTime]);

  useEffect(() => {
    setXPosition(startPosX);
    setYPosition(startPosY);
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setXAcceleration(startAccX ?? 0);
    setYAcceleration(startAccY ?? 0);
  }, [reset]);

  useEffect(() => {
    setXAcceleration(startAccX ?? 0);
    setYAcceleration(startAccY ?? 0);
    if (!forces) {
      return;
    }
    forces.forEach((force) => {
      const xComponent =
        (force.magnitude *
          Math.cos((force.directionInDegrees * Math.PI) / 180)) /
        mass;
      const yComponent =
        (force.magnitude *
          Math.sin((force.directionInDegrees * Math.PI) / 180)) /
        mass;
      setXAcceleration(xAcceleration + xComponent);
      setYAcceleration(yAcceleration + yComponent);
    });
  }, [reset]);

  const updatePos = (timestep: number) => {
    const newXPos =
      xPosition +
      xVelocity * timestep +
      0.5 * xAcceleration * timestep * timestep;
    setXPosition(newXPos);
    const newYPos =
      yPosition +
      yVelocity * timestep +
      0.5 * yAcceleration * timestep * timestep;
    setYPosition(newYPos);
  };

  const updateVelocity = (timestep: number) => {
    const newXVelocity = xVelocity + xAcceleration * timestep;
    setXVelocity(newXVelocity);
    const newYVelocity = yVelocity + yAcceleration * timestep;
    setYVelocity(newYVelocity);
  };

  const checkForCollisions = () => {
    const minX = xPosition;
    const maxX = xPosition + 2 * (radius ?? 5);
    const minY = yPosition;
    const maxY = yPosition + 2 * (radius ?? 5);
    const containerHeight = window.innerHeight * 0.9;
    walls.forEach((wall) => {
      const wallHeight = (wall.yPos / 100) * containerHeight;
      if (maxY >= wallHeight) {
        setYPosition(wallHeight - 2 * (radius ?? 5));
        setYAcceleration(0);
        setYVelocity(0);
        console.log(wall.yPos, containerHeight, window.innerHeight);
        console.log("collided!");
      }
    });
  };

  const weightStyle = {
    backgroundColor: color,
    borderStyle: "solid",
    borderColor: "black",
    position: "absolute" as "absolute",
    left: xPosition + "px",
    top: yPosition + "px",
    width: 2 * (radius ?? 5) + "px",
    height: 2 * (radius ?? 5) + "px",
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
