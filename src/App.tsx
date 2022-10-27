import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { Weight, IForce } from "./Weight";
import "./App.scss";
import { start } from "repl";
import { IWallProps, Wall } from "./Wall";
import { RiPlayFill, RiPauseFill, RiArrowGoBackFill } from "react-icons/ri";
import { ChakraProvider } from "@chakra-ui/react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from "@chakra-ui/react";
export interface ISimulationElement {
  type: string;
  startPosX: number;
  startPosY: number;
  color: string;
  mass: number;
  radius?: number;
  startVelX?: number;
  startVelY?: number;
  pendulum?: boolean;
}

function App() {
  const [simulationElements, setSimulationElements] = useState<
    ISimulationElement[]
  >([]);
  const [wallPositions, setWallPositions] = useState<IWallProps[]>([]);
  const [simulationReset, setSimulationReset] = useState<boolean>(false);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  const [showForces, setShowForces] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(false);
  const [showAcceleration, setShowAcceleration] = useState<boolean>(false);
  const [elasticCollisions, setElasticCollisions] = useState<boolean>(false);

  const [positionYDisplay, setPositionYDisplay] = useState(0);
  const [velocityYDisplay, setVelocityYDisplay] = useState(0);
  const [accelerationYDisplay, setAccelerationYDisplay] = useState(0);
  const [positionXDisplay, setPositionXDisplay] = useState(0);
  const [velocityXDisplay, setVelocityXDisplay] = useState(0);
  const [accelerationXDisplay, setAccelerationXDisplay] = useState(0);

  const addWeight = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 0,
      startPosY: 0,
      color: "red",
      mass: 5,
      radius: 50,
      pendulum: false,
    };
    setSimulationElements((state) => [...state, weight]);
  };

  const addPendulum = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 0,
      startPosY: 0,
      color: "red",
      mass: 5,
      radius: 50,
      pendulum: true,
    };
    setSimulationElements((state) => [...state, weight]);
  };

  useEffect(() => {
    const walls: IWallProps[] = [];
    walls.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
    setWallPositions(walls);
  }, []);

  setInterval(() => {
    setTimer(timer + 1);
  }, 60);

  return (
    <div className="mechanicsSimulationContainer">
      <div className="mechanicsSimulationContentContainer">
        <div className="mechanicsSimulationButtonsAndElements">
          <div className="mechanicsSimulationButtons">
            <div>
              <button onClick={() => setSimulationElements([])}>
                Clear elements
              </button>
              <button
                onClick={addWeight}
                disabled={simulationElements.length > 0}
              >
                {" "}
                Add weight
              </button>
              <button
                onClick={addPendulum}
                disabled={simulationElements.length > 0}
              >
                {" "}
                Add pendulum
              </button>
            </div>
            <div>
              {!elasticCollisions && (
                <button onClick={() => setElasticCollisions(true)}>
                  {" "}
                  Make collisions elastic
                </button>
              )}
              {elasticCollisions && (
                <button onClick={() => setElasticCollisions(false)}>
                  {" "}
                  Make collisions inelastic
                </button>
              )}
              {!showForces && (
                <button onClick={() => setShowForces(true)}>
                  {" "}
                  Show forces
                </button>
              )}
              {showForces && (
                <button onClick={() => setShowForces(false)}>
                  {" "}
                  Hide forces
                </button>
              )}
              {!showVelocity && (
                <button onClick={() => setShowVelocity(true)}>
                  {" "}
                  Show velocity
                </button>
              )}
              {showVelocity && (
                <button onClick={() => setShowVelocity(false)}>
                  {" "}
                  Hide velocity
                </button>
              )}
              {!showAcceleration && (
                <button onClick={() => setShowAcceleration(true)}>
                  {" "}
                  Show acceleration
                </button>
              )}
              {showAcceleration && (
                <button onClick={() => setShowAcceleration(false)}>
                  {" "}
                  Hide acceleration
                </button>
              )}
            </div>
          </div>
          <div className="mechanicsSimulationElements">
            {simulationElements.map((element, index) => {
              if (element.type === "weight") {
                const forceOfGravity: IForce = {
                  description: "Gravity",
                  magnitude: element.mass * 9.81,
                  directionInDegrees: 270,
                };
                return (
                  <div key={index}>
                    <Weight
                      startPosX={element.startPosX}
                      startPosY={element.startPosY}
                      radius={element.radius ?? 5}
                      color={element.color}
                      mass={element.mass}
                      timestepSize={0.002}
                      walls={wallPositions}
                      incrementTime={timer}
                      reset={simulationReset}
                      paused={simulationPaused}
                      setPaused={setSimulationPaused}
                      forces={[forceOfGravity]}
                      showForces={showForces}
                      showVelocity={showVelocity}
                      showAcceleration={showAcceleration}
                      setDisplayYPosition={setPositionYDisplay}
                      setDisplayYVelocity={setVelocityYDisplay}
                      setDisplayYAcceleration={setAccelerationYDisplay}
                      setDisplayXPosition={setPositionXDisplay}
                      setDisplayXVelocity={setVelocityXDisplay}
                      setDisplayXAcceleration={setAccelerationXDisplay}
                      elasticCollisions={elasticCollisions}
                      pendulum={element.pendulum ?? false}
                    />
                  </div>
                );
              }
              return <div key={index} />;
            })}
          </div>
          <div>
            {wallPositions.map((element, index) => {
              return (
                <Wall
                  key={index}
                  length={element.length}
                  xPos={element.xPos}
                  yPos={element.yPos}
                  angleInDegrees={element.angleInDegrees}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mechanicsSimulationEquationContainer">
        <div className="mechanicsSimulationFooter">
          <button
            className="controlButton"
            onClick={() => {
              setSimulationPaused(false);
            }}
          >
            {" "}
            Start
            <i className="ri-admin-line"></i>
            <RiPlayFill />
          </button>
          <button
            className="controlButton"
            onClick={() => {
              setSimulationPaused(true);
            }}
          >
            {" "}
            Pause
            <RiPauseFill />
          </button>
          <button
            className="controlButton"
            onClick={() => {
              setSimulationPaused(true);
              setSimulationReset(!simulationReset);
            }}
          >
            {" "}
            Reset
            <RiArrowGoBackFill />
          </button>
        </div>
        <div className="slider">ADD SLIDER</div>
        <div className="mechanicsSimulationEquation">
          <table>
            <tr>
              <td>&nbsp;</td>
              {/* <td>Formula</td> */}
              <td>X</td>
              <td>Y</td>
            </tr>
            <tr>
              <td>Position</td>
              {/* <td>
                p<sub>1</sub>=p<sub>0</sub>+vt+at<sup>2</sup>
              </td> */}
              <td>{positionXDisplay} m</td>
              <td>{positionYDisplay} m</td>
            </tr>
            <tr>
              <td>Velocity</td>
              {/* <td>
                v<sub>1</sub>=v<sub>0</sub>+at
              </td> */}
              <td>{velocityXDisplay} m/s</td>
              <td>{velocityYDisplay} m/s</td>
            </tr>
            <tr>
              <td>Acceleration</td>
              {/* <td>a=f/m</td> */}
              <td>
                {accelerationXDisplay} m/s<sup>2</sup>
              </td>
              <td>
                {accelerationYDisplay} m/s<sup>2</sup>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
