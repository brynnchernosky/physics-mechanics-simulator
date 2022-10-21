import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { Weight, IForce } from "./Weight";
import "./App.scss";
import { start } from "repl";
import { IWallProps, Wall } from "./Wall";

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
    walls.push({ length: 100, xPos: 0, yPos: 100, angleInDegrees: 0 });
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
            <button> Settings</button>
          </div>
          <div className="mechanicsSimulationElements">
            {simulationElements.map((element, index) => {
              if (element.type === "weight") {
                const forceOfGravity: IForce = {
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
        <div className="mechanicsSimulationFooter">
          <button
            onClick={() => {
              setSimulationPaused(false);
            }}
          >
            {" "}
            Start
          </button>
          <button
            onClick={() => {
              setSimulationPaused(true);
            }}
          >
            {" "}
            Pause
          </button>
          <button
            onClick={() => {
              setSimulationPaused(true);
              setSimulationReset(!simulationReset);
            }}
          >
            {" "}
            Reset
          </button>
          <button> Slider</button>
        </div>
      </div>
      <div className="mechanicsSimulationEquationContainer">
        <div className="mechanicsSimulationEquation">
          Position: x_1=x_0+vt+at^2
        </div>
      </div>
    </div>
  );
}

export default App;
