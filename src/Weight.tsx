import { useState, useEffect, useCallback } from "react";
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
  const [updatedForces, setUpdatedForces] = useState(forces);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!paused) {
      checkForCollisions();
    }
  }, [incrementTime]);

  useEffect(() => {
    setXPosition(startPosX);
    setYPosition(startPosY);
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setXAcceleration(startAccX ?? 0);
    setYAcceleration(startAccY ?? 0);
    setUpdatedForces(forces);
    updateAcceleration(forces);
  }, [reset]);

  const updateAcceleration = (forceList: IForce[]) => {
    let newXAcc = startAccX ?? 0;
    let newYAcc = startAccY ?? 0;
    forceList.forEach((force) => {
      const xComponent =
        (force.magnitude *
          Math.cos((force.directionInDegrees * Math.PI) / 180)) /
        mass;
      const yComponent =
        (force.magnitude *
          Math.sin((force.directionInDegrees * Math.PI) / 180)) /
        mass;
      newXAcc += xComponent;
      newYAcc += yComponent;
    });
    setXAcceleration(newXAcc);
    setYAcceleration(newYAcc);
  };

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
    let collision = false;
    // const minX = xPosition;
    // const maxX = xPosition + 2 * (radius ?? 5);
    // const minY = yPosition;
    const effectiveRadius = radius ?? 5;
    const maxY = yPosition + yVelocity * timestepSize + 2 * effectiveRadius;
    const containerHeight = window.innerHeight * 0.9;
    if (yVelocity != 0) {
      walls.forEach((wall) => {
        const wallHeight = (wall.yPos / 100) * containerHeight;
        if (maxY >= wallHeight) {
          setYPosition(wallHeight - 2 * effectiveRadius);
          const newForce: IForce = {
            magnitude: 9.81 * mass,
            directionInDegrees: wall.angleInDegrees + 270,
          };
          setUpdatedForces((state) => [...state, newForce]);
          setYVelocity(0);
          updateAcceleration(updatedForces);
          collision = true;
        }
      });
    }
    if (!collision) {
      updatePos(timestepSize);
      updateVelocity(timestepSize);
    }
  };

  let weightStyle = {
    backgroundColor: color,
    borderStyle: "solid",
    borderColor: "black",
    position: "absolute" as "absolute",
    left: xPosition + "px",
    top: yPosition + "px",
    width: 2 * (radius ?? 5) + "px",
    height: 2 * (radius ?? 5) + "px",
    borderRadius: 50 + "%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  if (dragging) {
    weightStyle = {
      backgroundColor: color,
      borderStyle: "solid",
      borderColor: "lightblue",
      position: "absolute" as "absolute",
      left: xPosition + "px",
      top: yPosition + "px",
      width: 2 * (radius ?? 5) + "px",
      height: 2 * (radius ?? 5) + "px",
      borderRadius: 50 + "%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  }

  return (
    <button
      className="weight"
      style={weightStyle}
      onClick={() => {
        console.log("here");
        setDragging(true);
      }}
      onDrag={() => {
        console.log("dragging");
      }}
    >
      <p className="weightLabel">{mass} kg</p>
    </button>
  );
};
