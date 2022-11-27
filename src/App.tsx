import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { styled } from "@mui/material/styles";
import { InputField } from "./InputField";
import { InputValue } from "./InputValue";
import { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import {
  Alert,
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
  const [noMovement, setNoMovement] = useState(false);

  const [mode, setMode] = useState<string>("Freeform");
  const [topic, setTopic] = useState<string>("Incline Plane");

  const [correctMessageVisible, setCorrectMessageVisible] = useState(false);
  const [incorrectMessageVisible, setIncorrectMessageVisible] = useState(false);

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
  const [selectedQuestion, setSelectedQuestion] = useState<{
    questionSetup: string[];
    variablesForQuestionSetup: string[];
    question: string;
    answerParts: string[];
    answerSolutionDescriptions: string[];
    goal: string;
  }>(questions.inclinePlane[0]);
  const [selectedQuestionVariables, setSelectedQuestionVariables] = useState<
    number[]
  >([45]);
  const [fullQuestionSetup, setfullQuestionSetup] = useState<string>("");
  const [selectedQuestionQuestion, setSelectedQuestionQuestion] =
    useState<string>("");
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [answerInputs, setAnswerInputs] = useState(<div></div>);

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
    setPositionYDisplay(
      Math.round((window.innerHeight * 0.8 - 30 - 2 * 50 + 5) * 10) / 10
    );
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
    setSimulationElements([wedge, weight]);
    if (mode == "Freeform") {
      setPositionXDisplay(
        Math.round((window.innerWidth * 0.7 * 0.5 - 200) * 10) / 10
      );
      setPositionYDisplay(Math.round((200 + 50 + 25 - 2 * 50 + 5) * 10) / 10);
      setStartForces([forceOfGravity]);
      updateForcesWithFriction(Number(coefficientOfStaticFriction));
      changeWedgeAngle(26);
    } else {
      setStartForces([]);
      setUpdatedForces([]);
    }
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
    setPositionYDisplay(
      Math.round((window.innerHeight * 0.8 - 30 - 2 * 50 + 5) * 10) / 10
    );
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

  // Wedge angle
  const [wedge, setWedge] = useState(false);
  const [wedgeHeight, setWedgeHeight] = useState(
    Math.tan((26 * Math.PI) / 180) * 400
  );
  const [wedgeWidth, setWedgeWidth] = useState(400);
  const [wedgeAngle, setWedgeAngle] = React.useState<
    number | string | Array<number | string>
  >(26);

  const changeWedgeAngle = (angle: number) => {
    setWedgeAngle(angle);
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
    setPositionXDisplay(
      Math.round((window.innerWidth * 0.7 * 0.5 - 200) * 10) / 10
    );
    setPositionYDisplay(Math.round(yPos * 10) / 10);
    setDisplayChange(!displayChange);

    if (mode == "Freeform") {
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
    } else if (mode == "Review") {
      setPendulum(false);
      addWedge();
      setShowAcceleration(false);
      setShowVelocity(false);
      setShowForces(true);
      // hack to make sure weight positioned correctly
      setTimeout(() => {
        generateNewQuestion();
      }, 5);
    }
  }, [mode, topic]);

  const updateReviewForcesBasedOnCoefficient = (coefficient: number) => {
    setReviewGravityMagnitude(forceOfGravity.magnitude);
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(
      forceOfGravity.magnitude * Math.cos((Number(wedgeAngle) * Math.PI) / 180)
    );
    setReviewNormalAngle(180 - 90 - Number(wedgeAngle));
    let yForce = -forceOfGravity.magnitude;
    yForce +=
      9.81 *
      Math.cos((Number(wedgeAngle) * Math.PI) / 180) *
      Math.sin(((180 - 90 - Number(wedgeAngle)) * Math.PI) / 180);
    yForce +=
      coefficient *
      9.81 *
      Math.cos((Number(wedgeAngle) * Math.PI) / 180) *
      Math.sin(((180 - Number(wedgeAngle)) * Math.PI) / 180);
    let friction =
      coefficient * 9.81 * Math.cos((Number(wedgeAngle) * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(
          forceOfGravity.magnitude *
          Math.cos((Number(wedgeAngle) * Math.PI) / 180)
        ) *
          Math.sin(((180 - 90 - Number(wedgeAngle)) * Math.PI) / 180) +
          forceOfGravity.magnitude) /
        Math.sin(((180 - Number(wedgeAngle)) * Math.PI) / 180);
    }
    setReviewStaticMagnitude(friction);
    setReviewStaticAngle(180 - Number(wedgeAngle));
  };

  const updateReviewForcesBasedOnAngle = (angle: number) => {
    setReviewGravityMagnitude(9.81);
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(9.81 * Math.cos((Number(angle) * Math.PI) / 180));
    setReviewNormalAngle(180 - 90 - angle);
    let yForce = -forceOfGravity.magnitude;
    yForce +=
      9.81 *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((180 - 90 - Number(angle)) * Math.PI) / 180);
    yForce +=
      Number(coefficientOfStaticFriction) *
      9.81 *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((180 - Number(angle)) * Math.PI) / 180);
    let friction =
      Number(coefficientOfStaticFriction) *
      9.81 *
      Math.cos((Number(angle) * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(9.81 * Math.cos((Number(angle) * Math.PI) / 180)) *
          Math.sin(((180 - 90 - Number(angle)) * Math.PI) / 180) +
          forceOfGravity.magnitude) /
        Math.sin(((180 - Number(angle)) * Math.PI) / 180);
    }
    setReviewStaticMagnitude(friction);
    setReviewStaticAngle(180 - angle);
  };

  const getAnswers = (
    question: {
      questionSetup: string[];
      variablesForQuestionSetup: string[];
      question: string;
      answerParts: string[];
      answerSolutionDescriptions: string[];
      goal: string;
    },
    questionVars: number[]
  ) => {
    const solutions: number[] = [];

    let theta: number = Number(wedgeAngle);
    let index = question.variablesForQuestionSetup.indexOf("theta - max 45");
    if (index >= 0) {
      theta = questionVars[index];
    }
    let muS: number = Number(coefficientOfStaticFriction);
    index = question.variablesForQuestionSetup.indexOf(
      "coefficient of static friction"
    );
    if (index >= 0) {
      muS = questionVars[index];
    }

    for (let i = 0; i < question.answerSolutionDescriptions.length; i++) {
      const description = question.answerSolutionDescriptions[i];
      if (!isNaN(Number(description))) {
        solutions.push(Number(description));
      } else if (description == "solve normal force angle from wedge angle") {
        solutions.push(180 - 90 - theta);
      } else if (
        description == "solve normal force magnitude from wedge angle"
      ) {
        solutions.push(
          forceOfGravity.magnitude * Math.cos((theta / 180) * Math.PI)
        );
      } else if (
        description ==
        "solve static force magnitude from wedge angle given equilibrium"
      ) {
        let normalForceMagnitude =
          forceOfGravity.magnitude * Math.cos((theta / 180) * Math.PI);
        let normalForceAngle = 180 - 90 - theta;
        let frictionForceAngle = 180 - theta;
        let frictionForceMagnitude =
          (-normalForceMagnitude *
            Math.sin((normalForceAngle * Math.PI) / 180) +
            9.81) /
          Math.sin((frictionForceAngle * Math.PI) / 180);
        solutions.push(frictionForceMagnitude);
      } else if (
        description ==
        "solve static force angle from wedge angle given equilibrium"
      ) {
        solutions.push(180 - theta);
      } else if (
        description ==
        "solve minimum static coefficient from wedge angle given equilibrium"
      ) {
        let normalForceMagnitude =
          forceOfGravity.magnitude * Math.cos((theta / 180) * Math.PI);
        let normalForceAngle = 180 - 90 - theta;
        let frictionForceAngle = 180 - theta;
        let frictionForceMagnitude =
          (-normalForceMagnitude *
            Math.sin((normalForceAngle * Math.PI) / 180) +
            9.81) /
          Math.sin((frictionForceAngle * Math.PI) / 180);
        let frictionCoefficient = frictionForceMagnitude / normalForceMagnitude;
        solutions.push(frictionCoefficient);
      } else if (
        description ==
        "solve maximum wedge angle from coefficient of static friction given equilibrium"
      ) {
        // to do solve
      }
    }
    console.log(solutions); // used for debugging/testing
    setSelectedSolutions(solutions);
  };

  const checkAnswers = (showAlert: boolean = true) => {
    let error: boolean = false;
    let epsilon: number = 0.01;
    if (selectedQuestion) {
      for (let i = 0; i < selectedQuestion.answerParts.length; i++) {
        if (selectedQuestion.answerParts[i] == "force of gravity") {
          if (
            Math.abs(reviewGravityMagnitude - selectedSolutions[i]) > epsilon
          ) {
            error = true;
          }
        } else if (selectedQuestion.answerParts[i] == "angle of gravity") {
          if (Math.abs(reviewGravityAngle - selectedSolutions[i]) > epsilon) {
            error = true;
          }
        } else if (selectedQuestion.answerParts[i] == "normal force") {
          if (
            Math.abs(reviewNormalMagnitude - selectedSolutions[i]) > epsilon
          ) {
            error = true;
          }
        } else if (selectedQuestion.answerParts[i] == "angle of normal force") {
          if (Math.abs(reviewNormalAngle - selectedSolutions[i]) > epsilon) {
            error = true;
          }
        } else if (
          selectedQuestion.answerParts[i] == "force of static friction"
        ) {
          if (
            Math.abs(reviewStaticMagnitude - selectedSolutions[i]) > epsilon
          ) {
            error = true;
          }
        } else if (
          selectedQuestion.answerParts[i] == "angle of static friction"
        ) {
          if (Math.abs(reviewStaticAngle - selectedSolutions[i]) > epsilon) {
            error = true;
          }
        } else if (
          selectedQuestion.answerParts[i] == "coefficient of static friction"
        ) {
          if (
            Math.abs(
              Number(coefficientOfStaticFriction) - selectedSolutions[i]
            ) > epsilon
          ) {
            error = true;
          }
        }
      }
    }
    if (showAlert) {
      if (!error) {
        setSimulationPaused(false);
        setTimeout(() => {
          setSimulationPaused(true);
        }, 3000);
        setCorrectMessageVisible(true);
      } else {
        setSimulationPaused(false);
        setTimeout(() => {
          setSimulationPaused(true);
        }, 3000);
        setIncorrectMessageVisible(true);
      }
    }
    if (selectedQuestion.goal == "noMovement")
      if (!error) {
        setNoMovement(true);
      } else {
        setNoMovement(false);
      }
  };

  const generateNewQuestion = () => {
    setReviewGravityMagnitude(0);
    setReviewGravityAngle(0);
    setReviewNormalMagnitude(0);
    setReviewNormalAngle(0);
    setReviewStaticMagnitude(0);
    setReviewStaticAngle(0);
    setCoefficientOfKineticFriction(0);
    setCoefficientOfStaticFriction(0);

    const vars: number[] = [];

    if (topic == "Incline Plane") {
      if (questionNumber == questions.inclinePlane.length - 1) {
        setQuestionNumber(0);
      } else {
        setQuestionNumber(questionNumber + 1);
      }
      setSelectedQuestion(questions.inclinePlane[questionNumber]);

      for (
        let i = 0;
        i <
        questions.inclinePlane[questionNumber].variablesForQuestionSetup.length;
        i++
      ) {
        if (
          questions.inclinePlane[questionNumber].variablesForQuestionSetup[i] ==
          "theta - max 45"
        ) {
          let randValue = Math.floor(Math.random() * 44 + 1);
          vars.push(randValue);
          changeWedgeAngle(randValue);
        } else if (
          questions.inclinePlane[questionNumber].variablesForQuestionSetup[i] ==
          "coefficient of static friction"
        ) {
          let randValue = Math.round(Math.random() * 1000) / 1000;
          vars.push(randValue);
          setCoefficientOfStaticFriction(randValue);
        }
        //TODO add other vars
      }
      setSelectedQuestionVariables(vars);
      getAnswers(questions.inclinePlane[questionNumber], vars);
    }
  };

  useEffect(() => {
    let q = "";
    if (selectedQuestion) {
      for (let i = 0; i < selectedQuestion.questionSetup.length; i++) {
        q += selectedQuestion.questionSetup[i];
        if (i != selectedQuestion.questionSetup.length - 1) {
          q += selectedQuestionVariables[i];
          if (selectedQuestion.variablesForQuestionSetup[i].includes("theta")) {
            q +=
              " degree (≈" +
              Math.round(
                (1000 * (selectedQuestionVariables[i] * Math.PI)) / 180
              ) /
                1000 +
              " rad)";
          }
        }
      }
      setSelectedQuestionQuestion(selectedQuestion.question);
    }
    setfullQuestionSetup(q);
  }, [selectedQuestion, selectedQuestionVariables]);

  const [reviewGravityMagnitude, setReviewGravityMagnitude] =
    useState<number>(0);
  const [reviewGravityAngle, setReviewGravityAngle] = useState<number>(0);
  const [reviewNormalMagnitude, setReviewNormalMagnitude] = useState<number>(0);
  const [reviewNormalAngle, setReviewNormalAngle] = useState<number>(0);
  const [reviewStaticMagnitude, setReviewStaticMagnitude] = useState<number>(0);
  const [reviewStaticAngle, setReviewStaticAngle] = useState<number>(0);

  //TODO update review forces
  useEffect(() => {
    if (mode == "Review") {
      const forceOfGravityReview: IForce = {
        description: "Gravity",
        magnitude: reviewGravityMagnitude,
        directionInDegrees: reviewGravityAngle,
      };
      const normalForceReview: IForce = {
        description: "Normal Force",
        magnitude: reviewNormalMagnitude,
        directionInDegrees: reviewNormalAngle,
      };
      const staticFrictionForceReview: IForce = {
        description: "Static Friction Force",
        magnitude: reviewStaticMagnitude,
        directionInDegrees: reviewStaticAngle,
      };
      setStartForces([
        forceOfGravityReview,
        normalForceReview,
        staticFrictionForceReview,
      ]);
      setUpdatedForces([
        forceOfGravityReview,
        normalForceReview,
        staticFrictionForceReview,
      ]);
    }
  }, [
    reviewGravityMagnitude,
    reviewGravityAngle,
    reviewNormalMagnitude,
    reviewNormalAngle,
    reviewStaticMagnitude,
    reviewStaticAngle,
  ]);

  useEffect(() => {
    let answerInput = [];
    if (selectedQuestion) {
      for (let i = 0; i < selectedQuestion.answerParts.length; i++) {
        if (selectedQuestion.answerParts[i] == "force of gravity") {
          answerInput.push(
            <InputField
              label={
                <p>
                  F<sub>G</sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewGravityMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewGravityMagnitude}
            />
          );
        } else if (selectedQuestion.answerParts[i] == "angle of gravity") {
          answerInput.push(
            <InputField
              label={
                <p>
                  &theta;<sub>G</sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewGravityAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewGravityAngle}
              radianEquivalent={true}
            />
          );
        } else if (selectedQuestion.answerParts[i] == "normal force") {
          answerInput.push(
            <InputField
              label={
                <p>
                  F<sub>N</sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewNormalMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewNormalMagnitude}
            />
          );
        } else if (selectedQuestion.answerParts[i] == "angle of normal force") {
          answerInput.push(
            <InputField
              label={
                <p>
                  &theta;<sub>N</sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewNormalAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewNormalAngle}
              radianEquivalent={true}
            />
          );
        } else if (
          selectedQuestion.answerParts[i] == "force of static friction"
        ) {
          answerInput.push(
            <InputField
              label={
                <p>
                  F
                  <sub>
                    F<sub>s</sub>
                  </sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewStaticMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewStaticMagnitude}
            />
          );
        } else if (
          selectedQuestion.answerParts[i] == "angle of static friction"
        ) {
          answerInput.push(
            <InputField
              label={
                <p>
                  &theta;
                  <sub>
                    F<sub>s</sub>
                  </sub>
                </p>
              }
              lowerBound={0}
              changeValue={setReviewStaticAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewStaticAngle}
              radianEquivalent={true}
            />
          );
        } else if (
          selectedQuestion.answerParts[i] == "coefficient of static friction"
        ) {
          updateReviewForcesBasedOnCoefficient(0);
          answerInput.push(
            <InputField
              label={
                <p>
                  &mu;<sub>s</sub>
                </p>
              }
              lowerBound={0}
              changeValue={setCoefficientOfStaticFriction}
              step={0.1}
              unit={""}
              upperBound={1}
              value={coefficientOfStaticFriction}
              effect={updateReviewForcesBasedOnCoefficient}
            />
          );
        } else if (selectedQuestion.answerParts[i] == "wedge angle") {
          changeWedgeAngle(0);
          updateReviewForcesBasedOnAngle(0);
          answerInput.push(
            <InputField
              label={<p>&theta;</p>}
              lowerBound={0}
              changeValue={setWedgeAngle}
              step={1}
              unit={"°"}
              radianEquivalent={true}
              upperBound={49}
              value={wedgeAngle}
              effect={(val: number) => {
                changeWedgeAngle(val);
                updateReviewForcesBasedOnAngle(val);
              }}
            />
          );
        }
      }
    }

    setAnswerInputs(
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "left" }}
      >
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
            <div className="alerts">
              {correctMessageVisible && (
                <Alert
                  severity="success"
                  onClose={() => {
                    setCorrectMessageVisible(false);
                  }}
                >
                  Correct!
                </Alert>
              )}
            </div>
            <div className="alerts">
              {incorrectMessageVisible && (
                <Alert
                  severity="error"
                  onClose={() => {
                    setIncorrectMessageVisible(false);
                  }}
                >
                  Not quite!
                </Alert>
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
                        noMovement={noMovement}
                        mode={mode}
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
          <div>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
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
                    checkAnswers();
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
                <div>
                  <InputField
                    label={<p>&theta;</p>}
                    lowerBound={0}
                    changeValue={setWedgeAngle}
                    step={1}
                    unit={"°"}
                    upperBound={79}
                    value={wedgeAngle}
                    effect={changeWedgeAngle}
                  />
                  <InputField
                    label={
                      <p>
                        &mu;<sub>s</sub>
                      </p>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfStaticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={1}
                    value={coefficientOfStaticFriction}
                    effect={updateForcesWithFriction}
                  />
                  <InputField
                    label={
                      <p>
                        &mu;<sub>k</sub>
                      </p>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfKineticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={Number(coefficientOfStaticFriction)}
                    value={coefficientOfKineticFriction}
                  />
                </div>
              )}
              {wedge && !simulationPaused && (
                <Typography>
                  &theta;: {Math.round(Number(wedgeAngle) * 100) / 100}
                  °<br />
                  &mu; <sub>s</sub>: {coefficientOfStaticFriction}
                  <br />
                  &mu; <sub>k</sub>: {coefficientOfKineticFriction}
                </Typography>
              )}
              {pendulum && !simulationPaused && (
                <Typography>
                  &theta;:{" "}
                  {Math.round(((pendulumAngle * 180) / Math.PI) * 100) / 100}°
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
                          Equation: x<sub>1</sub>
                          =x
                          <sub>0</sub>
                          +v
                          <sub>0</sub>
                          t+0.5at
                          <sup>2</sup>
                          <br />
                          Units: m
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
                          Equation: v<sub>1</sub>
                          =v
                          <sub>0</sub>
                          +at
                          <br />
                          Units: m/s
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
                          Equation: a=F/m
                          <br />
                          Units: m/s
                          <sup>2</sup>
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
