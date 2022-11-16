import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { styled } from "@mui/material/styles";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Input,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import "./App.scss";
import { IWallProps, Wall } from "./Wall";
import { Wedge } from "./Wedge";
import { IForce, Weight } from "./Weight";
import questions from "./Questions.json";

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
  const [accelerationXDisplay, setAccelerationXDisplay] = useState(0);
  const [accelerationYDisplay, setAccelerationYDisplay] = useState(0);
  const [elasticCollisions, setElasticCollisions] = useState<boolean>(false);
  const [pendulum, setPendulum] = useState(false);
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [pendulumLength, setPendulumLength] = useState(0);
  const [positionXDisplay, setPositionXDisplay] = useState(0);
  const [positionYDisplay, setPositionYDisplay] = useState(0);
  const [showAcceleration, setShowAcceleration] = useState<boolean>(false);
  const [showForces, setShowForces] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(false);
  const [simulationElements, setSimulationElements] = useState<
    ISimulationElement[]
  >([]);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(true);
  const [simulationReset, setSimulationReset] = useState<boolean>(false);
  const [startPendulumAngle, setStartPendulumAngle] = useState(0);
  const [timer, setTimer] = useState<number>(0);
  const [velocityXDisplay, setVelocityXDisplay] = useState(0);
  const [velocityYDisplay, setVelocityYDisplay] = useState(0);
  const [wallPositions, setWallPositions] = useState<IWallProps[]>([]);

  const [mode, setMode] = useState<string>("Freeform");
  const [topic, setTopic] = useState<string>("Incline Plane");

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
    setPositionXDisplay(30);
    setPositionYDisplay(window.innerHeight * 0.8 - 30 - 2 * 50 + 5);
    setSimulationElements([weight]);
    setUpdatedForces([forceOfGravity]);
    setStartForces([forceOfGravity]);
    handleClose();
  };

  const addWedge = () => {
    setWedge(true);
    const wedge: ISimulationElement = {
      startPosX: window.innerWidth * 0.7 * 0.5 - 200,
      startPosY: window.innerHeight * 0.8,
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
    setPositionXDisplay(window.innerWidth * 0.7 * 0.5 - 200);
    setPositionYDisplay(200 + 50 + 25 - 2 * 50 + 5);
    setSimulationElements([wedge, weight]);
    setStartForces([forceOfGravity]);
    updateForcesWithFriction(Number(coefficientOfStaticFriction));
    changeWedgeAngle(26);
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
    setPositionXDisplay(30);
    setPositionYDisplay(window.innerHeight * 0.8 - 30 - 2 * 50 + 5);
    setSimulationElements([weight]);
    setUpdatedForces([forceOfGravity]);
    handleClose();
  };

  useEffect(() => {
    if (!pendulum) {
      const walls: IWallProps[] = [];
      walls.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
      walls.push({ length: 80, xPos: 0, yPos: 0, angleInDegrees: 90 });
      walls.push({ length: 80, xPos: 69.5, yPos: 0, angleInDegrees: 90 });
      setWallPositions(walls);
    } else {
      setWallPositions([]);
    }
  }, [pendulum]);

  setInterval(() => {
    setTimer(timer + 1);
  }, 60);

  // Coefficient of static friction
  const [coefficientOfStaticFriction, setCoefficientOfStaticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const handleCoefficientOfStaticFrictionInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCoefficientOfStaticFriction(
      event.target.value === "" ? "" : Number(event.target.value)
    );
    updateForcesWithFriction(
      event.target.value === "" ? 0 : Number(event.target.value)
    );
  };
  const handleCoefficientOfStaticFrictionBlur = () => {
    if (coefficientOfStaticFriction < 0) {
      setCoefficientOfStaticFriction(0);
      updateForcesWithFriction(0);
    } else if (coefficientOfStaticFriction > 1) {
      setCoefficientOfStaticFriction(1);
      updateForcesWithFriction(1);
    }
  };

  const updateForcesWithFriction = (
    coefficient: number,
    width: number = wedgeWidth,
    height: number = wedgeHeight
  ) => {
    const normalForce: IForce = {
      description: "Normal Force",
      magnitude: forceOfGravity.magnitude * Math.cos(Math.atan(height / width)),
      directionInDegrees:
        180 - 90 - (Math.atan(height / width) * 180) / Math.PI,
    };
    let frictionForce: IForce = {
      description: "Static Friction Force",
      magnitude:
        coefficient *
        forceOfGravity.magnitude *
        Math.cos(Math.atan(height / width)),
      directionInDegrees: 180 - (Math.atan(height / width) * 180) / Math.PI,
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
    if (coefficient != 0) {
      setStartForces([forceOfGravity, normalForce, frictionForce]);
      setUpdatedForces([forceOfGravity, normalForce, frictionForce]);
    } else {
      setStartForces([forceOfGravity, normalForce]);
      setUpdatedForces([forceOfGravity, normalForce]);
    }
  };

  // Coefficient of kinetic friction
  const [coefficientOfKineticFriction, setCoefficientOfKineticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const handleCoefficientOfKineticFrictionInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCoefficientOfKineticFriction(
      event.target.value === "" ? "" : Number(event.target.value)
    );
  };
  const handleCoefficientOfKineticFrictionBlur = () => {
    if (coefficientOfKineticFriction < 0) {
      setCoefficientOfKineticFriction(0);
    } else if (coefficientOfKineticFriction > coefficientOfStaticFriction) {
      setCoefficientOfKineticFriction(coefficientOfStaticFriction);
      alert(
        "Coefficient of kinetic friction must be less than coefficient of static friction!"
      );
    }
  };

  // Wedge angle
  const [wedge, setWedge] = useState(false);
  const [wedgeHeight, setWedgeHeight] = useState(
    Math.tan((26 * Math.PI) / 180) * 400
  );
  const [wedgeWidth, setWedgeWidth] = useState(400);
  const [wedgeAngle, setWedgeAngle] = React.useState<
    number | string | Array<number | string>
  >(26);

  const handleWedgeAngleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWedgeAngle(event.target.value === "" ? "" : Number(event.target.value));
    changeWedgeAngle(Number(event.target.value));
  };

  const changeWedgeAngle = (angle: number) => {
    let width = 0;
    let height = 0;
    if (angle < 50) {
      width = 400;
      height = Math.tan((angle * Math.PI) / 180) * 400;
      setWedgeWidth(width);
      setWedgeHeight(height);
    } else if (angle < 70) {
      width = 200;
      height = Math.tan((angle * Math.PI) / 180) * 200;
      setWedgeWidth(width);
      setWedgeHeight(height);
    } else {
      width = 100;
      height = Math.tan((angle * Math.PI) / 180) * 100;
      setWedgeWidth(width);
      setWedgeHeight(height);
    }

    // update weight position based on updated wedge width/height
    let yPos = (width - 50) * Math.tan((angle * Math.PI) / 180);
    if (angle < 40) {
      yPos += Math.sqrt(angle);
    } else if (angle < 58) {
      yPos += angle / 2;
    } else if (angle < 68) {
      yPos += angle;
    } else if (angle < 70) {
      yPos += angle * 1.3;
    } else if (angle < 75) {
      yPos += angle * 1.5;
    } else if (angle < 78) {
      yPos += angle * 2;
    } else if (angle < 79) {
      yPos += angle * 2.25;
    } else if (angle < 80) {
      yPos += angle * 2.6;
    } else {
      yPos += angle * 3;
    }
    setPositionXDisplay(window.innerWidth * 0.7 * 0.5 - 200);
    setPositionYDisplay(yPos);
    setDisplayChange(!displayChange);
    updateForcesWithFriction(
      Number(coefficientOfStaticFriction),
      width,
      height
    );
  };

  const handleWedgeAngleBlur = () => {
    let width = 0;
    let angle = 0;
    let height = 0;
    if (wedgeAngle < 0) {
      angle = 0;
      width = 400;
      height = 0;
      setWedgeAngle(angle);
      setWedgeWidth(width);
      setWedgeHeight(height);
      // update weight position based on updated wedge width/height
      setPositionXDisplay(window.innerWidth * 0.7 * 0.5 - 200);
      setPositionYDisplay((width - 50) * Math.tan((angle * Math.PI) / 180));
      setDisplayChange(!displayChange);
      updateForcesWithFriction(
        Number(coefficientOfStaticFriction),
        width,
        height
      );
    } else if (wedgeAngle > 80) {
      angle = 79;
      width = 50;
      height = Math.tan((89 * Math.PI) / 180) * 50;
      setWedgeAngle(angle);
      setWedgeWidth(width);
      setWedgeHeight(height);
      // update weight position based on updated wedge width/height
      setPositionXDisplay(window.innerWidth * 0.7 * 0.5 - 200);
      setPositionYDisplay((width - 50) * Math.tan((angle * Math.PI) / 180));
      setDisplayChange(!displayChange);
      updateForcesWithFriction(
        Number(coefficientOfStaticFriction),
        width,
        height
      );
    }
  };

  const clearSimulation = () => {
    setPendulum(false);
    setWedge(false);
    setSimulationElements([]);
    setUpdatedForces([forceOfGravity]);
    setStartForces([forceOfGravity]);
    setSimulationPaused(true);
    handleClose();
  };

  useEffect(() => {
    if (mode == "Freeform") {
      clearSimulation();
      // TODO
    } else if (mode == "Review") {
      setShowAcceleration(false);
      setShowVelocity(false);
      setShowForces(true);
      if (topic == "Incline Plane") {
        setQuestionNumber(0);
        setSelectedQuestion(questions.inclinePlane[0]);
      }
      generateNewQuestion();
      // TODO
    }
  }, [mode, topic]);

  const generateNewQuestion = () => {
    if (topic == "Incline Plane") {
      if (questionNumber == questions.inclinePlane.length - 1) {
        setQuestionNumber(0);
      } else {
        setQuestionNumber(questionNumber + 1);
      }
      setSelectedQuestion(questions.inclinePlane[questionNumber]);
      addWedge();
    }
    // TODO
  };

  // Add/remove elements menu
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

  let gravityMagnitude = 9.81;
  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: gravityMagnitude,
    directionInDegrees: 270,
  };

  const [startForces, setStartForces] = useState<IForce[]>([forceOfGravity]);
  const [updatedForces, setUpdatedForces] = useState<IForce[]>([
    forceOfGravity,
  ]);

  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [selectedQuestion, setSelectedQuestion] = useState(
    questions.inclinePlane[0]
  );
  const [selectedQuestionVariables, setSelectedQuestionVariables] = useState<
    number[]
  >([45]);
  const [fullQuestionSetup, setfullQuestionSetup] = useState<string>("");
  const [selectedQuestionQuestion, setSelectedQuestionQuestion] =
    useState<string>("");
  const [answerInputs, setAnswerInputs] = useState(<div></div>);

  useEffect(() => {
    let q = "";
    if (selectedQuestion) {
      for (let i = 0; i < selectedQuestion.questionSetup.length; i++) {
        q += selectedQuestion.questionSetup[i];
        if (i != selectedQuestion.questionSetup.length - 1) {
          q += selectedQuestionVariables[i];
        }
      }
      setSelectedQuestionQuestion(selectedQuestion.question);
    }
    setfullQuestionSetup(q);
  }, [selectedQuestion]);

  useEffect(() => {
    let answerInput = [];
    if (selectedQuestion) {
      for (let i = 0; i < selectedQuestion.answerParts.length; i++) {
        if (selectedQuestion.answerParts[i] == "force of gravity") {
          answerInput.push(
            <Grid container spacing={2} alignItems="center" key={i}>
              <Grid item xs>
                <Typography id="input-slider" sx={{ textAlign: "right" }}>
                  {"F"}
                  <sub>{"G"}</sub>
                </Typography>
              </Grid>
              <Grid item>
                <Input
                  value={coefficientOfStaticFriction}
                  size="medium"
                  onChange={handleCoefficientOfStaticFrictionInputChange}
                  onBlur={handleCoefficientOfStaticFrictionBlur}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Grid>
            </Grid>
          );
        } else if (selectedQuestion.answerParts[i] == "normal force") {
          answerInput.push(
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography id="input-slider" sx={{ textAlign: "right" }}>
                  {"F"}
                  <sub>{"N"}</sub>
                </Typography>
              </Grid>
              <Grid item>
                <Input
                  value={coefficientOfStaticFriction}
                  size="medium"
                  onChange={handleCoefficientOfStaticFrictionInputChange}
                  onBlur={handleCoefficientOfStaticFrictionBlur}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Grid>
            </Grid>
          );
        } else if (
          selectedQuestion.answerParts[i] == "force of static friction"
        ) {
          answerInput.push(
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography id="input-slider" sx={{ textAlign: "right" }}>
                  {"F"}
                  <sub>
                    {"&mu;"}
                    <sub>{"s"}</sub>
                  </sub>
                </Typography>
              </Grid>
              <Grid item>
                <Input
                  value={coefficientOfStaticFriction}
                  size="medium"
                  onChange={handleCoefficientOfStaticFrictionInputChange}
                  onBlur={handleCoefficientOfStaticFrictionBlur}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Grid>
            </Grid>
          );
        } else if (
          selectedQuestion.answerParts[i] == "coefficient of static friction"
        ) {
          answerInput.push(
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography id="input-slider" sx={{ textAlign: "right" }}>
                  {"&mu;"}
                  <sub>{"s"}</sub>
                </Typography>
              </Grid>
              <Grid item>
                <Input
                  value={coefficientOfStaticFriction}
                  size="medium"
                  onChange={handleCoefficientOfStaticFrictionInputChange}
                  onBlur={handleCoefficientOfStaticFrictionBlur}
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Grid>
            </Grid>
          );
        }
      }
    }
    setAnswerInputs(
      <div style={{ display: "flex", flexDirection: "column" }}>
        {answerInput}
      </div>
    );
  }, [selectedQuestion]);

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }));

  return (
    <div>
      <div className="mechanicsSimulationContainer">
        <div className="mechanicsSimulationContentContainer">
          <div className="mechanicsSimulationButtonsAndElements">
            <div className="mechanicsSimulationButtons">
              {mode == "Freeform" && (
                <div style={{ zIndex: 10000 }}>
                  <Tooltip title="Add/remove elements">
                    <IconButton onClick={handleClick} size="large">
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
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
                            onClick={clearSimulation}
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
              )}
            </div>
            <div className="mechanicsSimulationElements">
              {simulationElements.map((element, index) => {
                if (element.type === "weight") {
                  return (
                    <div key={index}>
                      <Weight
                        color={element.color ?? "red"}
                        displayXPosition={positionXDisplay}
                        displayYPosition={positionYDisplay}
                        displayXVelocity={velocityXDisplay}
                        displayYVelocity={velocityYDisplay}
                        elasticCollisions={elasticCollisions}
                        startForces={startForces}
                        incrementTime={timer}
                        mass={element.mass ?? 1}
                        paused={simulationPaused}
                        pendulumAngle={pendulumAngle}
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
                        updatedForces={updatedForces}
                        setUpdatedForces={setUpdatedForces}
                        walls={wallPositions}
                        wedgeHeight={wedgeHeight}
                        wedgeWidth={wedgeWidth}
                        coefficientOfKineticFriction={Number(
                          coefficientOfKineticFriction
                        )}
                        xMax={window.innerWidth * 0.7}
                        yMax={window.innerHeight * 0.8}
                      />
                    </div>
                  );
                } else if (element.type === "wedge") {
                  return (
                    <div key={index}>
                      <Wedge
                        startWidth={wedgeWidth}
                        startHeight={wedgeHeight}
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
          <div className="mechanicsSimulationControls">
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
              {simulationPaused && (
                <Tooltip title="Reset simulation">
                  <IconButton
                    onClick={() => {
                      setSimulationReset(!simulationReset);
                    }}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            {mode == "Review" && (
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={topic}
                label="Topic"
                onChange={(e) => {
                  setTopic(e.target.value as string);
                }}
              >
                <MenuItem value="Incline Plane">Incline Plane</MenuItem>
              </Select>
            )}
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={mode}
              label="Mode"
              onChange={(e) => {
                setMode(e.target.value as string);
              }}
            >
              <MenuItem value="Freeform">Freeform</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
            </Select>
          </div>
          {mode == "Review" && (
            <div className="wordProblemBox">
              <div className="question">
                <p>{fullQuestionSetup}</p>
                <p>{selectedQuestionQuestion}</p>
              </div>
              <div className="answer"> {answerInputs}</div>
            </div>
          )}

          {mode == "Review" && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ zIndex: 10000 }}>
                <Button
                  onClick={() => generateNewQuestion()}
                  variant="outlined"
                >
                  <Typography>New question</Typography>
                </Button>
              </div>
              <div style={{ zIndex: 10000 }}>
                <Button
                  onClick={() => {
                    /*TODO */
                  }}
                  variant="outlined"
                >
                  <Typography>Submit</Typography>
                </Button>
              </div>
            </div>
          )}

          {mode == "Freeform" && (
            <div>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={wedge}
                        value={elasticCollisions}
                        onChange={() =>
                          setElasticCollisions(!elasticCollisions)
                        }
                      />
                    }
                    label="Make collisions inelastic"
                    labelPlacement="start"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={showForces}
                        onChange={() => setShowForces(!showForces)}
                      />
                    }
                    label="Show force vectors"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={showAcceleration}
                        onChange={() => setShowAcceleration(!showAcceleration)}
                      />
                    }
                    label="Show acceleration vector"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={showVelocity}
                        onChange={() => setShowVelocity(!showVelocity)}
                      />
                    }
                    label="Show velocity vector"
                    labelPlacement="start"
                  />
                </FormGroup>
              </FormControl>
              {wedge && simulationPaused && (
                <Box>
                  <FormControl>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Typography
                          id="input-slider"
                          sx={{ textAlign: "right" }}
                        >
                          <p>&theta;</p>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Input
                          value={wedgeAngle}
                          size="medium"
                          onChange={handleWedgeAngleChange}
                          onBlur={handleWedgeAngleBlur}
                          inputProps={{
                            step: 1,
                            min: 0,
                            max: 79,
                            type: "number",
                            "aria-labelledby": "input-slider",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                  <FormControl>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Typography
                          id="input-slider"
                          sx={{ textAlign: "right" }}
                        >
                          <p>
                            &mu;
                            <sub>{"s"}</sub>
                          </p>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Input
                          value={coefficientOfStaticFriction}
                          size="medium"
                          onChange={
                            handleCoefficientOfStaticFrictionInputChange
                          }
                          onBlur={handleCoefficientOfStaticFrictionBlur}
                          inputProps={{
                            step: 0.1,
                            min: 0,
                            max: 1,
                            type: "number",
                            "aria-labelledby": "input-slider",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                  <FormControl>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Typography
                          id="input-slider"
                          sx={{ textAlign: "right" }}
                        >
                          &mu;
                          <sub>{"k"}</sub>
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Input
                          value={coefficientOfKineticFriction}
                          size="medium"
                          onChange={
                            handleCoefficientOfKineticFrictionInputChange
                          }
                          onBlur={handleCoefficientOfKineticFrictionBlur}
                          inputProps={{
                            step: 0.1,
                            min: 0,
                            max: 1,
                            type: "number",
                            "aria-labelledby": "input-slider",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </FormControl>
                </Box>
              )}
              {wedge && !simulationPaused && (
                <Typography>
                  {"&theta;:"} {Math.round(Number(wedgeAngle) * 100) / 100}{" "}
                  {"°"}
                  <p>
                    &mu; <sub>s</sub>: {coefficientOfStaticFriction}
                  </p>
                  <p>
                    &mu; <sub>k</sub>: {coefficientOfKineticFriction}
                  </p>
                </Typography>
              )}
              {pendulum && !simulationPaused && (
                <Typography>
                  <p>
                    &theta;:{" "}
                    {Math.round(((pendulumAngle * 180) / Math.PI) * 100) / 100}°
                  </p>
                </Typography>
              )}
            </div>
          )}
          <div className="mechanicsSimulationEquation">
            {mode == "Freeform" && (
              <table>
                <tbody>
                  <tr>
                    <td>&nbsp;</td>
                    <td>X</td>
                    <td>Y</td>
                  </tr>
                  <tr>
                    <Tooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Position</Typography>
                          {"Equation: x"}
                          <sub>{"1"}</sub>
                          {"=x"}
                          <sub>{"0"}</sub>
                          {"+v"}
                          <sub>{"0"}</sub>
                          {"t+0.5at"}
                          <sup>{"2"}</sup>
                          <br />
                          {"Units: m"}
                        </React.Fragment>
                      }
                      placement="top"
                    >
                      <td>Position</td>
                    </Tooltip>
                    <td>
                      {(!simulationPaused || wedge) && positionXDisplay}{" "}
                      {(!simulationPaused || wedge) && <p>m</p>}{" "}
                      {simulationPaused && !wedge && (
                        <TextField
                          type="number"
                          variant="standard"
                          value={positionXDisplay}
                          style={{ width: "7em" }}
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
                      {(!simulationPaused || wedge) && positionYDisplay}{" "}
                      {(!simulationPaused || wedge) && <p>m</p>}{" "}
                      {simulationPaused && !wedge && (
                        <TextField
                          type="number"
                          variant="standard"
                          value={positionYDisplay}
                          style={{ width: "7em" }}
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
                    <Tooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Velocity</Typography>
                          {"Equation: v"}
                          <sub>{"1"}</sub>
                          {"=v"}
                          <sub>{"0"}</sub>
                          {"+at"}
                          <br />
                          {"Units: m/s"}
                        </React.Fragment>
                      }
                      placement="top"
                    >
                      <td>Velocity</td>
                    </Tooltip>
                    <td>
                      {(!simulationPaused || pendulum || wedge) &&
                        velocityXDisplay}{" "}
                      {(!simulationPaused || pendulum || wedge) && <p>m/s</p>}{" "}
                      {simulationPaused && !pendulum && !wedge && (
                        <TextField
                          type="number"
                          variant="standard"
                          value={velocityXDisplay}
                          style={{ width: "7em" }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                m/s
                              </InputAdornment>
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
                      {(!simulationPaused || pendulum || wedge) &&
                        velocityYDisplay}{" "}
                      {(!simulationPaused || pendulum || wedge) && <p>m/s</p>}{" "}
                      {simulationPaused && !pendulum && !wedge && (
                        <TextField
                          type="number"
                          variant="standard"
                          value={velocityYDisplay}
                          style={{ width: "7em" }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                m/s
                              </InputAdornment>
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
                    <Tooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Acceleration</Typography>
                          {"Equation: a=F/m"}

                          <br />
                          {"Units: m/s"}
                          <sup>{"2"}</sup>
                        </React.Fragment>
                      }
                      placement="top"
                    >
                      <td>Acceleration</td>
                    </Tooltip>
                    <td>
                      {accelerationXDisplay} m/s<sup>2</sup>
                    </td>
                    <td>
                      {accelerationYDisplay} m/s<sup>2</sup>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          {mode == "Freeform" &&
            simulationElements.length > 0 &&
            simulationElements[0].pendulum && (
              <div className="mechanicsSimulationEquation">
                <table>
                  <tbody>
                    <tr>
                      <td>&nbsp;</td>
                      <td>Value</td>
                    </tr>
                    <tr>
                      <td>Potential Energy</td>
                      <td>
                        {Math.round(
                          pendulumLength *
                            (1 - Math.cos(pendulumAngle)) *
                            9.81 *
                            10
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
                  </tbody>
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
