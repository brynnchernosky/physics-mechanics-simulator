import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import { Weight } from "./Weight";
import "./App.scss";

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
  const [timerPaused, setTimerPaused] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(0);

  const addWeight = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 0,
      startPosY: 0,
      color: "red",
      mass: 5,
      radius: 5,
      startAccY: -9.81,
    };
    setSimulationElements((state) => [...state, weight]);
  };

  // setInterval(() => {
  //   if (timerPaused) {
  //     setTimer(timer);
  //   } else {
  //     setTimer(timer + 1);
  //   }
  // }, 100);

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
                return (
                  <div key={index}>
                    <Weight
                      startPosX={element.startPosX}
                      startPosY={element.startPosY}
                      startAccY={element.startAccY}
                      radius={element.radius}
                      color={element.color}
                      mass={element.mass}
                      timestepSize={1}
                      incrementTime={timer}
                    />
                  </div>
                );
              }
              return <div key={index} />;
            })}
          </div>
        </div>
        <div className="mechanicsSimulationFooter">
          <button
            onClick={() => {
              setTimerPaused(false);
            }}
          >
            {" "}
            Start
          </button>
          <button
            onClick={() => {
              setTimerPaused(true);
            }}
          >
            {" "}
            Pause
          </button>
          <button> Reset</button>
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
