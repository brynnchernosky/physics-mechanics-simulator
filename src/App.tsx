import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.scss";

function App() {
  const [simulationElements, setSimulationElements] = useState<JSX.Element[]>(
    []
  );

  const addWeight = () => {
    const weight = <div className="weight" key={simulationElements.length} />;
    console.log(simulationElements);
    setSimulationElements((state) => [...state, weight]);
  };

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
            {simulationElements}
          </div>
        </div>
        <div className="mechanicsSimulationFooter">
          <button> Start</button>
          <button> Pause</button>
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
