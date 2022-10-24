import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { Weight, IForce } from "./Weight";
import "./App.scss";
import { start } from "repl";
import { IWallProps, Wall } from "./Wall";
import { RiPlayFill, RiPauseFill, RiArrowGoBackFill } from "react-icons/ri";

export interface ISimulationElement {
  type: string;
  startPosX: number;
  startPosY: number;
  color: string;
  mass: number;
  radius?: number;
  startVelX?: number;
  startVelY?: number;
  startAccX?: number;
  startAccY?: number;
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

  const [positionDisplay, setPositionDisplay] = useState(0);
  const [velocityDisplay, setVelocityDisplay] = useState(0);
  const [accelerationDisplay, setAccelerationDisplay] = useState(0);

  const addWeight = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 0,
      startPosY: 0,
      color: "red",
      mass: 5,
      radius: 50,
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
            <button
              onClick={addWeight}
              disabled={simulationElements.length > 0}
            >
              {" "}
              Add element
            </button>
            {!showForces && (
              <button onClick={() => setShowForces(true)}> Show forces</button>
            )}
            {showForces && (
              <button onClick={() => setShowForces(false)}> Hide forces</button>
            )}
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
                      radius={element.radius}
                      color={element.color}
                      mass={element.mass}
                      timestepSize={0.3}
                      walls={wallPositions}
                      incrementTime={timer}
                      reset={simulationReset}
                      paused={simulationPaused}
                      setPaused={setSimulationPaused}
                      forces={[forceOfGravity]}
                      showForces={showForces}
                      setPositionDisplay={setPositionDisplay}
                      setVelocityDisplay={setVelocityDisplay}
                      setAccelerationDisplay={setAccelerationDisplay}
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
        <div className="mechanicsSimulationEquation">
          <table>
            <tr>
              <td></td>
              <td>Formula</td>
              <td>Value</td>
            </tr>
            <tr>
              <td>Position</td>
              <td>
                x<sub>1</sub>=x<sub>0</sub>+vt+at<sup>2</sup>
              </td>
              <td>{positionDisplay} m</td>
            </tr>
            <tr>
              <td>Velocity</td>
              <td>
                v<sub>1</sub>=v<sub>0</sub>+at
              </td>
              <td>{velocityDisplay} m/s</td>
            </tr>
            <tr>
              <td>Acceleration</td> <td>a=f/m</td>
              <td>
                {accelerationDisplay} m/s<sup>2</sup>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
