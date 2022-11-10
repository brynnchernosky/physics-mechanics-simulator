import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "./App.scss";
import { IWallProps, Wall } from "./Wall";
import { Wedge } from "./Wedge";
import { IForce, Weight } from "./Weight";
export interface ISimulationElement {
  color?: string;
  mass?: number;
  pendulum?: boolean;
  wedge?: boolean;
  radius?: number;
  startPosX: number;
  startPosY: number;
  startVelX?: number;
  startVelY?: number;
  type: string;
  height?: number;
  width?: number;
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
  const [pendulum, setPendulum] = useState(false);
  const [wedge, setWedge] = useState(false);

  const [positionYDisplay, setPositionYDisplay] = useState(0);
  const [velocityYDisplay, setVelocityYDisplay] = useState(0);
  const [accelerationYDisplay, setAccelerationYDisplay] = useState(0);
  const [positionXDisplay, setPositionXDisplay] = useState(0);
  const [velocityXDisplay, setVelocityXDisplay] = useState(0);
  const [accelerationXDisplay, setAccelerationXDisplay] = useState(0);
  const [startPendulumAngle, setStartPendulumAngle] = useState(0);
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [pendulumLength, setPendulumLength] = useState(0);

  const addWeight = () => {
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 30,
      startPosY: 30,
      color: "red",
      mass: 1,
      radius: 50,
      pendulum: false,
      wedge: false,
    };
    setSimulationElements([weight]);
    handleClose();
  };

  const addWedge = () => {
    setWedge(true);
    const wedge: ISimulationElement = {
      startPosX: window.innerWidth * 0.7 * 0.5 - 200,
      startPosY: window.innerHeight * 0.8,
      height: 200,
      width: 400,
      type: "wedge",
    };
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: window.innerWidth * 0.7 * 0.5 - 200,
      startPosY: window.innerHeight * 0.8 - 200 - 50 - 25,
      color: "red",
      mass: 1,
      radius: 50,
      pendulum: false,
      wedge: true,
    };
    setSimulationElements([wedge, weight]);
    handleClose();
  };

  const addPendulum = () => {
    setPendulum(true);
    const weight: ISimulationElement = {
      type: "weight",
      startPosX: 30,
      startPosY: 30,
      color: "red",
      mass: 1,
      radius: 50,
      pendulum: true,
      wedge: false,
    };
    setSimulationElements([weight]);
    handleClose();
  };

  useEffect(() => {
    if (!pendulum) {
      const walls: IWallProps[] = [];
      walls.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
      setWallPositions(walls);
    } else {
      setWallPositions([]);
    }
  }, [pendulum]);

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

  const [displayChange, setDisplayChange] = useState(false);

  return (
    <div>
      <div className="mechanicsSimulationContainer">
        <div className="mechanicsSimulationContentContainer">
          <div className="mechanicsSimulationButtonsAndElements">
            <div className="mechanicsSimulationButtons">
              <div>
                <div style={{ zIndex: 10000 }}>
                  <Tooltip title="Add/remove elements">
                    <IconButton onClick={handleClick} size="large">
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </div>
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
                          onClick={() => addWeight()}
                          disabled={simulationElements.length > 0}
                        >
                          <ListItemIcon>
                            <AddCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Add free weight" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            addPendulum();
                          }}
                          disabled={simulationElements.length > 0}
                        >
                          <ListItemIcon>
                            <AddCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Add pendulum" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            addWedge();
                          }}
                          disabled={simulationElements.length > 0}
                        >
                          <ListItemIcon>
                            <AddCircleIcon />
                          </ListItemIcon>
                          <ListItemText primary="Add wedge" />
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
                            setPendulum(false);
                            setWedge(false);
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
            </div>
            <div className="mechanicsSimulationElements">
              {simulationElements.map((element, index) => {
                if (element.type === "weight") {
                  let gravityMagnitude = 9.81;
                  if (element.mass && element.mass != undefined) {
                    gravityMagnitude *= element.mass;
                  }
                  const forceOfGravity: IForce = {
                    description: "Gravity",
                    magnitude: gravityMagnitude,
                    directionInDegrees: 270,
                  };
                  let forces = [forceOfGravity];
                  if (element.wedge) {
                    console.log(
                      simulationElements[0].height,
                      simulationElements[0].width
                    );
                    const height = simulationElements[0].height ?? 200;
                    const width = simulationElements[0].width ?? 400;
                    const normalForce: IForce = {
                      description: "Normal Force",
                      magnitude:
                        gravityMagnitude * Math.cos(Math.atan(height / width)),
                      directionInDegrees:
                        180 - 90 - (Math.atan(height / width) * 180) / Math.PI,
                    };
                    forces = [forceOfGravity, normalForce];
                  }
                  return (
                    <div key={index}>
                      <Weight
                        color={element.color ?? "red"}
                        displayXPosition={positionXDisplay}
                        displayYPosition={positionYDisplay}
                        displayXVelocity={velocityXDisplay}
                        displayYVelocity={velocityYDisplay}
                        elasticCollisions={elasticCollisions}
                        forces={forces}
                        incrementTime={timer}
                        mass={element.mass ?? 1}
                        paused={simulationPaused}
                        pendulum={element.pendulum ?? false}
                        wedge={element.wedge ?? false}
                        radius={element.radius ?? 5}
                        reset={simulationReset}
                        setDisplayXAcceleration={setAccelerationXDisplay}
                        setDisplayXPosition={setPositionXDisplay}
                        setDisplayXVelocity={setVelocityXDisplay}
                        setDisplayYAcceleration={setAccelerationYDisplay}
                        setDisplayYPosition={setPositionYDisplay}
                        setDisplayYVelocity={setVelocityYDisplay}
                        setPaused={setSimulationPaused}
                        setPendulumAngle={setPendulumAngle}
                        setPendulumLength={setPendulumLength}
                        setStartPendulumAngle={setStartPendulumAngle}
                        showAcceleration={showAcceleration}
                        showForces={showForces}
                        showVelocity={showVelocity}
                        startPosX={element.startPosX}
                        startPosY={element.startPosY}
                        timestepSize={0.002}
                        updateDisplay={displayChange}
                        walls={wallPositions}
                        xMax={window.innerWidth * 0.7}
                        yMax={window.innerHeight * 0.8}
                      />
                    </div>
                  );
                } else if (element.type === "wedge") {
                  return (
                    <div key={index}>
                      <Wedge
                        startWidth={element.width ?? 100}
                        startHeight={element.height ?? 100}
                        startLeft={element.startPosX}
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
              {simulationPaused && (
                <Tooltip title="Start simulation">
                  <IconButton
                    onClick={() => {
                      setSimulationPaused(false);
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
              )}
              {!simulationPaused && (
                <Tooltip title="Pause simulation">
                  <IconButton
                    onClick={() => {
                      setSimulationPaused(true);
                    }}
                  >
                    <PauseIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Reset simulation">
                <IconButton
                  onClick={() => {
                    setSimulationPaused(true);
                    setSimulationReset(!simulationReset);
                  }}
                >
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </div>
          {/* <Box sx={{ width: 300 }}>
          <Slider
            aria-label="Timestep"
            defaultValue={0}
            valueLabelDisplay="auto"
            step={10}
            marks={[
              { value: 0, label: "0s" },
              { value: 10, label: "1s" },
              { value: 20, label: "2s" },
              { value: 30, label: "3s" },
              { value: 40, label: "4s" },
              { value: 50, label: "5s" },
              { value: 60, label: "6s" },
              { value: 70, label: "7s" },
              { value: 80, label: "8s" },
              { value: 90, label: "9s" },
              { value: 100, label: "10s" },
            ]}
          />
        </Box> */}
          <div>
            <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked
                      disabled={wedge}
                      onChange={() => setElasticCollisions(!elasticCollisions)}
                    />
                  }
                  label="Make collisions inelastic"
                  labelPlacement="start"
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={() => setShowForces(!showForces)}
                      defaultChecked
                    />
                  }
                  label="Show force vectors"
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={() => setShowAcceleration(!showAcceleration)}
                    />
                  }
                  label="Show acceleration vector"
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={
                    <Checkbox onChange={() => setShowVelocity(!showVelocity)} />
                  }
                  label="Show velocity vector"
                  labelPlacement="start"
                />
              </FormGroup>
            </FormControl>
          </div>
          <div className="mechanicsSimulationEquation">
            <table>
              <tr>
                <td>&nbsp;</td>
                <td>X</td>
                <td>Y</td>
              </tr>
              <tr>
                <td>Position</td>
                <td>
                  {!simulationPaused && positionXDisplay}{" "}
                  {!simulationPaused && <p>m</p>}{" "}
                  {simulationPaused && (
                    <TextField
                      type="number"
                      variant="standard"
                      defaultValue={positionXDisplay}
                      value={positionXDisplay}
                      style={{ width: "5rem" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const regex = /^[0-9\b]+$/;
                        if (regex.test(e.target.value)) {
                          setPositionXDisplay(parseFloat(e.target.value));
                          setDisplayChange(!displayChange);
                        }
                      }}
                    />
                  )}{" "}
                </td>
                <td>
                  {!simulationPaused && positionYDisplay}{" "}
                  {!simulationPaused && <p>m</p>}{" "}
                  {simulationPaused && (
                    <TextField
                      type="number"
                      variant="standard"
                      defaultValue={positionYDisplay}
                      value={positionYDisplay}
                      style={{ width: "5rem" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const regex = /^[0-9\b]+$/;
                        if (regex.test(e.target.value)) {
                          setPositionYDisplay(parseFloat(e.target.value));
                          setDisplayChange(!displayChange);
                        }
                      }}
                    />
                  )}{" "}
                </td>
              </tr>
              <tr>
                <td>Velocity</td>
                <td>
                  {(!simulationPaused || pendulum) && velocityXDisplay}{" "}
                  {(!simulationPaused || pendulum) && <p>m/s</p>}{" "}
                  {simulationPaused && !pendulum && (
                    <TextField
                      type="number"
                      variant="standard"
                      defaultValue={velocityXDisplay}
                      value={velocityXDisplay}
                      style={{ width: "5rem" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const regex = /^[0-9\b]+$/;
                        if (regex.test(e.target.value)) {
                          setVelocityXDisplay(parseFloat(e.target.value));
                          setDisplayChange(!displayChange);
                        }
                      }}
                    />
                  )}{" "}
                </td>
                <td>
                  {(!simulationPaused || pendulum) && velocityYDisplay}{" "}
                  {(!simulationPaused || pendulum) && <p>m/s</p>}{" "}
                  {simulationPaused && !pendulum && (
                    <TextField
                      type="number"
                      variant="standard"
                      defaultValue={velocityYDisplay}
                      value={velocityYDisplay}
                      style={{ width: "5rem" }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const regex = /^[0-9\b]+$/;
                        if (regex.test(e.target.value)) {
                          setVelocityYDisplay(parseFloat(e.target.value));
                          setDisplayChange(!displayChange);
                        }
                      }}
                    />
                  )}{" "}
                </td>
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
          {simulationElements.length > 0 && simulationElements[0].pendulum && (
            <div className="mechanicsSimulationEquation">
              <table>
                <tr>
                  <td>&nbsp;</td>
                  <td>Value</td>
                </tr>
                <tr>
                  <td>Potential Energy</td>
                  <td>
                    {Math.round(
                      pendulumLength * (1 - Math.cos(pendulumAngle)) * 9.81 * 10
                    ) / 10}{" "}
                    J
                  </td>
                </tr>
                <tr>
                  <td>Kinetic Energy</td>
                  <td>
                    {Math.round(
                      (Math.round(
                        pendulumLength *
                          (1 - Math.cos(startPendulumAngle)) *
                          9.81 *
                          10
                      ) /
                        10 -
                        Math.round(
                          pendulumLength *
                            (1 - Math.cos(pendulumAngle)) *
                            9.81 *
                            10
                        ) /
                          10) *
                        10
                    ) / 10}{" "}
                    J
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Total Energy</b>
                  </td>
                  <td>
                    {Math.round(
                      pendulumLength *
                        (1 - Math.cos(startPendulumAngle)) *
                        9.81 *
                        10
                    ) / 10}{" "}
                    J
                  </td>
                </tr>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="coordinateSystem">
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            zIndex: -10000,
          }}
        >
          <svg
            width={window.innerWidth + "px"}
            height={window.innerHeight + "px"}
          >
            <defs>
              <marker
                id="miniArrow"
                markerWidth="20"
                markerHeight="20"
                refX="0"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill={"#000000"} />
              </marker>
            </defs>
            <line
              x1={window.innerHeight * 0.05}
              y1={window.innerHeight * 0.95}
              x2={window.innerHeight * 0.05}
              y2={window.innerHeight * 0.9}
              stroke={"#000000"}
              strokeWidth="2"
              markerEnd="url(#miniArrow)"
            />
            <line
              x1={window.innerHeight * 0.05}
              y1={window.innerHeight * 0.95}
              x2={window.innerHeight * 0.1}
              y2={window.innerHeight * 0.95}
              stroke={"#000000"}
              strokeWidth="2"
              markerEnd="url(#miniArrow)"
            />
          </svg>
        </div>
        <p
          style={{
            position: "absolute",
            top: window.innerHeight * 0.95 + "px",
            left: window.innerHeight * 0.1 + "px",
            zIndex: -10000,
          }}
        >
          X
        </p>
        <p
          style={{
            position: "absolute",
            top: window.innerHeight * 0.85 + "px",
            left: window.innerHeight * 0.02 + "px",
            zIndex: -10000,
          }}
        >
          Y
        </p>
      </div>
    </div>
  );
}

export default App;
