import { useEffect, useState } from "react";
import { IWallProps } from "./Wall";
import "./Weight.scss";
import { Wedge } from "./Wedge";
import { Speed } from "@mui/icons-material";

export interface IForce {
  description: string;
  magnitude: number;
  directionInDegrees: number;
  component: boolean;
}
export interface IWeightProps {
  adjustPendulumAngle: { angle: number; length: number };
  coefficientOfKineticFriction: number;
  collider?: {
    xPos: number;
    yPos: number;
    radius: number;
    xVel: number;
    yVel: number;
    mass: number;
  };
  collisionHappened: boolean;
  color: string;
  componentForces: IForce[];
  displayXPosition: number;
  displayXVelocity: number;
  displayYPosition: number;
  displayYVelocity: number;
  elasticCollisions: boolean;
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
  setStartPendulumAngle: (val: number) => any;
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
  startVelX?: number;
  startVelY?: number;
  timestepSize: number;
  updateDisplay: { xDisplay: number; yDisplay: number };
  updatedForces: IForce[];
  walls: IWallProps[];
  wedgeHeight: number;
  wedgeWidth: number;
}

export const Weight = (props: IWeightProps) => {
  const {
    adjustPendulumAngle,
    coefficientOfKineticFriction,
    collider,
    collisionHappened,
    color,
    componentForces,
    displayXPosition,
    displayXVelocity,
    displayYPosition,
    displayYVelocity,
    elasticCollisions,
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
    setStartPendulumAngle,
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
    walls,
    wedgeHeight,
    wedgeWidth,
  } = props;

  // Constants
  const draggable = simulationType != "Inclined Plane" && mode == "Freeform";
  const epsilon = 0.0001;

  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: mass * 9.81,
    directionInDegrees: 270,
    component: false,
  };
  const xMax = window.innerWidth * 0.7;
  const xMin = 0;
  const yMax = window.innerHeight * 0.8;
  const yMin = 0;

  // State hooks
  const [dragging, setDragging] = useState(false);
  const [kineticFriction, setKineticFriction] = useState(false);
  const [updatedStartPosX, setUpdatedStartPosX] = useState(startPosX);
  const [updatedStartPosY, setUpdatedStartPosY] = useState(startPosY);
  const [xPosition, setXPosition] = useState(startPosX);
  const [xVelocity, setXVelocity] = useState(startVelX ?? 0);
  const [yPosition, setYPosition] = useState(startPosY);
  const [yVelocity, setYVelocity] = useState(startVelY ?? 0);

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
  };

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

  // Check for collisions and update
  useEffect(() => {
    if (!paused && !noMovement) {
      console.log("before update", yPosition);
      let collisions = false;
      if (simulationType != "Pendulum" && simulationType != "Spring") {
        const collisionsWithGround = checkForCollisionsWithGround();
        const collisionsWithWalls = checkForCollisionsWithWall();
        collisions = collisionsWithGround || collisionsWithWalls;
        if (simulationType == "Two Weights" && collider != undefined) {
          collisions = collisions || checkForCollisionsWithCollider();
        }
      }
      if (!collisions) {
        update();
      }
      setDisplayValues();
      console.log("after update", yPosition);
    }
  }, [incrementTime]);

  useEffect(() => {
    resetEverything();
  }, [reset]);

  useEffect(() => {
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setDisplayValues();
  }, [startForces]);

  const resetEverything = () => {
    setKineticFriction(false);
    setXPosition(updatedStartPosX);
    setYPosition(updatedStartPosY);
    setXVelocity(startVelX ?? 0);
    setYVelocity(startVelY ?? 0);
    setUpdatedForces(startForces);
    setDisplayValues(
      updatedStartPosX,
      updatedStartPosY,
      startVelX ?? 0,
      startVelY ?? 0
    );
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

    return [forceOfGravity, springForce];
  };

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
      mass * 9.81 * Math.cos((oppositeAngle * Math.PI) / 180) +
      (mass * (xVel * xVel + yVel * yVel)) / pendulumLength;

    const forceOfTension: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: angle,
      component: false,
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
              setXPosition(wallX + 6);
              if (elasticCollisions) {
                setXVelocity(-xVelocity);
              } else {
                setXVelocity(0);
              }
              collision = true;
            }
          } else {
            if (maxX >= wallX) {
              setXPosition(wallX - 2 * radius - 1);
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

  const checkForCollisionsWithCollider = () => {
    let collision = false;
    if (collider == undefined) {
      return false;
    }
    if (
      yVelocity != 0 ||
      xVelocity != 0 ||
      collider.xVel != 0 ||
      collider.yVel != 0
    ) {
      // get distance between circle centers
      let centerX = xPosition + radius;
      let centerY = yPosition + radius;
      let colliderCenterX = collider.xPos + collider.radius;
      let colliderCenterY = collider.yPos + collider.radius;
      let squaredDistance =
        Math.abs(colliderCenterX - centerX) ** 2 +
        Math.abs(colliderCenterY - centerY) ** 2;
      if (squaredDistance <= (radius + collider.radius) ** 2) {
        //collision has occurred
        collision = true;
        if (elasticCollisions) {
          let v1 = Math.sqrt(yVelocity ** 2 + xVelocity ** 2);
          let v2 = Math.sqrt(collider.yVel ** 2 + collider.xVel ** 2);
          if (Math.abs(v1) < epsilon) {
            v1 = 0;
          }
          if (Math.abs(v2) < epsilon) {
            v2 = 0;
          }

          let velTheta1 = v1 == 0 ? 0 : Math.atan(-yVelocity / xVelocity);
          if (v1 != 0 && colliderCenterX < centerX) {
            velTheta1 += Math.PI;
          }
          if (velTheta1 < 0) {
            velTheta1 += 2 * Math.PI;
          }
          let velTheta2 =
            v2 == 0 ? 0 : Math.atan(-collider.yVel / collider.xVel);
          if (colliderCenterX > centerX) {
            velTheta2 += Math.PI;
          }
          if (velTheta2 < 0) {
            velTheta2 += 2 * Math.PI;
          }
          let collisionAngle =
            centerX == colliderCenterX
              ? 0
              : Math.atan(
                  Math.abs(
                    (centerY - colliderCenterY) / (centerX - colliderCenterX)
                  )
                );
          if (centerX > colliderCenterX && centerY > colliderCenterY) {
            collisionAngle += Math.PI / 2;
          } else if (centerX > colliderCenterX && centerY < colliderCenterY) {
            collisionAngle += Math.PI;
          } else if (centerX < colliderCenterX && centerY < colliderCenterY) {
            collisionAngle += (3 * Math.PI) / 2;
          }
          let v1x = 0;
          let v1y = 0;
          let v2x = 0;
          let v2y = 0;
          let handled = false;

          // Handle head on collisions where one weight at rest, masses the same
          if (centerX == colliderCenterX || centerY == colliderCenterY) {
            if (v1 == 0 && Math.abs(velTheta1 - collisionAngle) < epsilon) {
              v1x = collider.xVel;
              v1y = collider.yVel;
              v2x = 0;
              v2y = 0;
              handled = true;
            }
          } else {
            if (centerY > colliderCenterY) {
              if (
                v1 == 0 &&
                Math.abs(
                  velTheta2 - ((collisionAngle + Math.PI) % (2 * Math.PI))
                ) < epsilon
              ) {
                v1x = 0;
                v1y = 0;
                v1x = collider.xVel;
                v1y = collider.yVel;
                handled = true;
              }
            } else {
              if (
                v1 == 0 &&
                Math.abs(
                  velTheta2 - ((collisionAngle + Math.PI) % (2 * Math.PI))
                ) < epsilon
              ) {
                v1x = collider.xVel;
                v1y = collider.yVel;
                v2x = 0;
                v2y = 0;
                handled = true;
              }
            }
          }
          if (v2 == 0 && Math.abs(velTheta1 - collisionAngle) < epsilon) {
            v1x = 0;
            v1y = 0;
            v2x = xVelocity;
            v2y = yVelocity;
            handled = true;
          }

          // todo Handle head on collisions where neither weight at rest, masses the same

          // Handle glancing collisions where one weight at rest, masses the same -- works for weight coming from top left
          if (!handled) {
            let restWeightFinalAngle = collisionAngle - Math.PI / 2;
            if (v1 == 0) {
              let alpha = restWeightFinalAngle - velTheta2;
              let restWeightFinalVelocity = v2 * Math.tan(alpha);
              v1x = restWeightFinalVelocity * Math.cos(restWeightFinalAngle);
              v1y = restWeightFinalVelocity * Math.sin(restWeightFinalAngle);
              console.log(color, "rest weight", restWeightFinalAngle, v1x, v1y);
            }
            if (v2 == 0) {
              let alpha = collisionAngle - velTheta1;
              let movingWeightFinalAngle = collisionAngle + Math.PI;
              let movingWeightFinalVelocity = v1 * Math.sin(alpha);
              v1x =
                movingWeightFinalVelocity * Math.cos(movingWeightFinalAngle);
              v1y =
                movingWeightFinalVelocity * Math.sin(movingWeightFinalAngle);
              console.log(
                color,
                "moving weight",
                movingWeightFinalAngle,
                collisionAngle,
                velTheta1,
                alpha,
                v1x,
                v1y
              );
            }
          }

          setXVelocity(v1x);
          setYVelocity(v1y);
          if (Math.abs(v1x) > epsilon) {
            setXPosition(xPosition + (20 * v1x) / Math.abs(v1x));
          }
          if (Math.abs(v1y) > epsilon) {
            setYPosition(yPosition + (20 * v1y) / Math.abs(v1y));
          }
          collision = true;
        } else {
          // todo handle inelastic collision
        }
      }
    }
    return collision;
  };

  const checkForCollisionsWithGround = () => {
    let collision = false;
    const minY = yPosition;
    const maxY = yPosition + 2 * radius;
    if (yVelocity > 0) {
      walls.forEach((wall) => {
        if (wall.angleInDegrees == 0 && wall.yPos > 0.4) {
          const groundY = (wall.yPos / 100) * window.innerHeight;
          if (maxY >= groundY) {
            setYPosition(groundY - 2 * radius - 1);
            if (elasticCollisions) {
              setYVelocity(-yVelocity);
            } else {
              setYVelocity(0);
              if (simulationType != "Two Weights") {
                const forceOfGravity: IForce = {
                  description: "Gravity",
                  magnitude: 9.81 * mass,
                  directionInDegrees: 270,
                  component: false,
                };
                const normalForce: IForce = {
                  description: "Normal force",
                  magnitude: 9.81 * mass,
                  directionInDegrees: wall.angleInDegrees + 90,
                  component: false,
                };
                setUpdatedForces([forceOfGravity, normalForce]);
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
          if (minY <= groundY) {
            setYPosition(groundY + 6);
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
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - 90 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: false,
      };
      let frictionForce: IForce = {
        description: "Kinetic Friction Force",
        magnitude:
          coefficientOfKineticFriction *
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: false,
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

      const frictionForceComponent: IForce = {
        description: "Kinetic Friction Force",

        magnitude:
          coefficientOfKineticFriction *
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      const normalForceComponent: IForce = {
        description: "Normal Force",
        magnitude:
          forceOfGravity.magnitude *
          Math.cos(Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          180 - 90 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      const gravityParallel: IForce = {
        description: "Gravity Parallel Component",
        magnitude:
          forceOfGravity.magnitude *
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
          forceOfGravity.magnitude *
          Math.cos(Math.PI / 2 - Math.atan(wedgeHeight / wedgeWidth)),
        directionInDegrees:
          360 - (Math.atan(wedgeHeight / wedgeWidth) * 180) / Math.PI,
        component: true,
      };
      if (coefficientOfKineticFriction != 0) {
        setUpdatedForces([forceOfGravity, normalForce, frictionForce]);
        setComponentForces([
          frictionForceComponent,
          normalForceComponent,
          gravityParallel,
          gravityPerpendicular,
        ]);
      } else {
        setUpdatedForces([forceOfGravity, normalForce]);
        setComponentForces([
          normalForceComponent,
          gravityParallel,
          gravityPerpendicular,
        ]);
      }
    }
  }, [xVelocity]);

  const update = () => {
    // RK4 update
    let startYVel = yVelocity;
    let startXVel = xVelocity;
    let xPos = xPosition;
    let yPos = yPosition;
    let xVel = xVelocity;
    let yVel = yVelocity;
    for (let i = 0; i < simulationSpeed; i++) {
      let forces1 = updatedForces;
      if (simulationType == "Pendulum") {
        forces1 = getNewPendulumForces(xPos, yPos, xVel, yVel);
      } else if (simulationType == "Spring") {
        forces1 = getNewSpringForces(yPos);
      }
      const xAcc1 = getNewAccelerationX(forces1);
      const yAcc1 = getNewAccelerationY(forces1);
      const xVel1 = getNewVelocity(xVel, xAcc1);
      const yVel1 = getNewVelocity(yVel, yAcc1);

      let xVel2 = getNewVelocity(xVel, xAcc1 / 2);
      let yVel2 = getNewVelocity(yVel, yAcc1 / 2);
      let xPos2 = getNewPosition(xPos, xVel1 / 2);
      let yPos2 = getNewPosition(yPos, yVel1 / 2);
      let forces2 = updatedForces;
      if (simulationType == "Pendulum") {
        forces2 = getNewPendulumForces(xPos2, yPos2, xVel2, yVel2);
      } else if (simulationType == "Spring") {
        forces2 = getNewSpringForces(yPos2);
      }
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
      let forces3 = updatedForces;
      if (simulationType == "Pendulum") {
        forces3 = getNewPendulumForces(xPos3, yPos3, xVel3, yVel3);
      } else if (simulationType == "Spring") {
        forces3 = getNewSpringForces(yPos3);
      }
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
      let forces4 = updatedForces;
      if (simulationType == "Pendulum") {
        forces4 = getNewPendulumForces(xPos4, yPos4, xVel4, yVel4);
      } else if (simulationType == "Spring") {
        forces4 = getNewSpringForces(yPos4);
      }
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
    // no damping
    if (simulationType == "Spring") {
      if (startYVel < 0 && yVel > 0 && yPos < springRestLength) {
        let equilibriumPos = springRestLength + (mass * 9.81) / springConstant;
        let amplitude = Math.abs(equilibriumPos - springStartLength);
        yPos = equilibriumPos - amplitude;
      } else if (startYVel > 0 && yVel < 0 && yPos > springRestLength) {
        let equilibriumPos = springRestLength + (mass * 9.81) / springConstant;
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
    setXVelocity(xVel);
    setYVelocity(yVel);
    setXPosition(xPos);
    setYPosition(yPos);
    let forces = updatedForces;
    if (simulationType == "Pendulum") {
      forces = getNewPendulumForces(xPos, yPos, xVel, yVel);
    } else if (simulationType == "Spring") {
      forces = getNewSpringForces(yPos);
    }
    setUpdatedForces(forces);
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
  const labelBackgroundColor = `rgba(255,255,255,0.5)`;

  // Update x start position
  useEffect(() => {
    if (paused) {
      setUpdatedStartPosX(startPosX);
      setXPosition(startPosX);
      setXPosDisplay(startPosX);
    }
  }, [startPosX]);

  // Update y start position
  useEffect(() => {
    if (paused) {
      setUpdatedStartPosY(startPosY);
      setYPosition(startPosY);
      setYPosDisplay(startPosY);
      console.log("update start pos y", startPosY);
    }
  }, [startPosY]);

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
            if (simulationType != "Pendulum") {
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
            if (simulationType == "Pendulum") {
              const x = xMax / 2 - newX - radius;
              const y = newY + radius + 5;
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
              setPendulumLength(pendulumLength);
              const mag = 9.81 * Math.cos((oppositeAngle * Math.PI) / 180);
              const forceOfTension: IForce = {
                description: "Tension",
                magnitude: mag,
                directionInDegrees: angle,
                component: false,
              };

              setKineticFriction(false);
              setXVelocity(startVelX ?? 0);
              setYVelocity(startVelY ?? 0);
              setDisplayValues();
              setUpdatedForces([forceOfGravity, forceOfTension]);
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
            {/* <div
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
                      Math.pow(getNewAccelerationX(updatedForces), 2) +
                        Math.pow(getNewAccelerationY(updatedForces), 2)
                    )
                ) / 100}{" "}
                m/s<sup>2</sup>
              </p>
            </div> */}
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
            {/* <div
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
            </div> */}
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
    </div>
  );
};
