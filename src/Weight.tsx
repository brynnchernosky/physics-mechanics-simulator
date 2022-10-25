import { isAbsolute } from "node:path/win32";
import { useState, useEffect, useCallback } from "react";
import { couldStartTrivia } from "typescript";
import { IWallProps } from "./Wall";
import "./Weight.scss";

export interface IForce {
  description?: string;
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
  showForces: boolean;
  setPositionDisplay: (val: number) => any;
  setVelocityDisplay: (val: number) => any;
  setAccelerationDisplay: (val: number) => any;
  elasticCollisions: boolean;
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
    showForces,
    setPositionDisplay,
    setVelocityDisplay,
    setAccelerationDisplay,
    elasticCollisions,
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
      checkForCollisionsWithGround();
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
    setAccelerationDisplay((-1 * Math.round(newYAcc * 100)) / 100);
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

    const displayPos =
      window.innerHeight * 0.8 - newYPos - 2 * (radius ?? 5) + 5;
    setPositionDisplay(Math.round(displayPos * 100) / 100);
  };

  const updateVelocity = (timestep: number) => {
    const newXVelocity = xVelocity + xAcceleration * timestep;
    setXVelocity(newXVelocity);
    const newYVelocity = yVelocity + yAcceleration * timestep;
    setYVelocity(newYVelocity);
    setVelocityDisplay((-1 * Math.round(newYVelocity * 100)) / 100);
  };

  const checkForCollisionsWithGround = () => {
    let collision = false;
    const effectiveRadius = radius ?? 5;
    const maxY = yPosition + yVelocity * timestepSize + 2 * effectiveRadius;
    const containerHeight = window.innerHeight;
    if (yVelocity != 0) {
      walls.forEach((wall) => {
        const wallHeight = (wall.yPos / 100) * containerHeight;
        if (maxY >= wallHeight) {
          if (elasticCollisions) {
            setYVelocity(-yVelocity);
          } else {
            setYPosition(wallHeight - 2 * effectiveRadius + 5);
            const newForce: IForce = {
              description: "Normal force",
              magnitude: 9.81 * mass,
              directionInDegrees: wall.angleInDegrees + 90,
            };
            const forceList = updatedForces;
            forceList.push(newForce);
            setUpdatedForces(forceList);
            setYVelocity(0);
            updateAcceleration(forceList);
          }
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
            const originalYPosition = yPosition;
            let newY = yPosition + e.clientY - clickPositionY;
            if (newY > window.innerHeight * 0.81 - 2 * (radius ?? 5)) {
              newY = window.innerHeight * 0.81 - 2 * (radius ?? 5);
            }

            const originalXPosition = xPosition;
            let newX = xPosition + e.clientX - clickPositionX;
            if (newX > window.innerWidth * 0.7 - 2 * (radius ?? 5)) {
              newX = window.innerWidth * 0.7 - 2 * (radius ?? 5);
            } else if (newX < 0) {
              newX = 0;
            }

            setXPosition(newX);
            setYPosition(newY);
            setUpdatedStartPosX(newX);
            setUpdatedStartPosY(newY);
            setPositionDisplay(
              Math.round(
                (window.innerHeight * 0.8 - 2 * (radius ?? 5) - newY + 5) * 100
              ) / 100
            );
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
      </div>
      {!dragging &&
        showForces &&
        updatedForces.map((force, index) => {
          let arrowStartY: number = yPosition;
          const arrowStartX: number = xPosition + (radius ?? 5);
          let arrowEndY: number =
            arrowStartY -
            Math.abs(force.magnitude) *
              3 *
              Math.sin((force.directionInDegrees * Math.PI) / 180);
          const arrowEndX: number =
            arrowStartX +
            Math.abs(force.magnitude) *
              3 *
              Math.cos((force.directionInDegrees * Math.PI) / 180);

          let color = "#0d0d0d";
          if (arrowStartY > arrowEndY) {
            // color = "#ffff00";
            arrowStartY -= radius ?? 5;
            arrowEndY -= radius ?? 5;
          }

          return (
            <div key={index}>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: -1,
                }}
              >
                <svg
                  width={window.innerWidth + "px"}
                  height={window.innerHeight + "px"}
                >
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
                      <path d="M0,0 L0,6 L9,3 z" fill={color} />
                    </marker>
                  </defs>
                  <line
                    x1={arrowStartX}
                    y1={arrowStartY}
                    x2={arrowEndX}
                    y2={arrowEndY}
                    stroke={color}
                    strokeWidth="5"
                    markerEnd="url(#arrow)"
                  />
                </svg>
              </div>
              <div
                style={{
                  pointerEvents: "none",
                  position: "relative",
                  left: arrowEndX + 25 + "px",
                  top: arrowEndY + "px",
                  zIndex: -1,
                  lineHeight: 0.5,
                }}
              >
                {force.description && <p>{force.description}</p>}
                {!force.description && <p>Force</p>}
                <p>{Math.round(100 * force.magnitude) / 100} N</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};
