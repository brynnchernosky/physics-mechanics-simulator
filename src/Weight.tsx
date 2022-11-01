import { sign } from "node:crypto";
import { isAbsolute } from "node:path/win32";
import { useState, useEffect, useCallback } from "react";
import { couldStartTrivia } from "typescript";
import { IWallProps } from "./Wall";
import { OutlinedInput, TextField, InputAdornment } from "@mui/material";
import "./Weight.scss";

export interface IForce {
  description?: string;
  impulse?: boolean;
  magnitude: number;
  directionInDegrees: number;
}
export interface IWeightProps {
  startPosX: number;
  startPosY: number;
  startVelX?: number;
  startVelY?: number;
  radius: number;
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
  showVelocity: boolean;
  showAcceleration: boolean;
  setDisplayXPosition: (val: number) => any;
  setDisplayXVelocity: (val: number) => any;
  setDisplayXAcceleration: (val: number) => any;
  setDisplayYPosition: (val: number) => any;
  setDisplayYVelocity: (val: number) => any;
  setDisplayYAcceleration: (val: number) => any;
  elasticCollisions: boolean;
  pendulum: boolean;
}

export const Weight = (props: IWeightProps) => {
  const {
    startPosX,
    startPosY,
    startVelX,
    startVelY,
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
    showVelocity,
    showAcceleration,
    setDisplayXPosition,
    setDisplayXVelocity,
    setDisplayXAcceleration,
    setDisplayYPosition,
    setDisplayYVelocity,
    setDisplayYAcceleration,
    elasticCollisions,
    pendulum,
  } = props;

  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);
  const [updatedForces, setUpdatedForces] = useState(forces);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);

  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: mass * 9.81,
    directionInDegrees: 270,
  };

  useEffect(() => {
    if (!paused) {
      const collisions = checkForCollisionsWithGround(yPosition);
      if (!collisions) {
        update();
      }
      const displayPos = window.innerHeight * 0.8 - yPosition - 2 * radius + 5;
      setDisplayYPosition(Math.round(displayPos * 100) / 100);
      setDisplayXPosition(Math.round(xPosition * 100) / 100);
      setDisplayYVelocity((-1 * Math.round(yVelocity * 100)) / 100);
      setDisplayXVelocity(Math.round(xVelocity * 100) / 100);
      setDisplayYAcceleration(
        (-1 * Math.round(getNewAccelerationY(updatedForces) * 100)) / 100
      );
      setDisplayXAcceleration(
        Math.round(getNewAccelerationX(updatedForces) * 100) / 100
      );
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
    setUpdatedForces(forces);
  };

  const getNewAccelerationX = (forceList: IForce[]) => {
    let newXAcc = 0;
    forceList.forEach((force) => {
      newXAcc +=
        (force.magnitude *
          Math.cos((force.directionInDegrees * Math.PI) / 180)) /
        mass;
    });
    return newXAcc;
  };

  const getNewAccelerationY = (forceList: IForce[]) => {
    let newYAcc = 0;
    forceList.forEach((force) => {
      newYAcc +=
        (-1 *
          (force.magnitude *
            Math.sin((force.directionInDegrees * Math.PI) / 180))) /
        mass;
    });
    return newYAcc;
  };

  const getNewForces = (
    xPos: number,
    yPos: number,
    xVel: number,
    yVel: number
  ) => {
    if (!pendulum) {
      return updatedForces;
    }
    const x = window.innerWidth * 0.35 - xPos - radius;
    const y = yPos + radius + 5;
    let angle = (Math.atan(y / x) * 180) / Math.PI;
    if (angle < 0) {
      angle += 180;
    }
    let oppositeAngle = 90 - angle;
    if (oppositeAngle < 0) {
      oppositeAngle = 90 - (180 - angle);
    }

    const pendulumLength = Math.sqrt(x * x + y * y);

    const mag =
      mass * 9.81 * Math.cos((oppositeAngle * Math.PI) / 180) +
      (mass * (xVel * xVel + yVel * yVel)) / pendulumLength;

    const forceOfTension: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: angle,
    };

    console.log(angle);

    return [forceOfGravity, forceOfTension];
  };

  const getNewPosition = (pos: number, vel: number) => {
    return pos + vel * timestepSize;
  };

  const getNewVelocity = (vel: number, acc: number) => {
    return vel + acc * timestepSize;
  };

  const checkForCollisionsWithGround = (yPos: number) => {
    let collision = false;
    const maxY = yPos + 2 * radius;
    const containerHeight = window.innerHeight;
    if (yVelocity > 0) {
      walls.forEach((wall) => {
        const wallHeight = (wall.yPos / 100) * containerHeight;
        if (maxY >= wallHeight) {
          //setYPosition(wallHeight + Math.abs(wallHeight - maxY) + 0.001);
          if (elasticCollisions) {
            setYVelocity(-yVelocity);
          } else {
            setYVelocity(0);
            setYPosition(wallHeight - 2 * radius + 5);
            // setYPosition(wallHeight - 2 * radius + 5);
            const newForce: IForce = {
              description: "Normal force",
              magnitude: 9.81 * mass,
              directionInDegrees: wall.angleInDegrees + 90,
            };
            const forceList = updatedForces;
            forceList.push(newForce);
            setUpdatedForces(forceList);
          }
          collision = true;
        }
      });
    }
    return collision;
  };

  const update = () => {
    // RK4 update
    let xPos = xPosition;
    let yPos = yPosition;
    let xVel = xVelocity;
    let yVel = yVelocity;
    for (let i = 0; i < 60; i++) {
      let forces1 = getNewForces(xPos, yPos, xVel, yVel);
      const xAcc1 = getNewAccelerationX(forces1);
      const yAcc1 = getNewAccelerationY(forces1);
      const xVel1 = getNewVelocity(xVel, xAcc1);
      const yVel1 = getNewVelocity(yVel, yAcc1);

      let xVel2 = getNewVelocity(xVel, xAcc1 / 2);
      let yVel2 = getNewVelocity(yVel, yAcc1 / 2);
      let xPos2 = getNewPosition(xPos, xVel1 / 2);
      let yPos2 = getNewPosition(yPos, yVel1 / 2);
      const forces2 = getNewForces(xPos2, yPos2, xVel2, yVel2);
      const xAcc2 = getNewAccelerationX(forces2);
      const yAcc2 = getNewAccelerationY(forces2);
      xVel2 = getNewVelocity(xVel2, xAcc2);
      yVel2 = getNewVelocity(yVel2, yAcc2);
      xPos2 = getNewPosition(xPos2, xVel2);
      yPos2 = getNewPosition(yPos2, yVel2);

      let xVel3 = getNewVelocity(xVel, xAcc2 / 2);
      let yVel3 = getNewVelocity(yVel, yAcc2 / 2);
      let xPos3 = getNewPosition(xPos, xVel2 / 2);
      let yPos3 = getNewPosition(yPos, yVel2 / 2);
      const forces3 = getNewForces(xPos3, yPos3, xVel3, yVel3);
      const xAcc3 = getNewAccelerationX(forces3);
      const yAcc3 = getNewAccelerationY(forces3);
      xVel3 = getNewVelocity(xVel3, xAcc3);
      yVel3 = getNewVelocity(yVel3, yAcc3);
      xPos3 = getNewPosition(xPos3, xVel3);
      yPos3 = getNewPosition(yPos3, yVel3);

      let xVel4 = getNewVelocity(xVel, xAcc3);
      let yVel4 = getNewVelocity(yVel, yAcc3);
      let xPos4 = getNewPosition(xPos, xVel3);
      let yPos4 = getNewPosition(yPos, yVel3);
      const forces4 = getNewForces(xPos4, yPos4, xVel4, yVel4);
      const xAcc4 = getNewAccelerationX(forces4);
      const yAcc4 = getNewAccelerationY(forces4);
      xVel4 = getNewVelocity(xVel4, xAcc4);
      yVel4 = getNewVelocity(yVel4, yAcc4);
      xPos4 = getNewPosition(xPos4, xVel4);
      yPos4 = getNewPosition(yPos4, yVel4);

      xVel +=
        timestepSize * (xAcc1 / 6.0 + xAcc2 / 3.0 + xAcc3 / 3.0 + xAcc4 / 6.0);
      yVel +=
        timestepSize * (yAcc1 / 6.0 + yAcc2 / 3.0 + yAcc3 / 3.0 + yAcc4 / 6.0);
      xPos +=
        timestepSize * (xVel1 / 6.0 + xVel2 / 3.0 + xVel3 / 3.0 + xVel4 / 6.0);
      yPos +=
        timestepSize * (yVel1 / 6.0 + yVel2 / 3.0 + yVel3 / 3.0 + yVel4 / 6.0);
    }

    setXVelocity(xVel);
    setYVelocity(yVel);
    setXPosition(xPos);
    setYPosition(yPos);
    setUpdatedForces(getNewForces(xPos, yPos, xVel, yVel));
  };

  let weightStyle = {
    backgroundColor: color,
    borderStyle: "solid",
    borderColor: "black",
    position: "absolute" as "absolute",
    left: xPosition + "px",
    top: yPosition + "px",
    width: 2 * radius + "px",
    height: 2 * radius + "px",
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

  const [weightMenuVisible, setWeightMenuVisible] = useState(false);

  return (
    <div style={{ zIndex: -1000 }}>
      <div
        className="weightContainer"
        onDoubleClick={() => {
          setWeightMenuVisible(true);
        }}
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
            if (newY > window.innerHeight * 0.81 - 2 * radius) {
              newY = window.innerHeight * 0.81 - 2 * radius;
            }

            const originalXPosition = xPosition;
            let newX = xPosition + e.clientX - clickPositionX;
            if (newX > window.innerWidth * 0.7 - 2 * radius) {
              newX = window.innerWidth * 0.7 - 2 * radius;
            } else if (newX < 0) {
              newX = 0;
            }

            setXPosition(newX);
            setYPosition(newY);
            setUpdatedStartPosX(newX);
            setUpdatedStartPosY(newY);
            setDisplayYPosition(
              Math.round(
                (window.innerHeight * 0.8 - 2 * radius - newY + 5) * 100
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
      {weightMenuVisible && !pendulum && (
        <div
          style={{
            position: "absolute",
            top: yPosition - 70 + "px",
            left: xPosition + "px",
          }}
        >
          <TextField
            id="outlined-basic"
            label="Velocity"
            variant="outlined"
            type="number"
            defaultValue="0"
            InputProps={{
              endAdornment: <InputAdornment position="end">m/s</InputAdornment>,
            }}
          />
        </div>
      )}
      {pendulum && (
        <div
          className="rod"
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: -2,
          }}
        >
          <svg
            width={window.innerWidth + "px"}
            height={window.innerHeight + "px"}
          >
            <line
              x1={xPosition + radius}
              y1={yPosition + radius}
              x2={window.innerWidth * 0.35}
              y2={-5}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>
        </div>
      )}
      {!dragging && showAcceleration && (
        <div>
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              zIndex: -1,
              left: 0,
              top: 0,
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
                  <path d="M0,0 L0,6 L9,3 z" fill="green" />
                </marker>
              </defs>
              <line
                x1={xPosition + radius}
                y1={yPosition + radius}
                x2={xPosition + radius + getNewAccelerationX(updatedForces) * 5}
                y2={yPosition + radius + getNewAccelerationY(updatedForces) * 5}
                stroke={"green"}
                strokeWidth="5"
                markerEnd="url(#arrow)"
              />
            </svg>
            <div
              style={{
                pointerEvents: "none",
                position: "absolute",
                left:
                  xPosition +
                  radius +
                  getNewAccelerationX(updatedForces) * 5 +
                  25 +
                  "px",
                top:
                  yPosition +
                  radius +
                  getNewAccelerationY(updatedForces) * 5 +
                  25 +
                  "px",
                zIndex: -1,
                lineHeight: 0.5,
              }}
            >
              <p>
                {Math.round(
                  100 *
                    Math.sqrt(
                      Math.pow(getNewAccelerationX(updatedForces) * 3, 2) +
                        Math.pow(getNewAccelerationY(updatedForces) * 3, 2)
                    )
                ) / 100}{" "}
                m/s<sup>2</sup>
              </p>
            </div>
          </div>
        </div>
      )}
      {!dragging && showVelocity && (
        <div>
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              zIndex: -1,
              left: 0,
              top: 0,
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
                  <path d="M0,0 L0,6 L9,3 z" fill="blue" />
                </marker>
              </defs>
              <line
                x1={xPosition + radius}
                y1={yPosition + radius}
                x2={xPosition + radius + xVelocity * 3}
                y2={yPosition + radius + yVelocity * 3}
                stroke={"blue"}
                strokeWidth="5"
                markerEnd="url(#arrow)"
              />
            </svg>
            <div
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: xPosition + radius + xVelocity * 3 + 25 + "px",
                top: yPosition + radius + yVelocity * 3 + "px",
                zIndex: -1,
                lineHeight: 0.5,
              }}
            >
              <p>
                {Math.round(
                  100 * Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity)
                ) / 100}{" "}
                m/s
              </p>
            </div>
          </div>
        </div>
      )}
      {!dragging &&
        showForces &&
        updatedForces.map((force, index) => {
          let arrowStartY: number = yPosition + radius;
          const arrowStartX: number = xPosition + radius;
          let arrowEndY: number =
            arrowStartY -
            Math.abs(force.magnitude) *
              2 *
              Math.sin((force.directionInDegrees * Math.PI) / 180);
          const arrowEndX: number =
            arrowStartX +
            Math.abs(force.magnitude) *
              2 *
              Math.cos((force.directionInDegrees * Math.PI) / 180);

          let color = "#0d0d0d";

          return (
            <div key={index}>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: -1,
                  left: 0,
                  top: 0,
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
                  position: "absolute",
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
