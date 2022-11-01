import React, { useEffect, useState } from "react";
import { Weight, IForce } from "./Weight";
import "./App.scss";
import { IWallProps, Wall } from "./Wall";
import ToolTip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import AddIcon from "@mui/icons-material/Add";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";

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
      mass: 10,
      radius: 50,
      pendulum: false,
    };
    setSimulationElements((state) => [...state, weight]);
    handleClose();
  };

  const addPendulum = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 0,
      startPosY: 0,
      color: "red",
      mass: 10,
      radius: 50,
      pendulum: true,
    };
    setSimulationElements((state) => [...state, weight]);
    handleClose();
  };

  useEffect(() => {
    const walls: IWallProps[] = [];
    walls.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
    setWallPositions(walls);
  }, []);

  setInterval(() => {
    setTimer(timer + 1);
  }, 60);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="mechanicsSimulationContainer">
      <div className="mechanicsSimulationContentContainer">
        <div className="mechanicsSimulationButtonsAndElements">
          <div className="mechanicsSimulationButtons">
            <div>
              <IconButton onClick={handleClick}>
                <AddIcon />
              </IconButton>
              <Popover
                open={open}
                id={id}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <nav aria-label="add simulation element options">
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={addWeight}
                        disabled={simulationElements.length > 0}
                      >
                        <ListItemIcon>
                          <PlayArrowIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add free weight" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={addPendulum}
                        disabled={simulationElements.length > 0}
                      >
                        <ListItemIcon>
                          <PlayArrowIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add pendulum" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </nav>
                <Divider />
                <nav aria-label="clear simulation elements">
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        disabled={simulationElements.length == 0}
                        onClick={() => {
                          setSimulationElements([]);
                          handleClose();
                        }}
                      >
                        <ListItemIcon>
                          <ClearIcon />
                        </ListItemIcon>
                        <ListItemText primary="Clear simulation" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </nav>
              </Popover>
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
          <Stack direction="row" spacing={1}>
            <ToolTip title="Start simulation">
              <IconButton
                onClick={() => {
                  setSimulationPaused(false);
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            </ToolTip>
            <ToolTip title="Pause simulation">
              <IconButton
                onClick={() => {
                  setSimulationPaused(true);
                }}
              >
                <PauseIcon />
              </IconButton>
            </ToolTip>
            <ToolTip title="Reset simulation">
              <IconButton
                onClick={() => {
                  setSimulationPaused(true);
                  setSimulationReset(!simulationReset);
                }}
              >
                <ReplayIcon />
              </IconButton>
            </ToolTip>
          </Stack>
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
