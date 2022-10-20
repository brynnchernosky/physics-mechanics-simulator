import { isAbsolute } from "node:path/win32";
import { useState, useEffect, useCallback } from "react";
import { couldStartTrivia } from "typescript";
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
  setPaused: (bool: boolean) => any;
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
    setPaused,
    reset,
    walls,
    forces,
  } = props;

  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);
  const [xAcceleration, setXAcceleration] = useState(startAccX ?? 0);
  const [yAcceleration, setYAcceleration] = useState(startAccY ?? 0);
  const [updatedForces, setUpdatedForces] = useState(forces);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!paused) {
      checkForCollisions();
    }
  }, [incrementTime]);

  useEffect(() => {
    resetEverything();
  }, [reset]);

  const resetEverything = () => {
    setXPosition(updatedStartPosX);
    setYPosition(updatedStartPosY);
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setXAcceleration(startAccX ?? 0);
    setYAcceleration(startAccY ?? 0);
    setUpdatedForces(forces);
    updateAcceleration(forces);
    console.log("reset block");
  };

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
    touchAction: "none",
  };
  if (draggable || dragging) {
    weightStyle.borderColor = "lightblue";
  }

  const [clickPositionX, setClickPositionX] = useState(0);
  const [clickPositionY, setClickPositionY] = useState(0);

  return (
    <div
      className="weightContainer"
      onPointerDown={(e) => {
        e.preventDefault();
        setPaused(true);
        setDragging(true);
        setClickPositionX(e.clientX);
        setClickPositionY(e.clientY);
      }}
      onPointerMove={(e) => {
        e.preventDefault();
        if (dragging) {
          setXPosition(xPosition + e.clientX - clickPositionX);
          setYPosition(yPosition + e.clientY - clickPositionY);
          setUpdatedStartPosX(xPosition + e.clientX - clickPositionX);
          setUpdatedStartPosY(yPosition + e.clientY - clickPositionY);
          setClickPositionX(e.clientX);
          setClickPositionY(e.clientY);
        }
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        setDragging(false);
        resetEverything();
      }}
    >
      <div className="weight" style={weightStyle}>
        <p className="weightLabel">{mass} kg</p>
      </div>
      {forces.map((force, index) => {
        const value = Math.abs(force.magnitude) * 3;
        const y = yPosition - value - (radius ?? 5);
        const x = xPosition + (radius ?? 5) - 7;
        const angle = 0; //(50 * Math.PI) / 180;
        const lineStyle = {
          backgroundColor: "black",
          height: value + "px",
          width: 10 + "px",
          top: y * Math.cos(angle) + x * Math.cos(angle) + "px",
          left: x * Math.sin(angle) + y * Math.sin(angle) + "px",
          zIndex: -1000,
          position: "relative" as "relative",
        };
        const xArrow = xPosition - 7;
        const yArrow = yPosition - Math.abs(force.magnitude) * 3;
        const arrowHead = {
          width: 0,
          height: 0,
          borderLeft: Math.abs(force.magnitude) / 2 + "px solid transparent",
          borderRight: Math.abs(force.magnitude) / 2 + "px solid transparent",
          borderBottom: Math.abs(force.magnitude) / 2 + "px solid black",
          top: yArrow * Math.cos(angle) + xArrow * Math.cos(angle) + "px",
          left: xArrow * Math.sin(angle) + yArrow * Math.sin(angle) + "px",
          margin: 2 + "rem",
          position: "relative" as "relative",
        };
        const forceArrow = {
          // transform: rotate(force.directionInDegrees + "deg"),
        };
        return (
          <div key={index} style={forceArrow} className="forceArrow">
            {" "}
            <div style={arrowHead} /> <div style={lineStyle} />{" "}
          </div>
        );
      })}
    </div>
  );
};
