import { sign } from "node:crypto";
import { isAbsolute } from "node:path/win32";
import { useState, useEffect, useCallback } from "react";
import { couldStartTrivia } from "typescript";
import { IWallProps } from "./Wall";
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
  startAccX?: number;
  startAccY?: number;
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
  setPositionDisplay: (val: number) => any;
  setVelocityDisplay: (val: number) => any;
  setAccelerationDisplay: (val: number) => any;
  elasticCollisions: boolean;
  pendulum: boolean;
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
    showVelocity,
    showAcceleration,
    setPositionDisplay,
    setVelocityDisplay,
    setAccelerationDisplay,
    elasticCollisions,
    pendulum,
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

  const [angularVelocity, setAngularVelocity] = useState(0);
  const [angle, setAngle] = useState(0);

  const [draggable, setDraggable] = useState(false);
  const [dragging, setDragging] = useState(false);

  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: mass * 9.81,
    directionInDegrees: 270,
  };

  useEffect(() => {
    if (!paused) {
      const collisions = checkForCollisionsWithGround();
      if (!collisions) {
        update();
        const displayPos =
          window.innerHeight * 0.8 - yPosition - 2 * radius + 5;
        setPositionDisplay(Math.round(displayPos * 100) / 100);
        setVelocityDisplay((-1 * Math.round(yVelocity * 100)) / 100);
        setAccelerationDisplay((-1 * Math.round(yAcceleration * 100)) / 100);
      }
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
    setXAcceleration(getNewAccelerationX(forces));
    setYAcceleration(getNewAccelerationY(forces));
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

  const getNewForces = (xPos: number, yPos: number) => {
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
    setAngle(oppositeAngle);

    const pendulumLength = Math.sqrt(x * x + y * y);

    const mag =
      mass * 9.81 * Math.cos((oppositeAngle * Math.PI) / 180) +
      (mass * (xVelocity * xVelocity + yVelocity * yVelocity)) / pendulumLength;

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

  const checkForCollisionsWithGround = () => {
    let collision = false;
    const maxY = yPosition + yVelocity * timestepSize + 2 * radius;
    const containerHeight = window.innerHeight;
    if (yVelocity != 0) {
      walls.forEach((wall) => {
        const wallHeight = (wall.yPos / 100) * containerHeight;
        if (maxY >= wallHeight) {
          if (elasticCollisions) {
            setYVelocity(-yVelocity);
          } else {
            setYPosition(wallHeight - 2 * radius + 5);
            const newForce: IForce = {
              description: "Normal force",
              magnitude: 9.81 * mass,
              directionInDegrees: wall.angleInDegrees + 90,
            };
            const forceList = updatedForces;
            forceList.push(newForce);
            setUpdatedForces(forceList);
            setYVelocity(0);
            setXAcceleration(getNewAccelerationX(forces));
            setYAcceleration(getNewAccelerationY(forces));
          }
          collision = true;
        }
      });
    }
    return collision;
  };

  const update = () => {
    // RK4 update
    if (pendulum) {
      const forces1 = getNewForces(xPosition, yPosition);
      const xAcc1 = getNewAccelerationX(forces1);
      const yAcc1 = getNewAccelerationX(forces1);
      const xVel1 = getNewVelocity(xVelocity, xAcc1);
      const yVel1 = getNewVelocity(yVelocity, yAcc1);
      const xPos1 = getNewPosition(xPosition, xVel1);
      const yPos1 = getNewPosition(yPosition, yVel1);

      let xVel2 = getNewVelocity(xVelocity, xAcc1 / 2);
      let yVel2 = getNewVelocity(yVelocity, yAcc1 / 2);
      let xPos2 = getNewPosition(xPosition, xVel1 / 2);
      let yPos2 = getNewPosition(yPosition, yVel1 / 2);
      const forces2 = getNewForces(xPos2, yPos2);
      const xAcc2 = getNewAccelerationX(forces2);
      const yAcc2 = getNewAccelerationY(forces2);
      xVel2 = getNewVelocity(xVel2, xAcc2);
      yVel2 = getNewVelocity(yVel2, yAcc2);
      xPos2 = getNewPosition(xPos2, xVel2);
      yPos2 = getNewPosition(yPos2, yVel2);

      let xVel3 = getNewVelocity(xVelocity, xAcc2 / 2);
      let yVel3 = getNewVelocity(yVelocity, yAcc2 / 2);
      let xPos3 = getNewPosition(xPosition, xVel2 / 2);
      let yPos3 = getNewPosition(yPosition, yVel2 / 2);
      const forces3 = getNewForces(xPos3, yPos3);
      const xAcc3 = getNewAccelerationX(forces3);
      const yAcc3 = getNewAccelerationY(forces3);
      xVel3 = getNewVelocity(xVel3, xAcc3);
      yVel3 = getNewVelocity(yVel3, yAcc3);
      xPos3 = getNewPosition(xPos3, xVel3);
      yPos3 = getNewPosition(yPos3, yVel3);

      let xVel4 = getNewVelocity(xVelocity, xAcc3 / 2);
      let yVel4 = getNewVelocity(yVelocity, yAcc3 / 2);
      let xPos4 = getNewPosition(xPosition, xVel3 / 2);
      let yPos4 = getNewPosition(yPosition, yVel3 / 2);
      const forces4 = getNewForces(xPos4, yPos4);
      const xAcc4 = getNewAccelerationX(forces4);
      const yAcc4 = getNewAccelerationY(forces4);
      xVel4 = getNewVelocity(xVel4, xAcc4);
      yVel4 = getNewVelocity(yVel4, yAcc4);
      xPos4 = getNewPosition(xPos4, xVel4);
      yPos4 = getNewPosition(yPos4, yVel4);

      setXVelocity(xVel4);
      setYVelocity(yVel4);
      setXPosition(
        xPosition +
          timestepSize * (xVel1 / 6.0 + xVel2 / 3.0 + xVel3 / 3.0 + xVel4 / 6.0)
      );
      setYPosition(
        yPosition +
          timestepSize * (yVel1 / 6.0 + yVel2 / 3.0 + yVel3 / 3.0 + yVel4 / 6.0)
      );
    } else {
      // Eulerian update
      const xVel = getNewVelocity(xVelocity, xAcceleration);
      const yVel = getNewVelocity(yVelocity, yAcceleration);
      setXVelocity(xVel);
      setYVelocity(yVel);
      setXPosition(getNewPosition(xPosition, xVel));
      setYPosition(getNewPosition(yPosition, yVel));
    }
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
            setPositionDisplay(
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
      {pendulum && (
        <div
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
                  <path d="M0,0 L0,6 L9,3 z" fill="#ffff00" />
                </marker>
              </defs>
              <line
                x1={xPosition + radius}
                y1={yPosition + radius}
                x2={xPosition + radius + xVelocity * 3}
                y2={yPosition + radius + yVelocity * 3}
                stroke={"#ffff00"}
                strokeWidth="5"
                markerEnd="url(#arrow)"
              />
            </svg>
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
              3 *
              Math.sin((force.directionInDegrees * Math.PI) / 180);
          const arrowEndX: number =
            arrowStartX +
            Math.abs(force.magnitude) *
              3 *
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
