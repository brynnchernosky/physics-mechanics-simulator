import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { IWallProps } from "./Wall";
import "./Weight.scss";
import { Wedge } from "./Wedge";

export interface IForce {
  description?: string;
  impulse?: boolean;
  magnitude: number;
  directionInDegrees: number;
}
export interface IWeightProps {
  color: string;
  displayXPosition: number;
  displayYPosition: number;
  displayXVelocity: number;
  displayYVelocity: number;
  elasticCollisions: boolean;
  startForces: IForce[];
  incrementTime: number;
  mass: number;
  paused: boolean;
  pendulum: boolean;
  wedge: boolean;
  radius: number;
  reset: boolean;
  setDisplayXAcceleration: (val: number) => any;
  setDisplayXPosition: (val: number) => any;
  setDisplayXVelocity: (val: number) => any;
  setDisplayYAcceleration: (val: number) => any;
  setDisplayYPosition: (val: number) => any;
  setDisplayYVelocity: (val: number) => any;
  setPaused: (bool: boolean) => any;
  setPendulumAngle: (val: number) => any;
  setPendulumLength: (val: number) => any;
  setStartPendulumAngle: (val: number) => any;
  showAcceleration: boolean;
  showForces: boolean;
  showVelocity: boolean;
  startPosX: number;
  startPosY: number;
  startVelX?: number;
  startVelY?: number;
  timestepSize: number;
  updateDisplay: boolean;
  updatedForces: IForce[];
  setUpdatedForces: (val: IForce[]) => any;
  walls: IWallProps[];
  xMax: number;
  yMax: number;
}

