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
  adjustPendulumAngle: number;
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
  pendulumLength: number;
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
  mode: string;
  noMovement: boolean;
  pendulumAngle: number;
  showForces: boolean;
  showVelocity: boolean;
  startPosX: number;
  startPosY: number;
  startVelX?: number;
  startVelY?: number;
  timestepSize: number;
  updateDisplay: any;
  updatedForces: IForce[];
  setUpdatedForces: (val: IForce[]) => any;
  walls: IWallProps[];
  coefficientOfKineticFriction: number;
  wedgeWidth: number;
  wedgeHeight: number;
}

export const Weight = (props: IWeightProps) => {
  const {
    adjustPendulumAngle,
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
    pendulumLength,
    wedge,
    radius,
    mode,
    noMovement,
    pendulumAngle,
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
    coefficientOfKineticFriction,
    wedgeWidth,
    wedgeHeight,
  } = props;

  const xMin = 0;
  const yMin = 0;
  const xMax = window.innerWidth * 0.7;
  const yMax = window.innerHeight * 0.8;

  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);

  const [xPosition, setXPosition] = useState(startPosX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);
  const [kineticFriction, setKineticFriction] = useState(false);

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
    if (!paused && !noMovement) {
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
    resetEverything();
  }, [reset]);

  useEffect(() => {
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
  }, [startForces]);

  const resetEverything = () => {
    setKineticFriction(false);
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
      setPendulumAngle(oppositeAngle);
      setStartPendulumAngle(oppositeAngle);
    }
    setDisplayValues();
  };

  // Change pendulum angle based on input field
  useEffect(() => {
    if (paused && pendulum && pendulumLength != 0) {
      let length = pendulumLength;
      // const x = xMax / 2 - updatedStartPosX - radius;
      // const y = updatedStartPosY + radius + 5;
      // let angle = (Math.atan(y / x) * 180) / Math.PI;
      // if (angle < 0) {
      //   angle += 180;
      // }
      // let oppositeAngle = 90 - angle;
      // if (oppositeAngle < 0) {
      //   oppositeAngle = 90 - (180 - angle);
      // }

      // Finish debugging
      const x = length * Math.cos(((90 - pendulumAngle) * Math.PI) / 180);
      const y = length * Math.sin(((90 - pendulumAngle) * Math.PI) / 180);
      const xPos = xMax / 2 - x - radius;
      const yPos = y - radius - 5;
      setXPosition(xPos);
      setYPosition(yPos);
    }
  }, [adjustPendulumAngle]);

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
    setPendulumAngle(oppositeAngle);
    setPendulumLength(Math.sqrt(x * x + y * y));

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
                setXPosition(wallX + 5);
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

  useEffect(() => {
    if (wedge && xVelocity != 0 && mode != "Review" && !kineticFriction) {
      setKineticFriction(true);
      //switch from static to kinetic friction
      const normalForce: IForce = {
        description: "Normal Force",
        magnitude:
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - 90 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
      };
      let frictionForce: IForce = {
        description: "Kinetic Friction Force",
        magnitude:
          coefficientOfKineticFriction *
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
      };
      // reduce magnitude of friction force if necessary such that block cannot slide up plane
      let yForce = -forceOfGravity.magnitude;
      yForce +=
        normalForce.magnitude *
        Math.sin((normalForce.directionInDegrees * Math.PI) / 180);
      yForce +=
        frictionForce.magnitude *
        Math.sin((frictionForce.directionInDegrees * Math.PI) / 180);
      if (yForce > 0) {
        frictionForce.magnitude =
          (-normalForce.magnitude *
            Math.sin((normalForce.directionInDegrees * Math.PI) / 180) +
            forceOfGravity.magnitude) /
          Math.sin((frictionForce.directionInDegrees * Math.PI) / 180);
      }
      if (coefficientOfKineticFriction != 0) {
        setUpdatedForces([forceOfGravity, normalForce, frictionForce]);
      } else {
        setUpdatedForces([forceOfGravity, normalForce]);
      }
    }
  }, [xVelocity]);

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

  const epsilon = 0.0001;

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
            let newY = yPosition + e.clientY - clickPositionY;
            if (newY > yMax - 2 * radius) {
              newY = yMax - 2 * radius;
            }

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
          <svg width={xMax + "px"} height={window.innerHeight + "px"}>
            <line
              x1={xPosition + radius}
              y1={yPosition + radius}
              x2={xMax / 2}
              y2={-5}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>
          {!dragging && (
            <div>
              <p
                style={{
                  position: "absolute",
                  zIndex: 5,
                  left: xPosition + "px",
                  top: yPosition - 70 + "px",
                }}
              >
                {Math.round(pendulumLength)} m
              </p>
              <p
                style={{
                  position: "absolute",
                  zIndex: -1,
                  left: xMax / 2 + "px",
                  top: 30 + "px",
                }}
              >
                {Math.round(pendulumAngle * 100) / 100}°
              </p>
            </div>
          )}
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
            <svg width={xMax + "px"} height={window.innerHeight + "px"}>
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
            <svg width={xMax + "px"} height={window.innerHeight + "px"}>
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
          if (force.magnitude < epsilon) {
            return;
          }
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

          let labelTop = arrowEndY;
          let labelLeft = arrowEndX;
          if (force.directionInDegrees >= 0 && force.directionInDegrees < 90) {
            labelTop += 25;
            labelLeft += 25;
          } else if (
            force.directionInDegrees >= 90 &&
            force.directionInDegrees < 180
          ) {
            labelTop += 25;
            labelLeft -= 160;
          } else if (
            force.directionInDegrees >= 180 &&
            force.directionInDegrees < 270
          ) {
            labelTop += 25;
            labelLeft += 25;
          } else {
            labelTop += 25;
            labelLeft += 25;
          }

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
                <svg width={xMax + "px"} height={window.innerHeight + "px"}>
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
                  left: labelLeft + "px",
                  top: labelTop + "px",
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
