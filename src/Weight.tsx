import { useEffect, useState } from "react";
import { IWallProps } from "./Wall";
import "./Weight.scss";

export interface IForce {
  description: string;
  magnitude: number;
  directionInDegrees: number;
  component: boolean;
}
export interface IWeightProps {
  adjustPendulumAngle: { angle: number; length: number };
  circularMotionRadius: number;
  coefficientOfKineticFriction: number;
  color: string;
  componentForces: IForce[];
  displayXVelocity: number;
  displayYVelocity: number;
  elasticCollisions: boolean;
  gravity: number;
  incrementTime: number;
  mass: number;
  mode: string;
  noMovement: boolean;
  paused: boolean;
  pendulumAngle: number;
  pendulumLength: number;
  radius: number;
  reset: boolean;
  setComponentForces: (val: IForce[]) => any;
  setDisplayXAcceleration: (val: number) => any;
  setDisplayXPosition: (val: number) => any;
  setDisplayXVelocity: (val: number) => any;
  setDisplayYAcceleration: (val: number) => any;
  setDisplayYPosition: (val: number) => any;
  setDisplayYVelocity: (val: number) => any;
  setPaused: (bool: boolean) => any;
  setPendulumAngle: (val: number) => any;
  setPendulumLength: (val: number) => any;
  setSketching: (val: boolean) => any;
  setSpringStartLength: (val: number) => any;
  setUpdatedForces: (val: IForce[]) => any;
  showAcceleration: boolean;
  showComponentForces: boolean;
  showForceMagnitudes: boolean;
  showForces: boolean;
  showVelocity: boolean;
  simulationSpeed: number;
  simulationType: string;
  springConstant: number;
  springRestLength: number;
  springStartLength: number;
  startForces: IForce[];
  startPendulumAngle: number;
  startPosX: number;
  startPosY: number;
  startVelX: number;
  startVelY: number;
  timestepSize: number;
  updateDisplay: { xDisplay: number; yDisplay: number };
  updatedForces: IForce[];
  wedgeHeight: number;
  wedgeWidth: number;
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
}

