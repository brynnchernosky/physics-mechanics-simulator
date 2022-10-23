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
        (-1 *
          (force.magnitude *
            Math.sin((force.directionInDegrees * Math.PI) / 180))) /
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
            directionInDegrees: wall.angleInDegrees + 90,
          };
          const forceList = updatedForces;
          forceList.push(newForce);
          setUpdatedForces(forceList);
          setYVelocity(0);
          updateAcceleration(forceList);
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
    <div style={{ zIndex: -1000 }}>
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
            let y = e.clientY;
            if (e.clientY > window.innerHeight * 0.9) {
              y = window.innerHeight * 0.9;
            }
            let x = e.clientX;
            if (e.clientX > window.innerHeight * 1.1) {
              x = window.innerHeight * 1.1;
            } else if (x < window.innerHeight * 0.15) {
              x = window.innerHeight * 0.15;
            }

            setXPosition(xPosition + x - clickPositionX);
            setYPosition(yPosition + y - clickPositionY);
            setUpdatedStartPosX(xPosition + x - clickPositionX);
            setUpdatedStartPosY(yPosition + y - clickPositionY);
            setClickPositionX(x);
            setClickPositionY(y);
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
      </div>
      {!dragging &&
        updatedForces.map((force, index) => {
          const arrowStartY = yPosition + (radius ?? 5) / 2;
          const arrowStartX = xPosition + (radius ?? 5);
          const arrowEndY =
            arrowStartY -
            Math.abs(force.magnitude) *
              3 *
              Math.sin((force.directionInDegrees * Math.PI) / 180);
          const arrowEndX =
            arrowStartX +
            Math.abs(force.magnitude) *
              3 *
              Math.cos((force.directionInDegrees * Math.PI) / 180);

          return (
            <div
              key={index}
              style={{
                pointerEvents: "none",
                position: "absolute",
                zIndex: -1,
              }}
            >
              <svg width={"5000px"} height={"5000px"}>
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="0"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                  </marker>
                </defs>
                <line
                  x1={arrowStartX}
                  y1={arrowStartY}
                  x2={arrowEndX}
                  y2={arrowEndY}
                  stroke="#000"
                  strokeWidth="5"
                  markerEnd="url(#arrow)"
                />
              </svg>
            </div>
          );
        })}
    </div>
  );
};