export const Weight = (props: IWeightProps) => {
  const {
    color,
    displayXPosition,
    displayYPosition,
    displayXVelocity,
    displayYVelocity,
    elasticCollisions,
    startForces,
    incrementTime,
    mass,
    paused,
    pendulum,
    wedge,
    radius,
    reset,
    setDisplayXAcceleration,
    setDisplayXPosition,
    setDisplayXVelocity,
    setDisplayYAcceleration,
    setDisplayYPosition,
    setDisplayYVelocity,
    setPaused,
    setPendulumAngle,
    setPendulumLength,
    setStartPendulumAngle,
    showAcceleration,
    showForces,
    showVelocity,
    startPosX,
    startPosY,
    startVelX,
    startVelY,
    timestepSize,
    updateDisplay,
    updatedForces,
    setUpdatedForces,
    walls,
    xMax,
    yMax,
  } = props;

  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);

  const [dragging, setDragging] = useState(false);

  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: mass * 9.81,
    directionInDegrees: 270,
  };

  const getDisplayYPos = (yPos: number) => {
    return yMax - yPos - 2 * radius + 5;
  };
  const getYPosFromDisplay = (yDisplay: number) => {
    return yMax - yDisplay - 2 * radius + 5;
  };

  const setDisplayValues = () => {
    const displayPos = getDisplayYPos(yPosition);
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
  };

  useEffect(() => {
    if (displayXPosition != xPosition) {
      let x = displayXPosition;
      x = Math.max(0, x);
      x = Math.min(x, xMax - 2 * radius);
      setUpdatedStartPosX(x);
      setXPosition(x);
      setDisplayXPosition(x);
    }

    if (displayYPosition != getDisplayYPos(yPosition)) {
      console.log("display pos y: ", displayYPosition);
      console.log("coordinate y: ", yPosition);
      console.log(
        "coordinate y based on display y pos: ",
        getYPosFromDisplay(yPosition)
      );
      let y = displayYPosition;
      y = Math.max(0, y);
      y = Math.min(y, yMax - 2 * radius);
      setDisplayYPosition(y);
      let coordinatePosition = getYPosFromDisplay(y);
      setUpdatedStartPosY(coordinatePosition);
      setYPosition(coordinatePosition);
    }

    if (displayXVelocity != xVelocity) {
      let x = displayXVelocity;
      setXVelocity(x);
      setDisplayXVelocity(x);
    }

    if (displayYVelocity != -yVelocity) {
      let y = displayYVelocity;
      setYVelocity(-y);
      setDisplayYVelocity(y);
    }
  }, [updateDisplay]);

  useEffect(() => {
    if (!paused) {
      let collisions = false;
      if (!pendulum) {
        const collisionsWithGround = checkForCollisionsWithGround();
        const collisionsWithWalls = checkForCollisionsWithWall();
        collisions = collisionsWithGround || collisionsWithWalls;
      }
      if (!collisions) {
        update();
      }
      setDisplayValues();
    }
  }, [incrementTime]);

  useEffect(() => {
    console.log("use effect reset");
    resetEverything();
  }, [reset]);

  useEffect(() => {
    console.log("Updated x pos: ", updatedStartPosX);
  }, [updatedStartPosX]);
  useEffect(() => {
    console.log("Updated y pos: ", updatedStartPosY);
  }, [updatedStartPosY]);

  useEffect(() => {
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
  }, [startForces]);

  const resetEverything = () => {
    console.log(
      "Start: ",
      startPosX,
      ",",
      startPosY,
      " Current: ",
      xPosition,
      ",",
      yPosition,
      " Updated: ",
      updatedStartPosX,
      ",",
      updatedStartPosY
    );
    setXPosition(updatedStartPosX);
    setYPosition(updatedStartPosY);
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setUpdatedForces(startForces);

    if (pendulum) {
      const x = xMax / 2 - updatedStartPosX - radius;
      const y = updatedStartPosY + radius + 5;
      let angle = (Math.atan(y / x) * 180) / Math.PI;
      if (angle < 0) {
        angle += 180;
      }
      let oppositeAngle = 90 - angle;
      if (oppositeAngle < 0) {
        oppositeAngle = 90 - (180 - angle);
      }
      setPendulumLength(Math.sqrt(x * x + y * y));
      setStartPendulumAngle((oppositeAngle * Math.PI) / 180);
    }
    setDisplayValues();
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
    const x = xMax / 2 - xPos - radius;
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
    setPendulumAngle((oppositeAngle * Math.PI) / 180);
    // setPendulumLength(pendulumLength)

    const mag =
      mass * 9.81 * Math.cos((oppositeAngle * Math.PI) / 180) +
      (mass * (xVel * xVel + yVel * yVel)) / pendulumLength;

    const forceOfTension: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: angle,
    };

    return [forceOfGravity, forceOfTension];
  };

  const getNewPosition = (pos: number, vel: number) => {
    return pos + vel * timestepSize;
  };

  const getNewVelocity = (vel: number, acc: number) => {
    return vel + acc * timestepSize;
  };

  const checkForCollisionsWithWall = () => {
    let collision = false;
    const minX = xPosition;
    const maxX = xPosition + 2 * radius;
    const containerWidth = window.innerWidth;
    if (xVelocity != 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 90) {
          const wallX = (wall.xPos / 100) * window.innerWidth;
          if (wall.xPos < 0.35) {
            if (minX <= wallX) {
              if (elasticCollisions) {
                setXVelocity(-xVelocity);
              } else {
                setXVelocity(0);
                setXPosition(wallX - 2 * radius + 5);
              }
              collision = true;
            }
          } else {
            if (maxX >= wallX) {
              if (elasticCollisions) {
                setXVelocity(-xVelocity);
              } else {
                setXVelocity(0);
                setXPosition(wallX - 2 * radius + 5);
              }
              collision = true;
            }
          }
        }
      });
    }
    return collision;
  };

  const checkForCollisionsWithGround = () => {
    let collision = false;
    const maxY = yPosition + 2 * radius;
    if (yVelocity > 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 0) {
          const groundY = (wall.yPos / 100) * window.innerHeight;
          if (maxY >= groundY) {
            if (elasticCollisions) {
              setYVelocity(-yVelocity);
            } else {
              setYVelocity(0);
              setYPosition(groundY - 2 * radius + 5);
              const forceOfGravity: IForce = {
                description: "Gravity",
                magnitude: 9.81 * mass,
                directionInDegrees: 270,
              };
              const normalForce: IForce = {
                description: "Normal force",
                magnitude: 9.81 * mass,
                directionInDegrees: wall.angleInDegrees + 90,
              };
              setUpdatedForces([forceOfGravity, normalForce]);
            }
            collision = true;
          }
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
  if (dragging) {
    weightStyle.borderColor = "lightblue";
  }

  const [clickPositionX, setClickPositionX] = useState(0);
  const [clickPositionY, setClickPositionY] = useState(0);

  const [weightMenuVisible, setWeightMenuVisible] = useState(false);

  return (
    <div style={{ zIndex: -1000 }}>
      <div
        className="weightContainer"
        onPointerDown={(e) => {
          if (!wedge) {
            e.preventDefault();
            setPaused(true);
            setDragging(true);
            setClickPositionX(e.clientX);
            setClickPositionY(e.clientY);
          }
        }}
        onPointerMove={(e) => {
          e.preventDefault();
          if (dragging) {
            const originalYPosition = yPosition;
            let newY = yPosition + e.clientY - clickPositionY;
            if (newY > yMax - 2 * radius) {
              newY = yMax - 2 * radius;
            }

            const originalXPosition = xPosition;
            let newX = xPosition + e.clientX - clickPositionX;
            if (newX > xMax - 2 * radius) {
              newX = xMax - 2 * radius;
            } else if (newX < 0) {
              newX = 0;
            }

            setXPosition(newX);
            setYPosition(newY);
            setUpdatedStartPosX(newX);
            setUpdatedStartPosY(newY);
            setDisplayYPosition(
              Math.round((yMax - 2 * radius - newY + 5) * 100) / 100
            );
            setClickPositionX(e.clientX);
            setClickPositionY(e.clientY);
            setDisplayValues();
          }
        }}
        onPointerUp={(e) => {
          if (dragging) {
            e.preventDefault();
            setDragging(false);
            resetEverything();
          }
        }}
      >
        <div className="weight" style={weightStyle}>
          <p className="weightLabel">{mass} kg</p>
        </div>
      </div>
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
              x2={xMax / 2}
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
                  id="accArrow"
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
                markerEnd="url(#accArrow)"
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
                  id="velArrow"
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
                markerEnd="url(#velArrow)"
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
              20 *
              Math.sin((force.directionInDegrees * Math.PI) / 180);
          const arrowEndX: number =
            arrowStartX +
            Math.abs(force.magnitude) *
              20 *
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
                      id="forceArrow"
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
                    markerEnd="url(#forceArrow)"
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