export const Weight = (props: IWeightProps) => {
  const {
    adjustPendulumAngle,
    circularMotionRadius,
    coefficientOfKineticFriction,
    color,
    componentForces,
    displayXVelocity,
    displayYVelocity,
    elasticCollisions,
    gravity,
    incrementTime,
    mass,
    mode,
    noMovement,
    paused,
    pendulumAngle,
    pendulumLength,
    radius,
    reset,
    setComponentForces,
    setDisplayXAcceleration,
    setDisplayXPosition,
    setDisplayXVelocity,
    setDisplayYAcceleration,
    setDisplayYPosition,
    setDisplayYVelocity,
    setPaused,
    setPendulumAngle,
    setPendulumLength,
    setSketching,
    setSpringStartLength,
    setUpdatedForces,
    showAcceleration,
    showComponentForces,
    showForceMagnitudes,
    showForces,
    showVelocity,
    simulationSpeed,
    simulationType,
    springConstant,
    springRestLength,
    springStartLength,
    startForces,
    startPendulumAngle,
    startPosX,
    startPosY,
    startVelX,
    startVelY,
    timestepSize,
    updateDisplay,
    updatedForces,
    wedgeHeight,
    wedgeWidth,
    xMax,
    xMin,
    yMax,
    yMin,
  } = props;

  // Constants
  const draggable =
    simulationType != "Inclined Plane" &&
    simulationType != "Pendulum" &&
    mode == "Freeform";
  const epsilon = 0.0001;
  const labelBackgroundColor = `rgba(255,255,255,0.5)`;

  // State hooks
  const [clickPositionX, setClickPositionX] = useState(0);
  const [clickPositionY, setClickPositionY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [kineticFriction, setKineticFriction] = useState(false);
  const [maxPosYConservation, setMaxPosYConservation] = useState(0);
  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);
  const [walls, setWalls] = useState<IWallProps[]>([]);
  const [xPosition, setXPosition] = useState(startPosX);
  const [xVelocity, setXVelocity] = useState(startVelX);
  const [yPosition, setYPosition] = useState(startPosY);
  const [yVelocity, setYVelocity] = useState(startVelY);
  const [coordinates, setCoordinates] = useState(""); // for wedge
  const [xAccel, setXAccel] = useState(0);
  const [yAccel, setYAccel] = useState(0);

  // Variables
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

  // Helper function to go between display and real values
  const getDisplayYPos = (yPos: number) => {
    return yMax - yPos - 2 * radius + 5;
  };
  const getYPosFromDisplay = (yDisplay: number) => {
    return yMax - yDisplay - 2 * radius + 5;
  };

  // Set display values based on real values
  const setYPosDisplay = (yPos: number) => {
    const displayPos = getDisplayYPos(yPos);
    setDisplayYPosition(Math.round(displayPos * 100) / 100);
  };
  const setXPosDisplay = (xPos: number) => {
    setDisplayXPosition(Math.round(xPos * 100) / 100);
  };
  const setYVelDisplay = (yVel: number) => {
    setDisplayYVelocity((-1 * Math.round(yVel * 100)) / 100);
  };
  const setXVelDisplay = (xVel: number) => {
    setDisplayXVelocity(Math.round(xVel * 100) / 100);
  };

  // Update display values when simulation updates
  const setDisplayValues = (
    xPos: number = xPosition,
    yPos: number = yPosition,
    xVel: number = xVelocity,
    yVel: number = yVelocity
  ) => {
    setYPosDisplay(yPos);
    setXPosDisplay(xPos);
    setYVelDisplay(yVel);
    setXVelDisplay(xVel);
    setDisplayYAcceleration(
      (-1 * Math.round(getNewAccelerationY(updatedForces) * 100)) / 100
    );
    setDisplayXAcceleration(
      Math.round(getNewAccelerationX(updatedForces) * 100) / 100
    );
    setXAccel(Math.round(getNewAccelerationX(updatedForces) * 100) / 100);
    setYAccel(
      (-1 * Math.round(getNewAccelerationY(updatedForces) * 100)) / 100
    );
  };

  // Reset simulation on reset button click
  const resetEverything = () => {
    setKineticFriction(false);
    setXPosition(updatedStartPosX);
    setYPosition(updatedStartPosY);
    setXVelocity(startVelX);
    setYVelocity(startVelY);
    setPendulumAngle(startPendulumAngle);
    setUpdatedForces(startForces);
    setDisplayXAcceleration(0);
    setDisplayYAcceleration(0);
    setYPosDisplay(updatedStartPosX);
    setXPosDisplay(updatedStartPosY);
    setYVelDisplay(startVelX);
    setXVelDisplay(startVelY);
    setYPosDisplay(updatedStartPosY);
    setXPosDisplay(updatedStartPosX);
    setYVelDisplay(startVelY);
    setXVelDisplay(startVelX);
  };

  // Compute x acceleration from forces, F=ma
  const getNewAccelerationX = (forceList: IForce[]) => {
    let newXAcc = 0;
    forceList.forEach((force) => {
      if (force.component == false) {
        newXAcc +=
          (force.magnitude *
            Math.cos((force.directionInDegrees * Math.PI) / 180)) /
          mass;
      }
    });
    return newXAcc;
  };

  // Compute y acceleration from forces, F=ma
  const getNewAccelerationY = (forceList: IForce[]) => {
    let newYAcc = 0;
    forceList.forEach((force) => {
      if (force.component == false) {
        newYAcc +=
          (-1 *
            (force.magnitude *
              Math.sin((force.directionInDegrees * Math.PI) / 180))) /
          mass;
      }
    });
    return newYAcc;
  };

  // Compute uniform circular motion forces given x, y positions
  const getNewCircularMotionForces = (xPos: number, yPos: number) => {
    let deltaX = (xMin + xMax) / 2 - (xPos + radius);
    let deltaY = yPos + radius - (yMin + yMax) / 2;
    let dir = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    const tensionForce: IForce = {
      description: "Centripetal Force",
      magnitude: (startVelX ** 2 * mass) / circularMotionRadius,
      directionInDegrees: dir,
      component: false,
    };
    return [tensionForce];
  };

  // Compute spring forces given y position
  const getNewSpringForces = (yPos: number) => {
    let springForce: IForce = {
      description: "Spring Force",
      magnitude: 0,
      directionInDegrees: 90,
      component: false,
    };
    if (yPos - springRestLength > 0) {
      springForce = {
        description: "Spring Force",
        magnitude: springConstant * (yPos - springRestLength),
        directionInDegrees: 90,
        component: false,
      };
    } else if (yPos - springRestLength < 0) {
      springForce = {
        description: "Spring Force",
        magnitude: springConstant * (springRestLength - yPos),
        directionInDegrees: 270,
        component: false,
      };
    }

    return [
      {
        description: "Gravity",
        magnitude: Math.abs(gravity) * mass,
        directionInDegrees: 270,
        component: false,
      },
      springForce,
    ];
  };

  // Compute pendulum forces given position, velocity
  const getNewPendulumForces = (
    xPos: number,
    yPos: number,
    xVel: number,
    yVel: number
  ) => {
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

    const mag =
      mass * Math.abs(gravity) * Math.cos((oppositeAngle * Math.PI) / 180) +
      (mass * (xVel * xVel + yVel * yVel)) / pendulumLength;

    const forceOfTension: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: angle,
      component: false,
    };

    return [
      {
        description: "Gravity",
        magnitude: Math.abs(gravity) * mass,
        directionInDegrees: 270,
        component: false,
      },
      forceOfTension,
    ];
  };

  // Check for collisions in x direction
  const checkForCollisionsWithWall = () => {
    let collision = false;
    const minX = xPosition;
    const maxX = xPosition + 2 * radius;
    if (xVelocity != 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 90) {
          const wallX = (wall.xPos / 100) * window.innerWidth;
          if (wall.xPos < 0.35) {
            if (minX <= wallX) {
              setXPosition(wallX + 0.01);
              if (elasticCollisions) {
                setXVelocity(-xVelocity);
              } else {
                setXVelocity(0);
              }
              collision = true;
            }
          } else {
            if (maxX >= wallX) {
              setXPosition(wallX - 2 * radius - 0.01);
              if (elasticCollisions) {
                setXVelocity(-xVelocity);
              } else {
                setXVelocity(0);
              }
              collision = true;
            }
          }
        }
      });
    }
    return collision;
  };

  // Check for collisions in y direction
  const checkForCollisionsWithGround = () => {
    let collision = false;
    const minY = yPosition;
    const maxY = yPosition + 2 * radius;
    if (yVelocity > 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 0 && wall.yPos > 0.4) {
          const groundY = (wall.yPos / 100) * window.innerHeight;
          if (maxY > groundY) {
            setYPosition(groundY - 2 * radius - 0.01);
            if (elasticCollisions) {
              setYVelocity(-yVelocity);
            } else {
              setYVelocity(0);
              if (simulationType != "Two Weights") {
                const forceOfGravity: IForce = {
                  description: "Gravity",
                  magnitude: Math.abs(gravity) * mass,
                  directionInDegrees: 270,
                  component: false,
                };
                const normalForce: IForce = {
                  description: "Normal force",
                  magnitude: Math.abs(gravity) * mass,
                  directionInDegrees: wall.angleInDegrees + 90,
                  component: false,
                };
                setUpdatedForces([forceOfGravity, normalForce]);
                if (simulationType == "Inclined Plane") {
                  const forceOfGravityC: IForce = {
                    description: "Gravity",
                    magnitude: Math.abs(gravity) * mass,
                    directionInDegrees: 270,
                    component: true,
                  };
                  const normalForceC: IForce = {
                    description: "Normal force",
                    magnitude: Math.abs(gravity) * mass,
                    directionInDegrees: wall.angleInDegrees + 90,
                    component: true,
                  };
                  setComponentForces([forceOfGravityC, normalForceC]);
                }
              }
            }
            collision = true;
          }
        }
      });
    }
    if (yVelocity < 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 0 && wall.yPos < 0.4) {
          const groundY = (wall.yPos / 100) * window.innerHeight;
          if (minY < groundY) {
            setYPosition(groundY + 5);
            if (elasticCollisions) {
              setYVelocity(-yVelocity);
            } else {
              setYVelocity(0);
            }
            collision = true;
          }
        }
      });
    }
    return collision;
  };

  // Called at each RK4 step
  const evaluate = (
    currentXPos: number,
    currentYPos: number,
    currentXVel: number,
    currentYVel: number,
    deltaXPos: number,
    deltaYPos: number,
    deltaXVel: number,
    deltaYVel: number,
    dt: number
  ) => {
    const newXPos = currentXPos + deltaXPos * dt;
    const newYPos = currentYPos + deltaYPos * dt;
    const newXVel = currentXVel + deltaXVel * dt;
    const newYVel = currentYVel + deltaYVel * dt;
    const newDeltaXPos = newXVel;
    const newDeltaYPos = newYVel;
    let forces = updatedForces;
    if (simulationType == "Pendulum") {
      forces = getNewPendulumForces(newXPos, newYPos, newXVel, newYVel);
    } else if (simulationType == "Spring") {
      forces = getNewSpringForces(newYPos);
    } else if (simulationType == "Circular Motion") {
      forces = getNewCircularMotionForces(newXPos, newYPos);
    }
    const newDeltaXVel = getNewAccelerationX(forces);
    const newDeltaYVel = getNewAccelerationY(forces);
    return {
      xPos: newXPos,
      yPos: newYPos,
      xVel: newXVel,
      yVel: newYVel,
      deltaXPos: newDeltaXPos,
      deltaYPos: newDeltaYPos,
      deltaXVel: newDeltaXVel,
      deltaYVel: newDeltaYVel,
    };
  };

  // Update position, velocity using RK4 method
  const update = () => {
    let startXVel = xVelocity;
    let startYVel = yVelocity;
    let xPos = xPosition;
    let yPos = yPosition;
    let xVel = xVelocity;
    let yVel = yVelocity;
    let forces = updatedForces;
    if (simulationType == "Pendulum") {
      forces = getNewPendulumForces(xPos, yPos, xVel, yVel);
    } else if (simulationType == "Spring") {
      forces = getNewSpringForces(yPos);
    } else if (simulationType == "Circular Motion") {
      forces = getNewCircularMotionForces(xPos, yPos);
    }
    const xAcc = getNewAccelerationX(forces);
    const yAcc = getNewAccelerationY(forces);
    for (let i = 0; i < simulationSpeed; i++) {
      const k1 = evaluate(xPos, yPos, xVel, yVel, xVel, yVel, xAcc, yAcc, 0);
      const k2 = evaluate(
        xPos,
        yPos,
        xVel,
        yVel,
        k1.deltaXPos,
        k1.deltaYPos,
        k1.deltaXVel,
        k1.deltaYVel,
        timestepSize * 0.5
      );
      const k3 = evaluate(
        xPos,
        yPos,
        xVel,
        yVel,
        k2.deltaXPos,
        k2.deltaYPos,
        k2.deltaXVel,
        k2.deltaYVel,
        timestepSize * 0.5
      );
      const k4 = evaluate(
        xPos,
        yPos,
        xVel,
        yVel,
        k3.deltaXPos,
        k3.deltaYPos,
        k3.deltaXVel,
        k3.deltaYVel,
        timestepSize
      );

      xVel +=
        ((timestepSize * 1.0) / 6.0) *
        (k1.deltaXVel + 2 * (k2.deltaXVel + k3.deltaXVel) + k4.deltaXVel);
      yVel +=
        ((timestepSize * 1.0) / 6.0) *
        (k1.deltaYVel + 2 * (k2.deltaYVel + k3.deltaYVel) + k4.deltaYVel);
      xPos +=
        ((timestepSize * 1.0) / 6.0) *
        (k1.deltaXPos + 2 * (k2.deltaXPos + k3.deltaXPos) + k4.deltaXPos);
      yPos +=
        ((timestepSize * 1.0) / 6.0) *
        (k1.deltaYPos + 2 * (k2.deltaYPos + k3.deltaYPos) + k4.deltaYPos);
    }
    // make sure harmonic motion maintained and errors don't propagate
    if (simulationType == "Spring") {
      if (startYVel < 0 && yVel > 0 && yPos < springRestLength) {
        let equilibriumPos =
          springRestLength + (mass * Math.abs(gravity)) / springConstant;
        let amplitude = Math.abs(equilibriumPos - springStartLength);
        yPos = equilibriumPos - amplitude;
      } else if (startYVel > 0 && yVel < 0 && yPos > springRestLength) {
        let equilibriumPos =
          springRestLength + (mass * Math.abs(gravity)) / springConstant;
        let amplitude = Math.abs(equilibriumPos - springStartLength);
        yPos = equilibriumPos + amplitude;
      }
    }
    if (simulationType == "Pendulum") {
      let startX = updatedStartPosX;
      if (startXVel <= 0 && xVel > 0) {
        xPos = updatedStartPosX;
        if (updatedStartPosX > xMax / 2) {
          xPos = xMax / 2 + (xMax / 2 - startX) - 2 * radius;
        }
        yPos = startPosY;
      } else if (startXVel >= 0 && xVel < 0) {
        xPos = updatedStartPosX;
        if (updatedStartPosX < xMax / 2) {
          xPos = xMax / 2 + (xMax / 2 - startX) - 2 * radius;
        }
        yPos = startPosY;
      }
    }
    if (simulationType == "One Weight") {
      if (yPos < maxPosYConservation) {
        yPos = maxPosYConservation;
      }
    }
    setXVelocity(xVel);
    setYVelocity(yVel);
    setXPosition(xPos);
    setYPosition(yPos);
    let forcesn = updatedForces;
    if (simulationType == "Pendulum") {
      forcesn = getNewPendulumForces(xPos, yPos, xVel, yVel);
    } else if (simulationType == "Spring") {
      forcesn = getNewSpringForces(yPos);
    } else if (simulationType == "Circular Motion") {
      forcesn = getNewCircularMotionForces(xPos, yPos);
    }
    setUpdatedForces(forcesn);

    // set component forces if they change
    if (simulationType == "Pendulum") {
      let x = xMax / 2 - xPos - radius;
      let y = yPos + radius + 5;
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
        mass * Math.abs(gravity) * Math.cos((oppositeAngle * Math.PI) / 180) +
        (mass * (xVel * xVel + yVel * yVel)) / pendulumLength;

      const tensionComponent: IForce = {
        description: "Tension",
        magnitude: mag,
        directionInDegrees: angle,
        component: true,
      };
      const gravityParallel: IForce = {
        description: "Gravity Parallel Component",
        magnitude: Math.abs(gravity) * Math.cos(((90 - angle) * Math.PI) / 180),
        directionInDegrees: 270 - (90 - angle),
        component: true,
      };
      const gravityPerpendicular: IForce = {
        description: "Gravity Perpendicular Component",
        magnitude: Math.abs(gravity) * Math.sin(((90 - angle) * Math.PI) / 180),
        directionInDegrees: -(90 - angle),
        component: true,
      };
      if (Math.abs(gravity) * Math.sin(((90 - angle) * Math.PI) / 180) < 0) {
        gravityPerpendicular.magnitude = Math.abs(
          Math.abs(gravity) * Math.sin(((90 - angle) * Math.PI) / 180)
        );
        gravityPerpendicular.directionInDegrees = 180 - (90 - angle);
      }
      setComponentForces([
        tensionComponent,
        gravityParallel,
        gravityPerpendicular,
      ]);
    }
  };

  // Change pendulum angle based on input field
  useEffect(() => {
    let length = adjustPendulumAngle.length;
    const x =
      length * Math.cos(((90 - adjustPendulumAngle.angle) * Math.PI) / 180);
    const y =
      length * Math.sin(((90 - adjustPendulumAngle.angle) * Math.PI) / 180);
    const xPos = xMax / 2 - x - radius;
    const yPos = y - radius - 5;
    setXPosition(xPos);
    setYPosition(yPos);
    setUpdatedStartPosX(xPos);
    setUpdatedStartPosY(yPos);
    setPendulumAngle(adjustPendulumAngle.angle);
    setPendulumLength(adjustPendulumAngle.length);
  }, [adjustPendulumAngle]);

  // When display values updated by user, update real values
  useEffect(() => {
    if (updateDisplay.xDisplay != xPosition) {
      let x = updateDisplay.xDisplay;
      x = Math.max(0, x);
      x = Math.min(x, xMax - 2 * radius);
      setUpdatedStartPosX(x);
      setXPosition(x);
      setDisplayXPosition(x);
    }

    if (updateDisplay.yDisplay != getDisplayYPos(yPosition)) {
      let y = updateDisplay.yDisplay;
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

  // Prevent bug when switching between sims
  useEffect(() => {
    setXVelocity(startVelX);
    setYVelocity(startVelY);
    setDisplayValues();
  }, [startForces]);

  // Make sure weight doesn't go above max height
  useEffect(() => {
    if (simulationType == "One Weight") {
      let maxYPos = updatedStartPosY;
      if (startVelY != 0) {
        maxYPos -= (startVelY * startVelY) / (2 * Math.abs(gravity));
      }
      if (maxYPos < 0) {
        maxYPos = 0;
      }
      setMaxPosYConservation(maxYPos);
    }
  }, [updatedStartPosY, startVelY]);

  // Check for collisions and update
  useEffect(() => {
    if (!paused && !noMovement) {
      let collisions = false;
      if (
        simulationType == "One Weight" ||
        simulationType == "Inclined Plane"
      ) {
        const collisionsWithGround = checkForCollisionsWithGround();
        const collisionsWithWalls = checkForCollisionsWithWall();
        collisions = collisionsWithGround || collisionsWithWalls;
      }
      if (simulationType == "Pulley") {
        if (yPosition <= yMin + 100 || yPosition >= yMax - 100) {
          collisions = true;
        }
      }
      if (!collisions) {
        update();
      }
      setDisplayValues();
    }
  }, [incrementTime]);

  // Reset everything on reset button click
  useEffect(() => {
    resetEverything();
  }, [reset]);

  // Convert from static to kinetic friction if/when weight slips on inclined plane
  useEffect(() => {
    if (
      simulationType == "Inclined Plane" &&
      Math.abs(xVelocity) > 0.1 &&
      mode != "Review" &&
      !kineticFriction
    ) {
      setKineticFriction(true);
      //switch from static to kinetic friction
      const normalForce: IForce = {
        description: "Normal Force",
        magnitude:
          mass *
          Math.abs(gravity) *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - 90 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: false,
      };
      let frictionForce: IForce = {
        description: "Kinetic Friction Force",
        magnitude:
          mass *
          coefficientOfKineticFriction *
          Math.abs(gravity) *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: false,
      };
      // reduce magnitude of friction force if necessary such that block cannot slide up plane
      let yForce = -Math.abs(gravity);
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
            Math.abs(gravity)) /
          Math.sin((frictionForce.directionInDegrees * Math.PI) / 180);
      }

      const frictionForceComponent: IForce = {
        description: "Kinetic Friction Force",

        magnitude:
          mass *
          coefficientOfKineticFriction *
          Math.abs(gravity) *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      const normalForceComponent: IForce = {
        description: "Normal Force",
        magnitude:
          mass *
          Math.abs(gravity) *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - 90 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      const gravityParallel: IForce = {
        description: "Gravity Parallel Component",
        magnitude:
          mass *
          Math.abs(gravity) *
          Math.sin(Math.PI / 2 - Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 -
          90 -
          (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI +
          180,
        component: true,
      };
      const gravityPerpendicular: IForce = {
        description: "Gravity Perpendicular Component",
        magnitude:
          mass *
          Math.abs(gravity) *
          Math.cos(Math.PI / 2 - Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          360 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      const gravityForce: IForce = {
        description: "Gravity",
        magnitude: mass * Math.abs(gravity),
        directionInDegrees: 270,
        component: false,
      };
      if (coefficientOfKineticFriction != 0) {
        setUpdatedForces([gravityForce, normalForce, frictionForce]);
        setComponentForces([
          frictionForceComponent,
          normalForceComponent,
          gravityParallel,
          gravityPerpendicular,
        ]);
      } else {
        setUpdatedForces([gravityForce, normalForce]);
        setComponentForces([
          normalForceComponent,
          gravityParallel,
          gravityPerpendicular,
        ]);
      }
    }
  }, [xVelocity]);

  // Add/remove walls when simulation type changes
  useEffect(() => {
    let w: IWallProps[] = [];
    if (simulationType == "One Weight" || simulationType == "Inclined Plane") {
      w.push({ length: 70, xPos: 0, yPos: 0, angleInDegrees: 0 });
      w.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
      w.push({ length: 80, xPos: 0, yPos: 0, angleInDegrees: 90 });
      w.push({ length: 80, xPos: 69.5, yPos: 0, angleInDegrees: 90 });
    }
    setWalls(w);
  }, [simulationType]);

  // Update x position when start pos x changes
  useEffect(() => {
    if (paused) {
      setUpdatedStartPosX(startPosX);
      setXPosition(startPosX);
      setXPosDisplay(startPosX);
    }
  }, [startPosX]);

  // Update y position when start pos y changes
  useEffect(() => {
    if (paused) {
      setUpdatedStartPosY(startPosY);
      setYPosition(startPosY);
      setYPosDisplay(startPosY);
    }
  }, [startPosY]);

  // Update wedge coordinates
  useEffect(() => {
    const left = xMax * 0.5 - 200;
    const coordinatePair1 = Math.round(left) + "," + yMax + " ";
    const coordinatePair2 = Math.round(left + wedgeWidth) + "," + yMax + " ";
    const coordinatePair3 = Math.round(left) + "," + (yMax - wedgeHeight);
    const coord = coordinatePair1 + coordinatePair2 + coordinatePair3;
    setCoordinates(coord);
  }, [wedgeWidth, wedgeHeight]);

  // Render weight, spring, rod(s), vectors
  return (
    <div style={{ zIndex: -1000 }}>
      <div
        className="weightContainer"
        onPointerDown={(e) => {
          if (draggable) {
            e.preventDefault();
            setPaused(true);
            setDragging(true);
            setClickPositionX(e.clientX);
            setClickPositionY(e.clientY);
          } else if (mode == "Review") {
            setSketching(true);
          }
        }}
        onPointerMove={(e) => {
          e.preventDefault();
          if (dragging) {
            let newY = yPosition + e.clientY - clickPositionY;
            if (newY > yMax - 2 * radius - 10) {
              newY = yMax - 2 * radius - 10;
            } else if (newY < 10) {
              newY = 10;
            }

            let newX = xPosition + e.clientX - clickPositionX;
            if (newX > xMax - 2 * radius - 10) {
              newX = xMax - 2 * radius - 10;
            } else if (newX < 10) {
              newX = 10;
            }
            if (simulationType == "Suspension") {
              if (newX < (xMax + xMin) / 4 - radius - 15) {
                newX = (xMax + xMin) / 4 - radius - 15;
              } else if (newX > (3 * (xMax + xMin)) / 4 - radius / 2 - 15) {
                newX = (3 * (xMax + xMin)) / 4 - radius / 2 - 15;
              }
            }

            setYPosition(newY);
            setDisplayYPosition(
              Math.round((yMax - 2 * radius - newY + 5) * 100) / 100
            );
            if (simulationType != "Pulley") {
              setXPosition(newX);
              setDisplayXPosition(newX);
            }
            if (simulationType != "Suspension") {
              if (simulationType != "Pulley") {
                setUpdatedStartPosX(newX);
              }
              setUpdatedStartPosY(newY);
            }
            setClickPositionX(e.clientX);
            setClickPositionY(e.clientY);
            setDisplayValues();
          }
        }}
        onPointerUp={(e) => {
          if (dragging) {
            e.preventDefault();
            if (
              simulationType != "Pendulum" &&
              simulationType != "Suspension"
            ) {
              resetEverything();
            }
            setDragging(false);
            let newY = yPosition + e.clientY - clickPositionY;
            if (newY > yMax - 2 * radius - 10) {
              newY = yMax - 2 * radius - 10;
            } else if (newY < 10) {
              newY = 10;
            }

            let newX = xPosition + e.clientX - clickPositionX;
            if (newX > xMax - 2 * radius - 10) {
              newX = xMax - 2 * radius - 10;
            } else if (newX < 10) {
              newX = 10;
            }
            if (simulationType == "Spring") {
              setSpringStartLength(newY);
            }
            if (simulationType == "Suspension") {
              let x1rod = (xMax + xMin) / 2 - radius - yMin - 200;
              let x2rod = (xMax + xMin) / 2 + yMin + 200 + radius;
              let deltaX1 = xPosition + radius - x1rod;
              let deltaX2 = x2rod - (xPosition + radius);
              let deltaY = yPosition + radius;
              let dir1T = Math.PI - Math.atan(deltaY / deltaX1);
              let dir2T = Math.atan(deltaY / deltaX2);
              let tensionMag2 =
                (mass * Math.abs(gravity)) /
                ((-Math.cos(dir2T) / Math.cos(dir1T)) * Math.sin(dir1T) +
                  Math.sin(dir2T));
              let tensionMag1 =
                (-tensionMag2 * Math.cos(dir2T)) / Math.cos(dir1T);
              dir1T = (dir1T * 180) / Math.PI;
              dir2T = (dir2T * 180) / Math.PI;
              const tensionForce1: IForce = {
                description: "Tension",
                magnitude: tensionMag1,
                directionInDegrees: dir1T,
                component: false,
              };
              const tensionForce2: IForce = {
                description: "Tension",
                magnitude: tensionMag2,
                directionInDegrees: dir2T,
                component: false,
              };
              const grav: IForce = {
                description: "Gravity",
                magnitude: mass * Math.abs(gravity),
                directionInDegrees: 270,
                component: false,
              };
              setUpdatedForces([tensionForce1, tensionForce2, grav]);
            }
          }
        }}
      >
        <div className="weight" style={weightStyle}>
          <p className="weightLabel">{mass} kg</p>
        </div>
      </div>
      {simulationType == "Spring" && (
        <div
          className="spring"
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: -2,
          }}
        >
          <svg width={xMax + "px"} height={window.innerHeight + "px"}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => {
              const count = 10;
              let xPos1;
              let yPos1;
              let xPos2;
              let yPos2;
              if (val % 2 == 0) {
                xPos1 = xPosition + radius - 20;
                xPos2 = xPosition + radius + 20;
              } else {
                xPos1 = xPosition + radius + 20;
                xPos2 = xPosition + radius - 20;
              }
              yPos1 = (val * yPosition) / count;
              yPos2 = ((val + 1) * yPosition) / count;
              return (
                <line
                  key={val}
                  x1={xPos1}
                  y1={yPos1}
                  x2={xPos2}
                  y2={yPos2}
                  stroke={"#808080"}
                  strokeWidth="10"
                />
              );
            })}
          </svg>
        </div>
      )}
      {simulationType == "Pulley" && (
        <div
          className="wheel"
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: -1,
          }}
        >
          <svg width={xMax + "px"} height={window.innerHeight + "px"}>
            <circle
              cx={(xMax + xMin) / 2}
              cy={radius}
              r={radius * 1.5}
              fill={"#808080"}
            />
          </svg>
        </div>
      )}
      {simulationType == "Pulley" && (
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
              x2={xPosition + radius}
              y2={yMin}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>
        </div>
      )}
      {simulationType == "Suspension" && (
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
              x2={(xMax + xMin) / 2 - radius - yMin - 200}
              y2={yMin}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>
          <p
            style={{
              position: "absolute",
              zIndex: 10,
              left: (xMax + xMin) / 2 - radius - yMin - 200 + 80 + "px",
              top: 10 + "px",
              backgroundColor: labelBackgroundColor,
            }}
          >
            {Math.round(
              ((Math.atan(
                (yPosition + radius) /
                  (xPosition +
                    radius -
                    ((xMax + xMin) / 2 - radius - yMin - 200))
              ) *
                180) /
                Math.PI) *
                100
            ) / 100}
            °
          </p>
        </div>
      )}
      {simulationType == "Suspension" && (
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
              x2={(xMax + xMin) / 2 + yMin + 200 + radius}
              y2={yMin}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>

          <p
            style={{
              position: "absolute",
              zIndex: 10,
              left: (xMax + xMin) / 2 + yMin + 200 + radius - 80 + "px",
              top: 10 + "px",
              backgroundColor: labelBackgroundColor,
            }}
          >
            {Math.round(
              ((Math.atan(
                (yPosition + radius) /
                  ((xMax + xMin) / 2 +
                    yMin +
                    200 +
                    radius -
                    (xPosition + radius))
              ) *
                180) /
                Math.PI) *
                100
            ) / 100}
            °
          </p>
        </div>
      )}
      {simulationType == "Circular Motion" && (
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
              x2={(xMin + xMax) / 2}
              y2={(yMin + yMax) / 2}
              stroke={"#deb887"}
              strokeWidth="10"
            />
          </svg>
        </div>
      )}
      {simulationType == "Pendulum" && (
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
                  backgroundColor: labelBackgroundColor,
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
                  backgroundColor: labelBackgroundColor,
                }}
              >
                {Math.round(pendulumAngle * 100) / 100}°
              </p>
            </div>
          )}
        </div>
      )}
      {simulationType == "Inclined Plane" && (
        <div>
          <div
            style={{ position: "absolute", left: "0", top: "0", zIndex: -5 }}
          >
            <svg width={xMax + "px"} height={yMax + "px"}>
              <polygon points={coordinates} style={{ fill: "burlywood" }} />
            </svg>
          </div>

          <p
            style={{
              position: "absolute",
              zIndex: 500,
              left: Math.round(xMax * 0.5 - 200 + wedgeWidth - 80) + "px",
              top: Math.round(window.innerHeight * 0.8 - 40) + "px",
            }}
          >
            {Math.round(
              ((Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI) * 100
            ) / 100}
            °
          </p>
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
                x2={xPosition + radius + getNewAccelerationX(updatedForces) * 7}
                y2={yPosition + radius + getNewAccelerationY(updatedForces) * 7}
                stroke={"green"}
                strokeWidth="5"
                markerEnd="url(#accArrow)"
              />
            </svg>
            <div
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: xPosition + radius + xAccel * 3 + 25 + "px",
                top: yPosition + radius + yAccel * 3 + 70 + "px",
                zIndex: -1,
                lineHeight: 0.5,
              }}
            >
              <p>
                {Math.round(
                  100 * Math.sqrt(xAccel * xAccel + yAccel * yAccel)
                ) / 100}{" "}
                m/s
                <sup>2</sup>
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
                  100 *
                    Math.sqrt(
                      displayXVelocity * displayXVelocity +
                        displayYVelocity * displayYVelocity
                    )
                ) / 100}{" "}
                m/s
              </p>
            </div>
          </div>
        </div>
      )}
      {!dragging &&
        showComponentForces &&
        componentForces.map((force, index) => {
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
          if (force.directionInDegrees > 90 && force.directionInDegrees < 270) {
            labelLeft -= 120;
          } else {
            labelLeft += 30;
          }
          if (force.directionInDegrees >= 0 && force.directionInDegrees < 180) {
            labelTop += 40;
          } else {
            labelTop -= 40;
          }
          labelTop = Math.min(labelTop, yMax + 50);
          labelTop = Math.max(labelTop, yMin);
          labelLeft = Math.min(labelLeft, xMax - 60);
          labelLeft = Math.max(labelLeft, xMin);

          return (
            <div key={index}>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: -1,
                  left: xMin,
                  top: yMin,
                }}
              >
                <svg
                  width={xMax - xMin + "px"}
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
                  {force.component == true && (
                    <line
                      x1={arrowStartX}
                      y1={arrowStartY}
                      x2={arrowEndX}
                      y2={arrowEndY}
                      stroke={color}
                      strokeWidth="5"
                      strokeDasharray="10,10"
                      markerEnd="url(#forceArrow)"
                    />
                  )}
                  {force.component == false && (
                    <line
                      x1={arrowStartX}
                      y1={arrowStartY}
                      x2={arrowEndX}
                      y2={arrowEndY}
                      stroke={color}
                      strokeWidth="5"
                      markerEnd="url(#forceArrow)"
                    />
                  )}
                </svg>
              </div>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: labelLeft + "px",
                  top: labelTop + "px",
                  // zIndex: -1,
                  lineHeight: 0.5,
                  backgroundColor: labelBackgroundColor,
                }}
              >
                {force.description && <p>{force.description}</p>}
                {!force.description && <p>Force</p>}
                {showForceMagnitudes && (
                  <p>{Math.round(100 * force.magnitude) / 100} N</p>
                )}
              </div>
            </div>
          );
        })}
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
          if (force.directionInDegrees > 90 && force.directionInDegrees < 270) {
            labelLeft -= 120;
          } else {
            labelLeft += 30;
          }
          if (force.directionInDegrees >= 0 && force.directionInDegrees < 180) {
            labelTop += 40;
          } else {
            labelTop -= 40;
          }
          labelTop = Math.min(labelTop, yMax + 50);
          labelTop = Math.max(labelTop, yMin);
          labelLeft = Math.min(labelLeft, xMax - 60);
          labelLeft = Math.max(labelLeft, xMin);

          return (
            <div key={index}>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: -1,
                  left: xMin,
                  top: yMin,
                }}
              >
                <svg
                  width={xMax - xMin + "px"}
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
                  {force.component == true && (
                    <line
                      x1={arrowStartX}
                      y1={arrowStartY}
                      x2={arrowEndX}
                      y2={arrowEndY}
                      stroke={color}
                      strokeWidth="5"
                      strokeDasharray="10,10"
                      markerEnd="url(#forceArrow)"
                    />
                  )}
                  {force.component == false && (
                    <line
                      x1={arrowStartX}
                      y1={arrowStartY}
                      x2={arrowEndX}
                      y2={arrowEndY}
                      stroke={color}
                      strokeWidth="5"
                      markerEnd="url(#forceArrow)"
                    />
                  )}
                </svg>
              </div>
              <div
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: labelLeft + "px",
                  top: labelTop + "px",
                  lineHeight: 0.5,
                  backgroundColor: labelBackgroundColor,
                }}
              >
                {force.description && <p>{force.description}</p>}
                {!force.description && <p>Force</p>}
                {showForceMagnitudes && (
                  <p>{Math.round(100 * force.magnitude) / 100} N</p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
