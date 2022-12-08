import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
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
import { styled } from "@mui/material/styles";
import { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import "./App.scss";
import { InputField } from "./InputField";
import questions from "./Questions.json";
import tutorials from "./Tutorial.json";
import { IWallProps, Wall } from "./Wall";
import { Wedge } from "./Wedge";
import { CoordinateSystem } from "./CoordinateSystem";
import { IForce, Weight } from "./Weight";
import { Description } from "@mui/icons-material";

interface VectorTemplate {
  top: number;
  left: number;
  width: number;
  height: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weightX: number;
  weightY: number;
}
interface QuestionTemplate {
  questionSetup: string[];
  variablesForQuestionSetup: string[];
  question: string;
  answerParts: string[];
  answerSolutionDescriptions: string[];
  goal: string;
  hints: { description: string; content: string }[];
}

interface TutorialTemplate {
  question: string;
  steps: {
    description: string;
    content: string;
    forces: {
      description: string;
      magnitude: number;
      directionInDegrees: number;
    }[];
    showMagnitude: boolean;
  }[];
}

function App() {
  // Constants
  const gravityMagnitude = 9.81;
  const forceOfGravity: IForce = {
    description: "Gravity",
    magnitude: gravityMagnitude,
    directionInDegrees: 270,
  };
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
  const xMin = 0;
  const yMin = 0;
  const xMax = window.innerWidth * 0.7;
  const yMax = window.innerHeight * 0.8;
  const color = `rgba(0,0,0,0.5)`;

  // Variables
  let questionVariables: number[] = [];
  let reviewCoefficient: number = 0;

  // State variables
  const [startPosX, setStartPosX] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const [accelerationXDisplay, setAccelerationXDisplay] = useState(0);
  const [accelerationYDisplay, setAccelerationYDisplay] = useState(0);
  const [adjustPendulumAngle, setAdjustPendulumAngle] = useState<{
    angle: number;
    length: number;
  }>({ angle: 0, length: 0 });
  const [answerInputFields, setAnswerInputFields] = useState(<div></div>);
  const [coefficientOfKineticFriction, setCoefficientOfKineticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const [coefficientOfStaticFriction, setCoefficientOfStaticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const [currentForceSketch, setCurrentForceSketch] =
    useState<VectorTemplate | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [displayChange, setDisplayChange] = useState<{
    xDisplay: number;
    yDisplay: number;
  }>({ xDisplay: 0, yDisplay: 0 });
  const [elasticCollisions, setElasticCollisions] = useState<boolean>(false);
  const [forceSketches, setForceSketches] = useState<VectorTemplate[]>([]);
  const [questionPartOne, setQuestionPartOne] = useState<string>("");
  const [hintDialogueOpen, setHintDialogueOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("Freeform");
  const [noMovement, setNoMovement] = useState(false);
  const [weight, setWeight] = useState(false);
  const [pendulum, setPendulum] = useState(false);
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [pendulumLength, setPendulumLength] = useState(0);
  const [positionXDisplay, setPositionXDisplay] = useState(0);
  const [positionYDisplay, setPositionYDisplay] = useState(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [reviewGravityAngle, setReviewGravityAngle] = useState<number>(0);
  const [reviewGravityMagnitude, setReviewGravityMagnitude] =
    useState<number>(0);
  const [reviewNormalAngle, setReviewNormalAngle] = useState<number>(0);
  const [reviewNormalMagnitude, setReviewNormalMagnitude] = useState<number>(0);
  const [reviewStaticAngle, setReviewStaticAngle] = useState<number>(0);
  const [reviewStaticMagnitude, setReviewStaticMagnitude] = useState<number>(0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionTemplate>(
    questions.inclinePlane[0]
  );
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialTemplate>(
    tutorials.inclinePlane
  );
  const [questionPartTwo, setQuestionPartTwo] = useState<string>("");
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [showAcceleration, setShowAcceleration] = useState<boolean>(false);
  const [showForces, setShowForces] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(false);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(true);
  const [simulationReset, setSimulationReset] = useState<boolean>(false);
  const [simulationType, setSimulationType] =
    useState<string>("Inclined Plane");
  const [sketching, setSketching] = useState(false);
  const [startForces, setStartForces] = useState<IForce[]>([forceOfGravity]);
  const [startPendulumAngle, setStartPendulumAngle] = useState(0);
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [updatedForces, setUpdatedForces] = useState<IForce[]>([
    forceOfGravity,
  ]);
  const [velocityXDisplay, setVelocityXDisplay] = useState(0);
  const [velocityYDisplay, setVelocityYDisplay] = useState(0);
  const [wallPositions, setWallPositions] = useState<IWallProps[]>([]);
  const [wedge, setWedge] = useState(false);
  const [wedgeAngle, setWedgeAngle] = React.useState<
    number | string | Array<number | string>
  >(26);
  const [wedgeHeight, setWedgeHeight] = useState(
    Math.tan((26 * Math.PI) / 180) * 400
  );
  const [wedgeWidth, setWedgeWidth] = useState(400);

  // Add a free weight to the simulation
  const addWeight = () => {
    setWeight(true);
    setWedge(false);
    setPendulum(false);
  };

  // Add a wedge with a free weight to the simulation
  const addWedge = () => {
    setWeight(true);
    setWedge(true);
    setPendulum(false);
  };

  // Add a simple pendulum to the simulation
  const addPendulum = () => {
    setWeight(true);
    setPendulum(true);
    setWedge(false);
  };

  // Update forces when coefficient of static friction changes in freeform mode
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

  // Change wedge height and width and weight position to match new wedge angle
  const changeWedgeBasedOnNewAngle = (angle: number) => {
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

    setStartPosX(Math.round((xMax * 0.5 - 200) * 10) / 10);
    setStartPosY(getDisplayYPos(yPos));
    if (mode == "Freeform") {
      updateForcesWithFriction(
        Number(coefficientOfStaticFriction),
        width,
        height
      );
    }
  };

  // Helper function to go between display and real values
  const getDisplayYPos = (yPos: number) => {
    return yMax - yPos - 2 * 50 + 5;
  };

  // In review mode, update forces when coefficient of static friction changed
  const updateReviewForcesBasedOnCoefficient = (coefficient: number) => {
    let theta: number = Number(wedgeAngle);
    let index =
      selectedQuestion.variablesForQuestionSetup.indexOf("theta - max 45");
    if (index >= 0) {
      theta = questionVariables[index];
    }
    if (isNaN(theta)) {
      return;
    }
    setReviewGravityMagnitude(forceOfGravity.magnitude);
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(
      forceOfGravity.magnitude * Math.cos((theta * Math.PI) / 180)
    );
    setReviewNormalAngle(90 - theta);
    let yForce = -forceOfGravity.magnitude;
    yForce +=
      9.81 *
      Math.cos((theta * Math.PI) / 180) *
      Math.sin(((90 - theta) * Math.PI) / 180);
    yForce +=
      coefficient *
      9.81 *
      Math.cos((theta * Math.PI) / 180) *
      Math.sin(((180 - theta) * Math.PI) / 180);
    let friction = coefficient * 9.81 * Math.cos((theta * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(forceOfGravity.magnitude * Math.cos((theta * Math.PI) / 180)) *
          Math.sin(((90 - theta) * Math.PI) / 180) +
          forceOfGravity.magnitude) /
        Math.sin(((180 - theta) * Math.PI) / 180);
    }
    setReviewStaticMagnitude(friction);
    setReviewStaticAngle(180 - theta);
  };

  // In review mode, update forces when wedge angle changed
  const updateReviewForcesBasedOnAngle = (angle: number) => {
    setReviewGravityMagnitude(9.81);
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(9.81 * Math.cos((Number(angle) * Math.PI) / 180));
    setReviewNormalAngle(90 - angle);
    let yForce = -forceOfGravity.magnitude;
    yForce +=
      9.81 *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((90 - Number(angle)) * Math.PI) / 180);
    yForce +=
      reviewCoefficient *
      9.81 *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((180 - Number(angle)) * Math.PI) / 180);
    let friction =
      reviewCoefficient * 9.81 * Math.cos((Number(angle) * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(9.81 * Math.cos((Number(angle) * Math.PI) / 180)) *
          Math.sin(((90 - Number(angle)) * Math.PI) / 180) +
          forceOfGravity.magnitude) /
        Math.sin(((180 - Number(angle)) * Math.PI) / 180);
    }
    setReviewStaticMagnitude(friction);
    setReviewStaticAngle(180 - angle);
  };

  // Solve for the correct answers to the generated problem
  const getAnswersToQuestion = (
    question: QuestionTemplate,
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
        solutions.push(90 - theta);
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
        let normalForceAngle = 90 - theta;
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
        let normalForceAngle = 90 - theta;
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
        solutions.push((Math.atan(muS) * 180) / Math.PI);
      }
    }
    setSelectedSolutions(solutions);
    return solutions;
  };

  // In review mode, check if input answers match correct answers and optionally generate alert
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
        } else if (selectedQuestion.answerParts[i] == "wedge angle") {
          if (Math.abs(Number(wedgeAngle) - selectedSolutions[i]) > epsilon) {
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
      } else {
        setSimulationPaused(false);
        setTimeout(() => {
          setSimulationPaused(true);
        }, 3000);
      }
    }
    if (selectedQuestion.goal == "noMovement") {
      if (!error) {
        setNoMovement(true);
      } else {
        setNoMovement(false);
      }
    }
  };

  const resetReviewValuesToDefault = () => {
    // Reset all values to default
    setReviewGravityMagnitude(0);
    setReviewGravityAngle(0);
    setReviewNormalMagnitude(0);
    setReviewNormalAngle(0);
    setReviewStaticMagnitude(0);
    setReviewStaticAngle(0);
    setCoefficientOfKineticFriction(0);
    setSimulationPaused(true);
    setAnswerInputFields(<div></div>);
  };

  // In review mode, edit force arrow sketch on mouse movement
  const editForce = (element: VectorTemplate) => {
    if (!sketching) {
      const sketches = forceSketches.filter((sketch) => sketch != element);
      setForceSketches(sketches);
      setCurrentForceSketch(element);
      setSketching(true);
    }
  };

  // In review mode, used to delete force arrow sketch on SHIFT+click
  const deleteForce = (element: VectorTemplate) => {
    if (!sketching) {
      const sketches = forceSketches.filter((sketch) => sketch != element);
      setForceSketches(sketches);
    }
  };

  // In review mode, reset problem variables and generate a new question
  const generateNewQuestion = () => {
    resetReviewValuesToDefault();

    const vars: number[] = [];
    let question: QuestionTemplate = questions.inclinePlane[0];

    if (simulationType == "Inclined Plane") {
      if (questionNumber == questions.inclinePlane.length - 1) {
        setQuestionNumber(0);
      } else {
        setQuestionNumber(questionNumber + 1);
      }
      question = questions.inclinePlane[questionNumber];

      let coefficient = 0;
      let wedge = 0;

      for (let i = 0; i < question.variablesForQuestionSetup.length; i++) {
        if (question.variablesForQuestionSetup[i] == "theta - max 45") {
          let randValue = Math.floor(Math.random() * 44 + 1);
          vars.push(randValue);
          wedge = randValue;
        } else if (
          question.variablesForQuestionSetup[i] ==
          "coefficient of static friction"
        ) {
          let randValue = Math.round(Math.random() * 1000) / 1000;
          vars.push(randValue);
          coefficient = randValue;
        }
      }
      setWedgeAngle(wedge);
      changeWedgeBasedOnNewAngle(wedge);
      setCoefficientOfStaticFriction(coefficient);
      reviewCoefficient = coefficient;
    }
    let q = "";
    for (let i = 0; i < question.questionSetup.length; i++) {
      q += question.questionSetup[i];
      if (i != question.questionSetup.length - 1) {
        q += vars[i];
        if (question.variablesForQuestionSetup[i].includes("theta")) {
          q +=
            " degree (≈" +
            Math.round((1000 * (vars[i] * Math.PI)) / 180) / 1000 +
            " rad)";
        }
      }
    }
    questionVariables = vars;
    setSelectedQuestion(question);
    setQuestionPartOne(q);
    setQuestionPartTwo(question.question);
    const answers = getAnswersToQuestion(question, vars);
    generateInputFieldsForQuestion(false, question, answers);
  };

  // Generate answerInputFields for new review question
  const generateInputFieldsForQuestion = (
    showIcon: boolean = false,
    question: QuestionTemplate = selectedQuestion,
    answers: number[] = selectedSolutions
  ) => {
    let answerInput = [];
    const d = new Date();
    for (let i = 0; i < question.answerParts.length; i++) {
      if (question.answerParts[i] == "force of gravity") {
        setReviewGravityMagnitude(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of gravity") {
        setReviewGravityAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "normal force") {
        setReviewNormalMagnitude(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of normal force") {
        setReviewNormalAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "force of static friction") {
        setReviewStaticMagnitude(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of static friction") {
        setReviewStaticAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
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
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "coefficient of static friction") {
        updateReviewForcesBasedOnCoefficient(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit">
                        &mu;<sub>s</sub>
                      </Typography>
                      Coefficient of static friction; between 0 and 1
                    </React.Fragment>
                  }
                  followCursor
                >
                  <Box>
                    &mu;<sub>s</sub>
                  </Box>
                </Tooltip>
              }
              lowerBound={0}
              changeValue={setCoefficientOfStaticFriction}
              step={0.1}
              unit={""}
              upperBound={1}
              value={coefficientOfStaticFriction}
              effect={updateReviewForcesBasedOnCoefficient}
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      } else if (question.answerParts[i] == "wedge angle") {
        updateReviewForcesBasedOnAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit">&theta;</Typography>
                      Angle of incline plane from the ground, 0-49
                    </React.Fragment>
                  }
                  followCursor
                >
                  <Box>&theta;</Box>
                </Tooltip>
              }
              lowerBound={0}
              changeValue={setWedgeAngle}
              step={1}
              unit={"°"}
              upperBound={49}
              value={wedgeAngle}
              effect={(val: number) => {
                changeWedgeBasedOnNewAngle(val);
                updateReviewForcesBasedOnAngle(val);
              }}
              radianEquivalent={true}
              showIcon={showIcon}
              correctValue={answers[i]}
            />
          </div>
        );
      }
    }

    setAnswerInputFields(
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "left" }}
      >
        {answerInput}
      </div>
    );
  };

  // Remove floor and walls from simulation
  const removeWalls = () => {
    setWallPositions([]);
  };

  // Add floor and walls to simulation
  const addWalls = () => {
    if (wallPositions.length == 0) {
      const walls: IWallProps[] = [];
      walls.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
      walls.push({ length: 80, xPos: 0, yPos: 0, angleInDegrees: 90 });
      walls.push({ length: 80, xPos: 69.5, yPos: 0, angleInDegrees: 90 });
      setWallPositions(walls);
    }
  };

  // Use effect hook to handle mode/topic change
  useEffect(() => {
    if (mode == "Freeform") {
      setShowForceMagnitudes(true);
      if (simulationType == "Free Weight") {
        addWeight();
        setStartPosY(yMin + 50);
        setStartPosX((xMax + xMin - 50) / 2);
        setPositionXDisplay((xMax + xMin - 50) / 2);
        setPositionXDisplay(getDisplayYPos(yMin + 50));
        setUpdatedForces([forceOfGravity]);
        setStartForces([forceOfGravity]);
        addWalls();
        setSimulationReset(!simulationReset);
      } else if (simulationType == "Inclined Plane") {
        addWedge();
        changeWedgeBasedOnNewAngle(26);
        addWalls();
        setStartForces([forceOfGravity]);
        updateForcesWithFriction(Number(coefficientOfStaticFriction));
      } else if (simulationType == "Pendulum") {
        const length = 300;
        const angle = 50;
        const x = length * Math.cos(((90 - angle) * Math.PI) / 180);
        const y = length * Math.sin(((90 - angle) * Math.PI) / 180);
        const xPos = xMax / 2 - x - 50;
        const yPos = y - 50 - 5;
        addPendulum();
        setStartPosX(xPos);
        setStartPosY(yPos);
        const mag = 9.81 * Math.cos((50 * Math.PI) / 180);
        const forceOfTension: IForce = {
          description: "Tension",
          magnitude: mag,
          directionInDegrees: 90 - angle,
        };
        setUpdatedForces([forceOfGravity, forceOfTension]);
        setStartForces([forceOfGravity, forceOfTension]);
        setAdjustPendulumAngle({ angle: 50, length: 300 });
        removeWalls();
      }
    } else if (mode == "Review") {
      setShowForceMagnitudes(true);
      if (simulationType == "Inclined Plane") {
        addWedge();
        setUpdatedForces([]);
        setStartForces([]);
        addWalls();
      }
      setShowAcceleration(false);
      setShowVelocity(false);
      setShowForces(true);
      generateNewQuestion();
    } else if (mode == "Tutorial") {
      if (simulationType == "Free Weight") {
        addWeight();
        setStartPosY(100);
        setStartPosX((xMax + xMin + 50) / 2);
        setSelectedTutorial(tutorials.freeWeight);
        setSelectedTutorial(tutorials.freeWeight);
        setStartForces(getForceFromJSON(tutorials.freeWeight.steps[0].forces));
        setShowForceMagnitudes(tutorials.freeWeight.steps[0].showMagnitude);
        addWalls();
      } else if (simulationType == "Pendulum") {
        const length = 300;
        const angle = 30;
        const x = length * Math.cos(((90 - angle) * Math.PI) / 180);
        const y = length * Math.sin(((90 - angle) * Math.PI) / 180);
        const xPos = xMax / 2 - x - 50;
        const yPos = y - 50 - 5;
        addPendulum();
        setStartPosX(xPos);
        setStartPosY(yPos);
        setSelectedTutorial(tutorials.pendulum);
        setStartForces(getForceFromJSON(tutorials.pendulum.steps[0].forces));
        setShowForceMagnitudes(tutorials.pendulum.steps[0].showMagnitude);
        setAdjustPendulumAngle({ angle: 30, length: 300 });
        removeWalls();
      } else if (simulationType == "Inclined Plane") {
        addWedge();
        setWedgeAngle(26);
        changeWedgeBasedOnNewAngle(26);
        setSelectedTutorial(tutorials.inclinePlane);
        setStartForces(
          getForceFromJSON(tutorials.inclinePlane.steps[0].forces)
        );
        setShowForceMagnitudes(tutorials.inclinePlane.steps[0].showMagnitude);
        addWalls();
      }
      setSimulationReset(!simulationReset);
    }
  }, [simulationType, mode]);

  const [showForceMagnitudes, setShowForceMagnitudes] = useState<boolean>(true);

  const getForceFromJSON = (
    json: {
      description: string;
      magnitude: number;
      directionInDegrees: number;
    }[]
  ): IForce[] => {
    const forces: IForce[] = [];
    for (let i = 0; i < json.length; i++) {
      const force: IForce = {
        description: json[i].description,
        magnitude: json[i].magnitude,
        directionInDegrees: json[i].directionInDegrees,
      };
      forces.push(force);
    }
    return forces;
  };

  // Use effect hook to handle force change in review mode
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

  // Use effect to add listener for SHIFT key, which determines if sketch force arrow will be edited or deleted on click
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.shiftKey) {
        setDeleteMode(true);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.shiftKey) {
        setDeleteMode(false);
      }
    });
  }, []);

  // Timer for animating the simulation
  setInterval(() => {
    setTimer(timer + 1);
  }, 60);

  return (
    <div>
      <div className="mechanicsSimulationContainer">
        <div
          className="mechanicsSimulationContentContainer"
          onPointerMove={(e) => {
            if (sketching) {
              const x1 = positionXDisplay + 50;
              const y1 = yMax - positionYDisplay - 2 * 50 + 5 + 50;
              const x2 = e.clientX;
              const y2 = e.clientY;
              const height = Math.abs(y1 - y2) + 120;
              const width = Math.abs(x1 - x2) + 120;
              const top = Math.min(y1, y2) - 60;
              const left = Math.min(x1, x2) - 60;
              const x1Updated = x1 - left;
              const x2Updated = x2 - left;
              const y1Updated = y1 - top;
              const y2Updated = y2 - top;
              setCurrentForceSketch({
                top: top,
                left: left,
                width: width,
                height: height,
                x1: x1Updated,
                y1: y1Updated,
                x2: x2Updated,
                y2: y2Updated,
                weightX: positionXDisplay,
                weightY: positionYDisplay,
              });
            }
          }}
          onPointerDown={(e) => {
            if (sketching && currentForceSketch) {
              setSketching(false);
              const sketches = forceSketches;
              sketches.push(currentForceSketch);
              setForceSketches(sketches);
              setCurrentForceSketch(null);
            }
          }}
        >
          <div className="mechanicsSimulationButtonsAndElements">
            <div className="mechanicsSimulationButtons">
              {!simulationPaused && (
                <div
                  style={{
                    position: "fixed",
                    left: "10vw",
                    top: "95vh",
                    width: "50vw",
                  }}
                >
                  <LinearProgress />
                </div>
              )}
              <div
                style={{
                  position: "fixed",
                  top: 1 + "em",
                  left: xMin + 12 + "px",
                }}
              >
                <div className="dropdownMenu">
                  <select
                    value={simulationType}
                    onChange={(event) => {
                      setSimulationType(event.target.value);
                    }}
                    style={{ height: "2em", width: "100%", fontSize: "16px" }}
                  >
                    <option value="Free Weight">Free Weight</option>
                    <option value="Inclined Plane">Inclined Plane</option>
                    <option value="Pendulum">Pendulum</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mechanicsSimulationElements">
              {showForces && currentForceSketch && simulationPaused && (
                <div
                  style={{
                    position: "fixed",
                    top: currentForceSketch.top,
                    left: currentForceSketch.left,
                  }}
                >
                  <svg
                    width={currentForceSketch.width + "px"}
                    height={currentForceSketch.height + "px"}
                  >
                    <defs>
                      <marker
                        id="sketchArrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="0"
                        refY="2"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path d="M0,0 L0,4 L6,2 z" fill={color} />
                      </marker>
                    </defs>
                    <line
                      x1={currentForceSketch.x1}
                      y1={currentForceSketch.y1}
                      x2={currentForceSketch.x2}
                      y2={currentForceSketch.y2}
                      stroke={color}
                      strokeWidth="10"
                      markerEnd="url(#sketchArrow)"
                    />
                  </svg>
                </div>
              )}
              {showForces &&
                forceSketches.length > 0 &&
                simulationPaused &&
                forceSketches.map((element: VectorTemplate, index) => {
                  return (
                    <div
                      key={index}
                      style={{
                        position: "fixed",
                        top: element.top + (positionYDisplay - element.weightY),
                        left:
                          element.left + (positionXDisplay - element.weightX),
                      }}
                    >
                      <svg
                        width={element.width + "px"}
                        height={element.height + "px"}
                      >
                        <defs>
                          <marker
                            id="sketchArrow"
                            markerWidth="10"
                            markerHeight="10"
                            refX="0"
                            refY="2"
                            orient="auto"
                            markerUnits="strokeWidth"
                          >
                            <path d="M0,0 L0,4 L6,2 z" fill={color} />
                          </marker>
                        </defs>
                        <line
                          x1={element.x1}
                          y1={element.y1}
                          x2={element.x2}
                          y2={element.y2}
                          stroke={color}
                          strokeWidth="10"
                          markerEnd="url(#sketchArrow)"
                          onClick={() => {
                            if (deleteMode) {
                              deleteForce(element);
                            } else {
                              editForce(element);
                            }
                          }}
                        />
                      </svg>
                    </div>
                  );
                })}
              {weight && (
                <Weight
                  adjustPendulumAngle={adjustPendulumAngle}
                  color={"red"}
                  displayXPosition={positionXDisplay}
                  displayXVelocity={velocityXDisplay}
                  displayYPosition={positionYDisplay}
                  displayYVelocity={velocityYDisplay}
                  elasticCollisions={elasticCollisions}
                  incrementTime={timer}
                  mass={1}
                  mode={mode}
                  noMovement={noMovement}
                  paused={simulationPaused}
                  pendulum={pendulum}
                  pendulumAngle={pendulumAngle}
                  pendulumLength={pendulumLength}
                  radius={50}
                  reset={simulationReset}
                  showForceMagnitudes={showForceMagnitudes}
                  setSketching={setSketching}
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
                  setUpdatedForces={setUpdatedForces}
                  showAcceleration={showAcceleration}
                  showForces={showForces}
                  showVelocity={showVelocity}
                  startForces={startForces}
                  startPosX={startPosX}
                  startPosY={startPosY}
                  timestepSize={0.002}
                  updateDisplay={displayChange}
                  updatedForces={updatedForces}
                  walls={wallPositions}
                  wedge={wedge}
                  wedgeHeight={wedgeHeight}
                  wedgeWidth={wedgeWidth}
                  coefficientOfKineticFriction={Number(
                    coefficientOfKineticFriction
                  )}
                />
              )}
              {wedge && (
                <Wedge
                  startWidth={wedgeWidth}
                  startHeight={wedgeHeight}
                  startLeft={xMax * 0.5 - 200}
                />
              )}
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
              {simulationPaused && mode != "Tutorial" && (
                <Tooltip title="Start simulation" followCursor>
                  <IconButton
                    onClick={() => {
                      setSimulationPaused(false);
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
              )}
              {!simulationPaused && mode != "Tutorial" && (
                <Tooltip title="Pause simulation" followCursor>
                  <IconButton
                    onClick={() => {
                      setSimulationPaused(true);
                    }}
                  >
                    <PauseIcon />
                  </IconButton>
                </Tooltip>
              )}
              {simulationPaused && mode != "Tutorial" && (
                <Tooltip title="Reset simulation" followCursor>
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
            <div className="dropdownMenu">
              <select
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value);
                }}
                style={{ height: "2em", width: "100%", fontSize: "16px" }}
              >
                <option value="Freeform">Freeform Mode</option>
                <option value="Review">Review Mode</option>
                <option value="Tutorial">Tutorial Mode</option>
              </select>
            </div>
          </div>
          {mode == "Review" && (
            <div>
              {!hintDialogueOpen && (
                <IconButton
                  onClick={() => {
                    setHintDialogueOpen(true);
                  }}
                  sx={{
                    position: "fixed",
                    left: xMax - 50 + "px",
                    top: yMin + 14 + "px",
                  }}
                >
                  <QuestionMarkIcon />
                </IconButton>
              )}
              <Dialog
                maxWidth={"sm"}
                fullWidth={true}
                open={hintDialogueOpen}
                onClose={() => setHintDialogueOpen(false)}
              >
                <DialogTitle>Hints</DialogTitle>
                <DialogContent>
                  {selectedQuestion.hints.map((hint, index) => {
                    return (
                      <div key={index}>
                        <DialogContentText>
                          <details>
                            <summary>
                              <b>
                                Hint {index + 1}: {hint.description}
                              </b>
                            </summary>
                            {hint.content}
                          </details>
                        </DialogContentText>
                      </div>
                    );
                  })}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setHintDialogueOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
              <div className="wordProblemBox">
                <div className="question">
                  <p>{questionPartOne}</p>
                  <p>{questionPartTwo}</p>
                </div>
                <div className="answer">{answerInputFields}</div>
              </div>
            </div>
          )}
          {mode == "Tutorial" && (
            <div className="wordProblemBox">
              <div className="question">
                <h2>Problem</h2>
                <p>{selectedTutorial.question}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "spaceBetween",
                  width: "100%",
                }}
              >
                <IconButton
                  onClick={() => {
                    let step = stepNumber - 1;
                    step = Math.max(step, 0);
                    step = Math.min(step, selectedTutorial.steps.length - 1);
                    setStepNumber(step);
                    setStartForces(
                      getForceFromJSON(selectedTutorial.steps[step].forces)
                    );
                    setUpdatedForces(
                      getForceFromJSON(selectedTutorial.steps[step].forces)
                    );
                    setShowForceMagnitudes(
                      selectedTutorial.steps[step].showMagnitude
                    );
                  }}
                  disabled={stepNumber == 0}
                >
                  <ArrowLeftIcon />
                </IconButton>
                <div>
                  <h3>
                    Step {stepNumber + 1}:{" "}
                    {selectedTutorial.steps[stepNumber].description}
                  </h3>
                  <p>{selectedTutorial.steps[stepNumber].content}</p>
                </div>
                <IconButton
                  onClick={() => {
                    let step = stepNumber + 1;
                    step = Math.max(step, 0);
                    step = Math.min(step, selectedTutorial.steps.length - 1);
                    setStepNumber(step);
                    setStartForces(
                      getForceFromJSON(selectedTutorial.steps[step].forces)
                    );
                    setUpdatedForces(
                      getForceFromJSON(selectedTutorial.steps[step].forces)
                    );
                    setShowForceMagnitudes(
                      selectedTutorial.steps[step].showMagnitude
                    );
                  }}
                  disabled={stepNumber == selectedTutorial.steps.length - 1}
                >
                  <ArrowRightIcon />
                </IconButton>
              </div>
              <div>
                <p>Resources</p>
                <ul>
                  <li>
                    <a
                      href="https://www.khanacademy.org/science/physics/forces-newtons-laws#inclined-planes-friction"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      Khan Academy - Inclined Planes
                    </a>
                  </li>
                </ul>
              </div>
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
              <p
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => setMode("Tutorial")}
              >
                {" "}
                Go to walkthrough{" "}
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Button
                  onClick={() => {
                    setSimulationReset(!simulationReset);
                    checkAnswers();
                    generateInputFieldsForQuestion(true);
                  }}
                  variant="outlined"
                >
                  <Typography>Submit</Typography>
                </Button>
                <Button
                  onClick={() => generateNewQuestion()}
                  variant="outlined"
                >
                  <Typography>New question</Typography>
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
                        disabled={wedge || pendulum}
                        value={elasticCollisions}
                        onChange={() =>
                          setElasticCollisions(!elasticCollisions)
                        }
                      />
                    }
                    label="Make collisions elastic"
                    labelPlacement="start"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={showForces}
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
                    label={
                      <Tooltip
                        title={
                          <React.Fragment>
                            <Typography color="inherit">&theta;</Typography>
                            Angle of incline plane from the ground, 0-49
                          </React.Fragment>
                        }
                        followCursor
                      >
                        <Box>&theta;</Box>
                      </Tooltip>
                    }
                    lowerBound={0}
                    changeValue={setWedgeAngle}
                    step={1}
                    unit={"°"}
                    upperBound={49}
                    value={wedgeAngle}
                    effect={changeWedgeBasedOnNewAngle}
                    radianEquivalent={true}
                    mode={"Freeform"}
                  />
                  <InputField
                    label={
                      <Tooltip
                        title={
                          <React.Fragment>
                            <Typography color="inherit">
                              &mu;<sub>s</sub>
                            </Typography>
                            Coefficient of static friction, between 0 and 1
                          </React.Fragment>
                        }
                        followCursor
                      >
                        <Box>
                          &mu;<sub>s</sub>
                        </Box>
                      </Tooltip>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfStaticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={1}
                    value={coefficientOfStaticFriction}
                    effect={updateForcesWithFriction}
                    mode={"Freeform"}
                  />
                  <InputField
                    label={
                      <Tooltip
                        title={
                          <React.Fragment>
                            <Typography color="inherit">
                              &mu;<sub>k</sub>
                            </Typography>
                            Coefficient of kinetic friction, between 0 and
                            coefficient of static friction
                          </React.Fragment>
                        }
                        followCursor
                      >
                        <Box>
                          &mu;<sub>k</sub>
                        </Box>
                      </Tooltip>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfKineticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={Number(coefficientOfStaticFriction)}
                    value={coefficientOfKineticFriction}
                    mode={"Freeform"}
                  />
                </div>
              )}
              {wedge && !simulationPaused && (
                <Typography>
                  &theta;: {Math.round(Number(wedgeAngle) * 100) / 100}° ≈{" "}
                  {Math.round(((Number(wedgeAngle) * Math.PI) / 180) * 100) /
                    100}{" "}
                  rad
                  <br />
                  &mu; <sub>s</sub>: {coefficientOfStaticFriction}
                  <br />
                  &mu; <sub>k</sub>: {coefficientOfKineticFriction}
                </Typography>
              )}
              {pendulum && !simulationPaused && (
                <Typography>
                  &theta;: {Math.round(pendulumAngle * 100) / 100}° ≈{" "}
                  {Math.round(((pendulumAngle * Math.PI) / 180) * 100) / 100}{" "}
                  rad
                </Typography>
              )}
              {pendulum && simulationPaused && (
                <InputField
                  label={
                    <Tooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">&theta;</Typography>
                          Pendulum angle offest from equilibrium
                        </React.Fragment>
                      }
                      followCursor
                    >
                      <Box>&theta;</Box>
                    </Tooltip>
                  }
                  lowerBound={0}
                  changeValue={setPendulumAngle}
                  step={1}
                  unit={"°"}
                  upperBound={59}
                  value={pendulumAngle}
                  effect={(value) => {
                    if (pendulum) {
                      const mag = 1 * 9.81 * Math.cos((value * Math.PI) / 180);

                      const forceOfTension: IForce = {
                        description: "Tension",
                        magnitude: mag,
                        directionInDegrees: 90 - value,
                      };
                      setUpdatedForces([forceOfGravity, forceOfTension]);
                      setAdjustPendulumAngle({ angle: value, length: 300 });
                    }
                  }}
                  radianEquivalent={true}
                  mode={"Freeform"}
                />
              )}
            </div>
          )}
          <div className="mechanicsSimulationEquation">
            {mode == "Freeform" && weight && (
              <table>
                <tbody>
                  <tr>
                    <td>&nbsp;</td>
                    <td>X</td>
                    <td>Y</td>
                  </tr>
                  <tr>
                    <td
                      style={{ cursor: "help" }}
                      onClick={() => {
                        window.open(
                          "https://www.khanacademy.org/science/physics/two-dimensional-motion"
                        );
                      }}
                    >
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
                        followCursor
                      >
                        <Box>Position</Box>
                      </Tooltip>
                    </td>
                    <td>
                      {(!simulationPaused || wedge) && (
                        <p style={{ cursor: "default" }}>
                          {positionXDisplay} m
                        </p>
                      )}{" "}
                      {simulationPaused && !wedge && (
                        <InputField
                          lowerBound={0}
                          changeValue={setPositionXDisplay}
                          step={1}
                          unit={"m"}
                          upperBound={xMax}
                          value={positionXDisplay}
                          effect={(value) => {
                            setDisplayChange({
                              xDisplay: value,
                              yDisplay: positionYDisplay,
                            });
                          }}
                          small={true}
                          mode={"Freeform"}
                        />
                      )}{" "}
                    </td>
                    <td>
                      {(!simulationPaused || wedge) && (
                        <p style={{ cursor: "default" }}>
                          {positionYDisplay} m
                        </p>
                      )}{" "}
                      {simulationPaused && !wedge && (
                        <InputField
                          lowerBound={0}
                          changeValue={setPositionYDisplay}
                          step={1}
                          unit={"m"}
                          upperBound={yMax}
                          value={positionYDisplay}
                          effect={(value) => {
                            setDisplayChange({
                              xDisplay: positionXDisplay,
                              yDisplay: value,
                            });
                          }}
                          small={true}
                          mode={"Freeform"}
                        />
                      )}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ cursor: "help" }}
                      onClick={() => {
                        window.open(
                          "https://www.khanacademy.org/science/physics/two-dimensional-motion"
                        );
                      }}
                    >
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
                        followCursor
                      >
                        <Box>Velocity</Box>
                      </Tooltip>
                    </td>
                    <td>
                      {(!simulationPaused || pendulum || wedge) && (
                        <p style={{ cursor: "default" }}>
                          {velocityXDisplay} m/s
                        </p>
                      )}{" "}
                      {simulationPaused && !pendulum && !wedge && (
                        <InputField
                          lowerBound={-50}
                          changeValue={setVelocityXDisplay}
                          step={1}
                          unit={"m/s"}
                          upperBound={50}
                          value={velocityXDisplay}
                          effect={(value) =>
                            setDisplayChange({
                              xDisplay: positionXDisplay,
                              yDisplay: positionYDisplay,
                            })
                          }
                          small={true}
                          mode={"Freeform"}
                        />
                      )}{" "}
                    </td>
                    <td>
                      {(!simulationPaused || pendulum || wedge) && (
                        <p style={{ cursor: "default" }}>
                          {velocityYDisplay} m/s
                        </p>
                      )}{" "}
                      {simulationPaused && !pendulum && !wedge && (
                        <InputField
                          lowerBound={-50}
                          changeValue={setVelocityYDisplay}
                          step={1}
                          unit={"m/s"}
                          upperBound={50}
                          value={velocityYDisplay}
                          effect={(value) =>
                            setDisplayChange({
                              xDisplay: positionXDisplay,
                              yDisplay: positionYDisplay,
                            })
                          }
                          small={true}
                          mode={"Freeform"}
                        />
                      )}{" "}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ cursor: "help" }}
                      onClick={() => {
                        window.open(
                          "https://www.khanacademy.org/science/physics/two-dimensional-motion"
                        );
                      }}
                    >
                      <Tooltip
                        title={
                          <React.Fragment>
                            <Typography color="inherit">
                              Acceleration
                            </Typography>
                            Equation: a=F/m
                            <br />
                            Units: m/s
                            <sup>2</sup>
                          </React.Fragment>
                        }
                        followCursor
                      >
                        <Box>Acceleration</Box>
                      </Tooltip>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationXDisplay} m/s<sup>2</sup>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationYDisplay} m/s<sup>2</sup>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          {/* {mode == "Freeform" &&
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
            )}*/}
        </div>
      </div>
      <CoordinateSystem top={window.innerHeight - 120} right={xMin + 90} />
    </div>
  );
}

export default App;
