import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  LinearProgress,
  Stack,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import "./App.scss";
import { InputField } from "./InputField";
import questions from "./Questions.json";
import tutorials from "./Tutorial.json";
import { IWallProps, Wall } from "./Wall";
import { IForce, Weight } from "./Weight";

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
      component: boolean;
    }[];
    showMagnitude: boolean;
  }[];
}

function App() {
  // Constants
  const xMin = 0;
  const yMin = 0;
  const xMax = window.innerWidth * 0.7;
  const yMax = window.innerHeight * 0.8;
  const color = `rgba(0,0,0,0.5)`;
  const radius = 50;
  const wallPositions: IWallProps[] = [];
  wallPositions.push({ length: 70, xPos: 0, yPos: 0, angleInDegrees: 0 });
  wallPositions.push({ length: 70, xPos: 0, yPos: 80, angleInDegrees: 0 });
  wallPositions.push({ length: 80, xPos: 0, yPos: 0, angleInDegrees: 90 });
  wallPositions.push({ length: 80, xPos: 69.5, yPos: 0, angleInDegrees: 90 });

  // Variables
  let reviewCoefficient: number = 0;
  let questionVariables: number[] = [];

  // State variables used throughout
  const [accelerationXDisplay, setAccelerationXDisplay] = useState(0);
  const [accelerationYDisplay, setAccelerationYDisplay] = useState(0);
  const [componentForces, setComponentForces] = useState<IForce[]>([]);
  const [displayChange, setDisplayChange] = useState<{
    xDisplay: number;
    yDisplay: number;
  }>({ xDisplay: 0, yDisplay: 0 });
  const [elasticCollisions, setElasticCollisions] = useState<boolean>(false);
  const [gravity, setGravity] = useState(-9.81);
  const [mass, setMass] = useState(1);
  const [mode, setMode] = useState<string>("Freeform");
  const [positionXDisplay, setPositionXDisplay] = useState(0);
  const [positionYDisplay, setPositionYDisplay] = useState(0);
  const [resetAll, setResetAll] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState<boolean>(false);
  const [showComponentForces, setShowComponentForces] =
    useState<boolean>(false);
  const [showForces, setShowForces] = useState<boolean>(true);
  const [showForceMagnitudes, setShowForceMagnitudes] = useState<boolean>(true);
  const [showVelocity, setShowVelocity] = useState<boolean>(false);
  const [simulationPaused, setSimulationPaused] = useState<boolean>(true);
  const [simulationReset, setSimulationReset] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2);
  const [simulationType, setSimulationType] =
    useState<string>("Inclined Plane");
  const [startForces, setStartForces] = useState<IForce[]>([
    {
      description: "Gravity",
      magnitude: Math.abs(gravity) * mass,
      directionInDegrees: 270,
      component: false,
    },
  ]);
  const [startPosX, setStartPosX] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const [startVelX, setStartVelX] = useState(0);
  const [startVelY, setStartVelY] = useState(0);
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [updatedForces, setUpdatedForces] = useState<IForce[]>([]);
  const [velocityXDisplay, setVelocityXDisplay] = useState(0);
  const [velocityYDisplay, setVelocityYDisplay] = useState(0);

  // State variables used for review mode
  const [answerInputFields, setAnswerInputFields] = useState(<div></div>);
  const [currentForceSketch, setCurrentForceSketch] =
    useState<VectorTemplate | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [forceSketches, setForceSketches] = useState<VectorTemplate[]>([]);
  const [hintDialogueOpen, setHintDialogueOpen] = useState<boolean>(false);
  const [noMovement, setNoMovement] = useState(false);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [questionPartOne, setQuestionPartOne] = useState<string>("");
  const [questionPartTwo, setQuestionPartTwo] = useState<string>("");
  const [reviewGravityAngle, setReviewGravityAngle] = useState<number>(0);
  const [reviewGravityMagnitude, setReviewGravityMagnitude] =
    useState<number>(0);
  const [reviewNormalAngle, setReviewNormalAngle] = useState<number>(0);
  const [reviewNormalMagnitude, setReviewNormalMagnitude] = useState<number>(0);
  const [reviewStaticAngle, setReviewStaticAngle] = useState<number>(0);
  const [reviewStaticMagnitude, setReviewStaticMagnitude] = useState<number>(0);
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionTemplate>(
    questions.inclinePlane[0]
  );
  const [sketching, setSketching] = useState(false);

  // State variables used for tutorial mode
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialTemplate>(
    tutorials.inclinePlane
  );

  // State variables used for uniform circular motion simulation
  const [circularMotionRadius, setCircularMotionRadius] = useState(150);

  // State variables used for spring simulation
  const [springConstant, setSpringConstant] = useState(0.5);
  const [springRestLength, setSpringRestLength] = useState(200);
  const [springStartLength, setSpringStartLength] = useState(200);

  // State variables used for pendulum simulation
  const [adjustPendulumAngle, setAdjustPendulumAngle] = useState<{
    angle: number;
    length: number;
  }>({ angle: 0, length: 0 });
  const [pendulumAngle, setPendulumAngle] = useState(0);
  const [pendulumLength, setPendulumLength] = useState(300);
  const [startPendulumAngle, setStartPendulumAngle] = useState(0);

  // State variables used for wedge simulation
  const [coefficientOfKineticFriction, setCoefficientOfKineticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const [coefficientOfStaticFriction, setCoefficientOfStaticFriction] =
    React.useState<number | string | Array<number | string>>(0);
  const [wedgeAngle, setWedgeAngle] = React.useState<
    number | string | Array<number | string>
  >(26);
  const [wedgeHeight, setWedgeHeight] = useState(
    Math.tan((26 * Math.PI) / 180) * 400
  );
  const [wedgeWidth, setWedgeWidth] = useState(400);

  // State variables used for pulley simulation
  const [positionXDisplay2, setPositionXDisplay2] = useState(0);
  const [velocityXDisplay2, setVelocityXDisplay2] = useState(0);
  const [accelerationXDisplay2, setAccelerationXDisplay2] = useState(0);
  const [positionYDisplay2, setPositionYDisplay2] = useState(0);
  const [velocityYDisplay2, setVelocityYDisplay2] = useState(0);
  const [accelerationYDisplay2, setAccelerationYDisplay2] = useState(0);
  const [startPosX2, setStartPosX2] = useState(0);
  const [startPosY2, setStartPosY2] = useState(0);
  const [displayChange2, setDisplayChange2] = useState<{
    xDisplay: number;
    yDisplay: number;
  }>({ xDisplay: 0, yDisplay: 0 });
  const [startForces2, setStartForces2] = useState<IForce[]>([]);
  const [updatedForces2, setUpdatedForces2] = useState<IForce[]>([]);
  const [mass2, setMass2] = useState(1);

  // Update forces when coefficient of static friction changes in freeform mode
  const updateForcesWithFriction = (
    coefficient: number,
    width: number = wedgeWidth,
    height: number = wedgeHeight
  ) => {
    const normalForce: IForce = {
      description: "Normal Force",
      magnitude: Math.abs(gravity) * Math.cos(Math.atan(height / width)) * mass,
      directionInDegrees:
        180 - 90 - (Math.atan(height / width) * 180) / Math.PI,
      component: false,
    };
    let frictionForce: IForce = {
      description: "Static Friction Force",
      magnitude:
        coefficient *
        Math.abs(gravity) *
        Math.cos(Math.atan(height / width)) *
        mass,
      directionInDegrees: 180 - (Math.atan(height / width) * 180) / Math.PI,
      component: false,
    };
    // reduce magnitude or friction force if necessary such that block cannot slide up plane
    let yForce = -Math.abs(gravity) * mass;
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
          Math.abs(gravity) * mass) /
        Math.sin((frictionForce.directionInDegrees * Math.PI) / 180);
    }
    const frictionForceComponent: IForce = {
      description: "Static Friction Force",
      magnitude:
        coefficient * Math.abs(gravity) * Math.cos(Math.atan(height / width)),
      directionInDegrees: 180 - (Math.atan(height / width) * 180) / Math.PI,
      component: true,
    };
    const normalForceComponent: IForce = {
      description: "Normal Force",
      magnitude: Math.abs(gravity) * Math.cos(Math.atan(height / width)),
      directionInDegrees:
        180 - 90 - (Math.atan(height / width) * 180) / Math.PI,
      component: true,
    };
    const gravityParallel: IForce = {
      description: "Gravity Parallel Component",
      magnitude:
        mass *
        Math.abs(gravity) *
        Math.sin(Math.PI / 2 - Math.atan(height / width)),
      directionInDegrees:
        180 - 90 - (Math.atan(height / width) * 180) / Math.PI + 180,
      component: true,
    };
    const gravityPerpendicular: IForce = {
      description: "Gravity Perpendicular Component",
      magnitude:
        mass *
        Math.abs(gravity) *
        Math.cos(Math.PI / 2 - Math.atan(height / width)),
      directionInDegrees: 360 - (Math.atan(height / width) * 180) / Math.PI,
      component: true,
    };
    const gravityForce: IForce = {
      description: "Gravity",
      magnitude: mass * Math.abs(gravity),
      directionInDegrees: 270,
      component: false,
    };
    if (coefficient != 0) {
      setStartForces([gravityForce, normalForce, frictionForce]);
      setUpdatedForces([gravityForce, normalForce, frictionForce]);
      setComponentForces([
        frictionForceComponent,
        normalForceComponent,
        gravityParallel,
        gravityPerpendicular,
      ]);
    } else {
      setStartForces([gravityForce, normalForce]);
      setUpdatedForces([gravityForce, normalForce]);
      setComponentForces([
        normalForceComponent,
        gravityParallel,
        gravityPerpendicular,
      ]);
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
    let yPos = (width - radius) * Math.tan((angle * Math.PI) / 180);
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
    return yMax - yPos - 2 * radius + 5;
  };
  const getYPosFromDisplay = (yDisplay: number) => {
    return yMax - yDisplay - 2 * radius + 5;
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
    setReviewGravityMagnitude(Math.abs(gravity));
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(
      Math.abs(gravity) * Math.cos((theta * Math.PI) / 180)
    );
    setReviewNormalAngle(90 - theta);
    let yForce = -Math.abs(gravity);
    yForce +=
      Math.abs(gravity) *
      Math.cos((theta * Math.PI) / 180) *
      Math.sin(((90 - theta) * Math.PI) / 180);
    yForce +=
      coefficient *
      Math.abs(gravity) *
      Math.cos((theta * Math.PI) / 180) *
      Math.sin(((180 - theta) * Math.PI) / 180);
    let friction =
      coefficient * Math.abs(gravity) * Math.cos((theta * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(Math.abs(gravity) * Math.cos((theta * Math.PI) / 180)) *
          Math.sin(((90 - theta) * Math.PI) / 180) +
          Math.abs(gravity)) /
        Math.sin(((180 - theta) * Math.PI) / 180);
    }
    setReviewStaticMagnitude(friction);
    setReviewStaticAngle(180 - theta);
  };

  // In review mode, update forces when wedge angle changed
  const updateReviewForcesBasedOnAngle = (angle: number) => {
    setReviewGravityMagnitude(Math.abs(gravity));
    setReviewGravityAngle(270);
    setReviewNormalMagnitude(
      Math.abs(gravity) * Math.cos((Number(angle) * Math.PI) / 180)
    );
    setReviewNormalAngle(90 - angle);
    let yForce = -Math.abs(gravity);
    yForce +=
      Math.abs(gravity) *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((90 - Number(angle)) * Math.PI) / 180);
    yForce +=
      reviewCoefficient *
      Math.abs(gravity) *
      Math.cos((Number(angle) * Math.PI) / 180) *
      Math.sin(((180 - Number(angle)) * Math.PI) / 180);
    let friction =
      reviewCoefficient *
      Math.abs(gravity) *
      Math.cos((Number(angle) * Math.PI) / 180);
    if (yForce > 0) {
      friction =
        (-(Math.abs(gravity) * Math.cos((Number(angle) * Math.PI) / 180)) *
          Math.sin(((90 - Number(angle)) * Math.PI) / 180) +
          Math.abs(gravity)) /
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
        solutions.push(Math.abs(gravity) * Math.cos((theta / 180) * Math.PI));
      } else if (
        description ==
        "solve static force magnitude from wedge angle given equilibrium"
      ) {
        let normalForceMagnitude =
          Math.abs(gravity) * Math.cos((theta / 180) * Math.PI);
        let normalForceAngle = 90 - theta;
        let frictionForceAngle = 180 - theta;
        let frictionForceMagnitude =
          (-normalForceMagnitude *
            Math.sin((normalForceAngle * Math.PI) / 180) +
            Math.abs(gravity)) /
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
          Math.abs(gravity) * Math.cos((theta / 180) * Math.PI);
        let normalForceAngle = 90 - theta;
        let frictionForceAngle = 180 - theta;
        let frictionForceMagnitude =
          (-normalForceMagnitude *
            Math.sin((normalForceAngle * Math.PI) / 180) +
            Math.abs(gravity)) /
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

  // Reset all review values to default
  const resetReviewValuesToDefault = () => {
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
    if (mode == "Review") {
      if (!sketching) {
        const sketches = forceSketches.filter((sketch) => sketch != element);
        setForceSketches(sketches);
        setCurrentForceSketch(element);
        setSketching(true);
      }
    }
  };

  // In review mode, used to delete force arrow sketch on SHIFT+click
  const deleteForce = (element: VectorTemplate) => {
    if (mode == "Review") {
      if (!sketching) {
        const sketches = forceSketches.filter((sketch) => sketch != element);
        setForceSketches(sketches);
      }
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
      let wedgeAngle = 0;

      for (let i = 0; i < question.variablesForQuestionSetup.length; i++) {
        if (question.variablesForQuestionSetup[i] == "theta - max 45") {
          let randValue = Math.floor(Math.random() * 44 + 1);
          vars.push(randValue);
          wedgeAngle = randValue;
        } else if (
          question.variablesForQuestionSetup[i] ==
          "coefficient of static friction"
        ) {
          let randValue = Math.round(Math.random() * 1000) / 1000;
          vars.push(randValue);
          coefficient = randValue;
        }
      }
      setWedgeAngle(wedgeAngle);
      changeWedgeBasedOnNewAngle(wedgeAngle);
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
    setSimulationReset(!simulationReset);
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
              label={<p>Gravity magnitude</p>}
              lowerBound={0}
              changeValue={setReviewGravityMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewGravityMagnitude}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of gravity") {
        setReviewGravityAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={<p>Gravity angle</p>}
              lowerBound={0}
              changeValue={setReviewGravityAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewGravityAngle}
              radianEquivalent={true}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "normal force") {
        setReviewNormalMagnitude(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={<p>Normal force magnitude</p>}
              lowerBound={0}
              changeValue={setReviewNormalMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewNormalMagnitude}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of normal force") {
        setReviewNormalAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={<p>Normal force angle</p>}
              lowerBound={0}
              changeValue={setReviewNormalAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewNormalAngle}
              radianEquivalent={true}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "force of static friction") {
        setReviewStaticMagnitude(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={<p>Static friction magnitude</p>}
              lowerBound={0}
              changeValue={setReviewStaticMagnitude}
              step={0.1}
              unit={"N"}
              upperBound={50}
              value={reviewStaticMagnitude}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "angle of static friction") {
        setReviewStaticAngle(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={<p>Static friction angle</p>}
              lowerBound={0}
              changeValue={setReviewStaticAngle}
              step={1}
              unit={"°"}
              upperBound={360}
              value={reviewStaticAngle}
              radianEquivalent={true}
              showIcon={showIcon}
              correctValue={answers[i]}
              labelWidth={"7em"}
            />
          </div>
        );
      } else if (question.answerParts[i] == "coefficient of static friction") {
        updateReviewForcesBasedOnCoefficient(0);
        answerInput.push(
          <div key={i + d.getTime()}>
            <InputField
              label={
                <Box>
                  &mu;<sub>s</sub>
                </Box>
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
              label={<Box>&theta;</Box>}
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

  // Use effect hook to handle mode/topic change
  useEffect(() => {
    setElasticCollisions(false);
    setSimulationPaused(true);
    if (simulationType != "Circular Motion") {
      setStartVelX(0);
      setStartVelY(0);
      setVelocityXDisplay(0);
      setVelocityYDisplay(0);
    }
    if (mode == "Freeform") {
      setShowForceMagnitudes(true);
      if (simulationType == "One Weight") {
        setShowComponentForces(false);
        setStartPosY(yMin + radius);
        setStartPosX((xMax + xMin) / 2 - radius);
        setPositionYDisplay(getDisplayYPos(yMin + radius));
        setPositionXDisplay((xMax + xMin) / 2 - radius);
        setUpdatedForces([
          {
            description: "Gravity",
            magnitude: Math.abs(gravity) * mass,
            directionInDegrees: 270,
            component: false,
          },
        ]);
        setStartForces([
          {
            description: "Gravity",
            magnitude: Math.abs(gravity) * mass,
            directionInDegrees: 270,
            component: false,
          },
        ]);
        setSimulationReset(!simulationReset);
      } else if (simulationType == "Inclined Plane") {
        changeWedgeBasedOnNewAngle(26);
        setStartForces([
          {
            description: "Gravity",
            magnitude: Math.abs(gravity) * mass,
            directionInDegrees: 270,
            component: false,
          },
        ]);
        updateForcesWithFriction(Number(coefficientOfStaticFriction));
      } else if (simulationType == "Pendulum") {
        setupPendulum();
      } else if (simulationType == "Spring") {
        setupSpring();
      } else if (simulationType == "Circular Motion") {
        setupCircular(0);
      } else if (simulationType == "Pulley") {
        setupPulley();
      } else if (simulationType == "Suspension") {
        setupSuspension();
      }
    } else if (mode == "Review") {
      setShowComponentForces(false);
      setShowForceMagnitudes(true);
      setShowAcceleration(false);
      setShowVelocity(false);
      setShowForces(true);
      generateNewQuestion();
      if (simulationType == "One Weight") {
        // TODO - one weight review problems
      } else if (simulationType == "Spring") {
        setupSpring();
        // TODO - spring review problems
      } else if (simulationType == "Inclined Plane") {
        setUpdatedForces([]);
        setStartForces([]);
      } else if (simulationType == "Pendulum") {
        setupPendulum();
        // TODO - pendulum review problems
      } else if (simulationType == "Circular Motion") {
        setupCircular(0);
        // TODO - circular motion review problems
      } else if (simulationType == "Pulley") {
        setupPulley();
        // TODO - pulley tutorial review problems
      } else if (simulationType == "Suspension") {
        setupSuspension();
        // TODO - suspension tutorial review problems
      }
    } else if (mode == "Tutorial") {
      setShowComponentForces(false);
      setVelocityXDisplay(0);
      setVelocityYDisplay(0);
      setStepNumber(0);
      setShowVelocity(false);
      setShowAcceleration(false);

      if (simulationType == "One Weight") {
        setShowForces(true);
        setStartPosY(yMax - 100);
        setStartPosX((xMax + xMin) / 2 - radius);
        setSelectedTutorial(tutorials.freeWeight);
        setSelectedTutorial(tutorials.freeWeight);
        setStartForces(getForceFromJSON(tutorials.freeWeight.steps[0].forces));
        setShowForceMagnitudes(tutorials.freeWeight.steps[0].showMagnitude);
      } else if (simulationType == "Spring") {
        setShowForces(false);
        setupSpring();
        // TODO - spring tutorial
      } else if (simulationType == "Pendulum") {
        setShowForces(true);
        const length = 300;
        const angle = 30;
        const x = length * Math.cos(((90 - angle) * Math.PI) / 180);
        const y = length * Math.sin(((90 - angle) * Math.PI) / 180);
        const xPos = xMax / 2 - x - radius;
        const yPos = y - radius - 5;
        setStartPosX(xPos);
        setStartPosY(yPos);
        setSelectedTutorial(tutorials.pendulum);
        setStartForces(getForceFromJSON(tutorials.pendulum.steps[0].forces));
        setShowForceMagnitudes(tutorials.pendulum.steps[0].showMagnitude);
        setPendulumAngle(30);
        setPendulumLength(300);
        setAdjustPendulumAngle({ angle: 30, length: 300 });
      } else if (simulationType == "Inclined Plane") {
        setShowForces(true);
        setWedgeAngle(26);
        changeWedgeBasedOnNewAngle(26);
        setSelectedTutorial(tutorials.inclinePlane);
        setStartForces(
          getForceFromJSON(tutorials.inclinePlane.steps[0].forces)
        );
        setShowForceMagnitudes(tutorials.inclinePlane.steps[0].showMagnitude);
      } else if (simulationType == "Circular Motion") {
        setShowForces(false);
        setupCircular(0);
        // TODO - circular motion tutorial
      } else if (simulationType == "Pulley") {
        setShowForces(false);
        setupPulley();
        // TODO - pulley tutorial
      } else if (simulationType == "Suspension") {
        setShowForces(false);
        // TODO - suspension tutorial
      }
      setSimulationReset(!simulationReset);
    }
  }, [simulationType, mode, resetAll]);

  // Default setup for uniform circular motion simulation
  const setupCircular = (value: number) => {
    setShowComponentForces(false);
    setStartVelY(0);
    setStartVelX(value);
    let xPos = (xMax + xMin) / 2 - radius;
    let yPos = (yMax + yMin) / 2 + circularMotionRadius - radius;
    setStartPosY(yPos);
    setStartPosX(xPos);
    const tensionForce: IForce = {
      description: "Tension",
      magnitude: (startVelX ** 2 * mass) / circularMotionRadius,
      directionInDegrees: 90,
      component: false,
    };
    setUpdatedForces([tensionForce]);
    setStartForces([tensionForce]);
    setSimulationReset(!simulationReset);
  };

  // Default setup for pendulum simulation
  const setupPendulum = () => {
    const length = 300;
    const angle = 30;
    const x = length * Math.cos(((90 - angle) * Math.PI) / 180);
    const y = length * Math.sin(((90 - angle) * Math.PI) / 180);
    const xPos = xMax / 2 - x - radius;
    const yPos = y - radius - 5;
    setStartPosX(xPos);
    setStartPosY(yPos);
    const mag = mass * Math.abs(gravity) * Math.sin((60 * Math.PI) / 180);
    const forceOfTension: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: 90 - angle,
      component: false,
    };

    const tensionComponent: IForce = {
      description: "Tension",
      magnitude: mag,
      directionInDegrees: 90 - angle,
      component: true,
    };
    const gravityParallel: IForce = {
      description: "Gravity Parallel Component",
      magnitude:
        mass * Math.abs(gravity) * Math.sin(((90 - angle) * Math.PI) / 180),
      directionInDegrees: -angle - 90,
      component: true,
    };
    const gravityPerpendicular: IForce = {
      description: "Gravity Perpendicular Component",
      magnitude:
        mass * Math.abs(gravity) * Math.cos(((90 - angle) * Math.PI) / 180),
      directionInDegrees: -angle,
      component: true,
    };

    setComponentForces([
      tensionComponent,
      gravityParallel,
      gravityPerpendicular,
    ]);
    setUpdatedForces([
      {
        description: "Gravity",
        magnitude: mass * Math.abs(gravity),
        directionInDegrees: 270,
        component: false,
      },
      forceOfTension,
    ]);
    setStartForces([
      {
        description: "Gravity",
        magnitude: mass * Math.abs(gravity),
        directionInDegrees: 270,
        component: false,
      },
      forceOfTension,
    ]);
    setStartPendulumAngle(30);
    setPendulumAngle(30);
    setPendulumLength(300);
    setAdjustPendulumAngle({ angle: 30, length: 300 });
  };

  // Default setup for spring simulation
  const setupSpring = () => {
    setShowComponentForces(false);
    const gravityForce: IForce = {
      description: "Gravity",
      magnitude: Math.abs(gravity) * mass,
      directionInDegrees: 270,
      component: false,
    };
    setUpdatedForces([gravityForce]);
    setStartForces([gravityForce]);
    setStartPosX(xMax / 2 - radius);
    setStartPosY(200);
    setSpringConstant(0.5);
    setSpringRestLength(200);
    setSpringStartLength(200);
    setSimulationReset(!simulationReset);
  };

  // Default setup for suspension simulation
  const setupSuspension = () => {
    let xPos = (xMax + xMin) / 2 - radius;
    let yPos = yMin + 200;
    setStartPosY(yPos);
    setStartPosX(xPos);
    setPositionYDisplay(getDisplayYPos(yPos));
    setPositionXDisplay(xPos);
    let tensionMag = (mass * Math.abs(gravity)) / (2 * Math.sin(Math.PI / 4));
    const tensionForce1: IForce = {
      description: "Tension",
      magnitude: tensionMag,
      directionInDegrees: 45,
      component: false,
    };
    const tensionForce2: IForce = {
      description: "Tension",
      magnitude: tensionMag,
      directionInDegrees: 135,
      component: false,
    };
    const grav: IForce = {
      description: "Gravity",
      magnitude: mass * Math.abs(gravity),
      directionInDegrees: 270,
      component: false,
    };
    setUpdatedForces([tensionForce1, tensionForce2, grav]);
    setStartForces([tensionForce1, tensionForce2, grav]);
    setSimulationReset(!simulationReset);
  };

  // Default setup for pulley simulation
  const setupPulley = () => {
    setShowComponentForces(false);
    setStartPosY((yMax + yMin) / 2);
    setStartPosX((xMin + xMax) / 2 - 105);
    setPositionYDisplay(getDisplayYPos((yMax + yMin) / 2));
    setPositionXDisplay((xMin + xMax) / 2 - 105);
    let a = ((mass - mass2) * Math.abs(gravity)) / (mass + mass2);
    const gravityForce1: IForce = {
      description: "Gravity",
      magnitude: mass * Math.abs(gravity),
      directionInDegrees: 270,
      component: false,
    };
    const tensionForce1: IForce = {
      description: "Tension",
      magnitude: mass2 * Math.abs(gravity) - mass * a,
      directionInDegrees: 90,
      component: false,
    };
    const gravityForce2: IForce = {
      description: "Gravity",
      magnitude: mass2 * Math.abs(gravity),
      directionInDegrees: 270,
      component: false,
    };
    const tensionForce2: IForce = {
      description: "Tension",
      magnitude: mass * Math.abs(gravity) + mass2 * a,
      directionInDegrees: 90,
      component: false,
    };
    setUpdatedForces([gravityForce1, tensionForce1]);
    setStartForces([gravityForce1, tensionForce1]);
    setStartPosY2((yMax + yMin) / 2);
    setStartPosX2((xMin + xMax) / 2 + 5);
    setPositionYDisplay2(getDisplayYPos((yMax + yMin) / 2));
    setPositionXDisplay2((xMin + xMax) / 2 + 5);
    setUpdatedForces2([gravityForce2, tensionForce2]);
    setStartForces2([gravityForce2, tensionForce2]);
    setSimulationReset(!simulationReset);
  };

  // Helper function used for tutorial and review mode
  const getForceFromJSON = (
    json: {
      description: string;
      magnitude: number;
      directionInDegrees: number;
      component: boolean;
    }[]
  ): IForce[] => {
    const forces: IForce[] = [];
    for (let i = 0; i < json.length; i++) {
      const force: IForce = {
        description: json[i].description,
        magnitude: json[i].magnitude,
        directionInDegrees: json[i].directionInDegrees,
        component: json[i].component,
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
        component: false,
      };
      const normalForceReview: IForce = {
        description: "Normal Force",
        magnitude: reviewNormalMagnitude,
        directionInDegrees: reviewNormalAngle,
        component: false,
      };
      const staticFrictionForceReview: IForce = {
        description: "Static Friction Force",
        magnitude: reviewStaticMagnitude,
        directionInDegrees: reviewStaticAngle,
        component: false,
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

  // Timer for animating the simulation, update every 0.05 seconds
  setInterval(() => {
    setTimer(timer + 1);
  }, 50);

  // Use effect to add listener for SHIFT key, which determines if sketch force arrow will be edited or deleted on click - TODO delete in Dash integration
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
    window.addEventListener("resize", (e) => {
      window.location.reload();
    });
  }, []);

  // Render simulation
  return (
    <div className="physicsSimApp">
      <div className="mechanicsSimulationContainer">
        <div
          className="mechanicsSimulationContentContainer"
          onPointerMove={(e) => {
            if (sketching) {
              const x1 = positionXDisplay + radius;
              const y1 = getYPosFromDisplay(positionYDisplay) + radius;
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
              if (mode == "Review") {
                setSketching(false);
                const sketches = forceSketches;
                sketches.push(currentForceSketch);
                setForceSketches(sketches);
                setCurrentForceSketch(null);
              } else {
                const x1 = positionXDisplay + radius;
                const y1 = getYPosFromDisplay(positionYDisplay) + radius;
                const x2 = e.clientX;
                const y2 = e.clientY;
                let deltaX = x2 - x1;
                let deltaY = y2 - y1;
                setStartVelX(deltaX / 3);
                setStartVelY(deltaY / 3);
                setSimulationReset(!simulationReset);
                setSketching(false);
                setForceSketches([]);
                setCurrentForceSketch(null);
              }
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
                    <option value="One Weight">Projectile</option>
                    <option value="Inclined Plane">Inclined Plane</option>
                    <option value="Pendulum">Pendulum</option>
                    <option value="Spring">Spring</option>
                    <option value="Circular Motion">Circular Motion</option>
                    <option value="Pulley">Pulley</option>
                    <option value="Suspension">Suspension</option>
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
              <Weight
                adjustPendulumAngle={adjustPendulumAngle}
                gravity={gravity}
                circularMotionRadius={circularMotionRadius}
                componentForces={componentForces}
                setComponentForces={setComponentForces}
                showComponentForces={showComponentForces}
                color={"red"}
                coefficientOfKineticFriction={Number(
                  coefficientOfKineticFriction
                )}
                displayXVelocity={velocityXDisplay}
                displayYVelocity={velocityYDisplay}
                elasticCollisions={elasticCollisions}
                incrementTime={timer}
                mass={mass}
                mode={mode}
                noMovement={noMovement}
                paused={simulationPaused}
                pendulumAngle={pendulumAngle}
                pendulumLength={pendulumLength}
                radius={radius}
                reset={simulationReset}
                simulationSpeed={simulationSpeed}
                setDisplayXAcceleration={setAccelerationXDisplay}
                setDisplayXPosition={setPositionXDisplay}
                setDisplayXVelocity={setVelocityXDisplay}
                setDisplayYAcceleration={setAccelerationYDisplay}
                setDisplayYPosition={setPositionYDisplay}
                setDisplayYVelocity={setVelocityYDisplay}
                setPaused={setSimulationPaused}
                setPendulumAngle={setPendulumAngle}
                setPendulumLength={setPendulumLength}
                setSketching={setSketching}
                startPendulumAngle={startPendulumAngle}
                setUpdatedForces={setUpdatedForces}
                showAcceleration={showAcceleration}
                showForceMagnitudes={showForceMagnitudes}
                showForces={showForces}
                showVelocity={showVelocity}
                simulationType={simulationType}
                springConstant={springConstant}
                springStartLength={springStartLength}
                setSpringStartLength={setSpringStartLength}
                springRestLength={springRestLength}
                startForces={startForces}
                startPosX={startPosX}
                startPosY={startPosY}
                startVelX={startVelX}
                startVelY={startVelY}
                timestepSize={0.05}
                updateDisplay={displayChange}
                updatedForces={updatedForces}
                wedgeHeight={wedgeHeight}
                wedgeWidth={wedgeWidth}
                xMax={xMax}
                xMin={xMin}
                yMax={yMax}
                yMin={yMin}
              />
              {simulationType == "Pulley" && (
                <Weight
                  adjustPendulumAngle={adjustPendulumAngle}
                  circularMotionRadius={circularMotionRadius}
                  gravity={gravity}
                  componentForces={componentForces}
                  setComponentForces={setComponentForces}
                  showComponentForces={showComponentForces}
                  color={"blue"}
                  coefficientOfKineticFriction={Number(
                    coefficientOfKineticFriction
                  )}
                  displayXVelocity={velocityXDisplay2}
                  displayYVelocity={velocityYDisplay2}
                  elasticCollisions={elasticCollisions}
                  incrementTime={timer}
                  mass={mass2}
                  mode={mode}
                  noMovement={noMovement}
                  paused={simulationPaused}
                  pendulumAngle={pendulumAngle}
                  pendulumLength={pendulumLength}
                  radius={radius}
                  reset={simulationReset}
                  simulationSpeed={simulationSpeed}
                  setDisplayXAcceleration={setAccelerationXDisplay2}
                  setDisplayXPosition={setPositionXDisplay2}
                  setDisplayXVelocity={setVelocityXDisplay2}
                  setDisplayYAcceleration={setAccelerationYDisplay2}
                  setDisplayYPosition={setPositionYDisplay2}
                  setDisplayYVelocity={setVelocityYDisplay2}
                  setPaused={setSimulationPaused}
                  setPendulumAngle={setPendulumAngle}
                  setPendulumLength={setPendulumLength}
                  setSketching={setSketching}
                  startPendulumAngle={startPendulumAngle}
                  setUpdatedForces={setUpdatedForces2}
                  showAcceleration={showAcceleration}
                  showForceMagnitudes={showForceMagnitudes}
                  showForces={showForces}
                  showVelocity={showVelocity}
                  simulationType={simulationType}
                  springConstant={springConstant}
                  springStartLength={springStartLength}
                  setSpringStartLength={setSpringStartLength}
                  springRestLength={springRestLength}
                  startForces={startForces2}
                  startPosX={startPosX2}
                  startPosY={startPosY2}
                  startVelX={startVelX}
                  startVelY={startVelY}
                  timestepSize={50 / 1000}
                  updateDisplay={displayChange2}
                  updatedForces={updatedForces2}
                  wedgeHeight={wedgeHeight}
                  wedgeWidth={wedgeWidth}
                  xMax={xMax}
                  xMin={xMin}
                  yMax={yMax}
                  yMin={yMin}
                />
              )}
            </div>
            <div>
              {(simulationType == "One Weight" ||
                simulationType == "Inclined Plane") &&
                wallPositions.map((element, index) => {
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
                <IconButton
                  onClick={() => {
                    setSimulationPaused(false);
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
              )}
              {!simulationPaused && mode != "Tutorial" && (
                <IconButton
                  onClick={() => {
                    setSimulationPaused(true);
                  }}
                >
                  <PauseIcon />
                </IconButton>
              )}
              {simulationPaused && mode != "Tutorial" && (
                <IconButton
                  onClick={() => {
                    setSimulationReset(!simulationReset);
                  }}
                >
                  <ReplayIcon />
                </IconButton>
              )}
              {simulationPaused &&
                !sketching &&
                simulationType == "One Weight" &&
                mode != "Tutorial" && (
                  <IconButton
                    onClick={() => {
                      setSketching(true);
                      setShowVelocity(true);
                      setSimulationReset(!simulationReset);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              {simulationPaused &&
                sketching &&
                simulationType == "One Weight" &&
                mode != "Tutorial" && (
                  <IconButton
                    onClick={() => {
                      setSketching(false);
                      setForceSketches([]);
                      setCurrentForceSketch(null);
                    }}
                  >
                    <EditOffIcon />
                  </IconButton>
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
                <option value="Tutorial">Tutorial Mode</option>
                <option value="Freeform">Freeform Mode</option>
                <option value="Review">Review Mode</option>
              </select>
            </div>
          </div>
          {mode == "Review" && simulationType != "Inclined Plane" && (
            <div className="wordProblemBox">
              <p>{simulationType} review problems in progress!</p>
            </div>
          )}
          {mode == "Review" && simulationType == "Inclined Plane" && (
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
          {mode == "Tutorial" &&
            simulationType != "One Weight" &&
            simulationType != "Pendulum" &&
            simulationType != "Inclined Plane" && (
              <div className="wordProblemBox">
                <p>{simulationType} tutorial in progress!</p>
              </div>
            )}
          {mode == "Tutorial" &&
            (simulationType == "One Weight" ||
              simulationType == "Pendulum" ||
              simulationType == "Inclined Plane") && (
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
                  {simulationType == "One Weight" && (
                    <ul>
                      <li>
                        <a
                          href="https://www.khanacademy.org/science/physics/one-dimensional-motion"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Khan Academy - One Dimensional Motion
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.khanacademy.org/science/physics/two-dimensional-motion"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Khan Academy - Two Dimensional Motion
                        </a>
                      </li>
                    </ul>
                  )}
                  {simulationType == "Inclined Plane" && (
                    <ul>
                      <li>
                        <a
                          href="https://www.khanacademy.org/science/physics/forces-newtons-laws#normal-contact-force"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Khan Academy - Normal Force
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.khanacademy.org/science/physics/forces-newtons-laws#inclined-planes-friction"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Khan Academy - Inclined Planes
                        </a>
                      </li>
                    </ul>
                  )}
                  {simulationType == "Pendulum" && (
                    <ul>
                      <li>
                        <a
                          href="https://www.khanacademy.org/science/physics/forces-newtons-laws#tension-tutorial"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Khan Academy - Tension
                        </a>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          {mode == "Review" && simulationType == "Inclined Plane" && (
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
                  <p>Submit</p>
                </Button>
                <Button
                  onClick={() => generateNewQuestion()}
                  variant="outlined"
                >
                  <p>New question</p>
                </Button>
              </div>
            </div>
          )}
          {mode == "Freeform" && (
            <div className="vars">
              <FormControl component="fieldset">
                <FormGroup>
                  {simulationType == "One Weight" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          value={elasticCollisions}
                          onChange={() =>
                            setElasticCollisions(!elasticCollisions)
                          }
                        />
                      }
                      label="Make collisions elastic"
                      labelPlacement="start"
                    />
                  )}
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
                  {(simulationType == "Inclined Plane" ||
                    simulationType == "Pendulum") && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          value={showForces}
                          onChange={() =>
                            setShowComponentForces(!showComponentForces)
                          }
                        />
                      }
                      label="Show component force vectors"
                      labelPlacement="start"
                    />
                  )}
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

                  <InputField
                    label={<Box>Speed</Box>}
                    lowerBound={1}
                    changeValue={setSimulationSpeed}
                    step={1}
                    unit={"x"}
                    upperBound={10}
                    value={simulationSpeed}
                    labelWidth={"5em"}
                  />
                  {simulationPaused && simulationType != "Circular Motion" && (
                    <InputField
                      label={<Box>Gravity</Box>}
                      lowerBound={-30}
                      changeValue={setGravity}
                      step={0.01}
                      unit={"m/s2"}
                      upperBound={0}
                      value={gravity}
                      effect={(val: number) => {
                        setResetAll(!resetAll);
                      }}
                      labelWidth={"5em"}
                    />
                  )}
                  {simulationPaused && simulationType != "Pulley" && (
                    <InputField
                      label={<Box>Mass</Box>}
                      lowerBound={1}
                      changeValue={setMass}
                      step={0.1}
                      unit={"kg"}
                      upperBound={5}
                      value={mass}
                      effect={(val: number) => {
                        setResetAll(!resetAll);
                      }}
                      labelWidth={"5em"}
                    />
                  )}
                  {simulationPaused && simulationType == "Pulley" && (
                    <InputField
                      label={<Box>Red mass</Box>}
                      lowerBound={1}
                      changeValue={setMass}
                      step={0.1}
                      unit={"kg"}
                      upperBound={5}
                      value={mass}
                      effect={(val: number) => {
                        setResetAll(!resetAll);
                      }}
                      labelWidth={"5em"}
                    />
                  )}
                  {simulationPaused && simulationType == "Pulley" && (
                    <InputField
                      label={<Box>Blue mass</Box>}
                      lowerBound={1}
                      changeValue={setMass2}
                      step={0.1}
                      unit={"kg"}
                      upperBound={5}
                      value={mass2}
                      effect={(val: number) => {
                        setResetAll(!resetAll);
                      }}
                      labelWidth={"5em"}
                    />
                  )}
                  {simulationPaused && simulationType == "Circular Motion" && (
                    <InputField
                      label={<Box>Rod length</Box>}
                      lowerBound={100}
                      changeValue={setCircularMotionRadius}
                      step={5}
                      unit={"kg"}
                      upperBound={250}
                      value={circularMotionRadius}
                      effect={(val: number) => {
                        setResetAll(!resetAll);
                      }}
                      labelWidth={"5em"}
                    />
                  )}
                </FormGroup>
              </FormControl>
              {simulationType == "Spring" && simulationPaused && (
                <div>
                  <InputField
                    label={
                      <Typography color="inherit">Spring stiffness</Typography>
                    }
                    lowerBound={0.1}
                    changeValue={setSpringConstant}
                    step={1}
                    unit={"N/m"}
                    upperBound={500}
                    value={springConstant}
                    effect={(val: number) => {
                      setSimulationReset(!simulationReset);
                    }}
                    radianEquivalent={false}
                    mode={"Freeform"}
                    labelWidth={"7em"}
                  />
                  <InputField
                    label={<Typography color="inherit">Rest length</Typography>}
                    lowerBound={10}
                    changeValue={setSpringRestLength}
                    step={100}
                    unit={""}
                    upperBound={500}
                    value={springRestLength}
                    effect={(val: number) => {
                      setSimulationReset(!simulationReset);
                    }}
                    radianEquivalent={false}
                    mode={"Freeform"}
                    labelWidth={"7em"}
                  />
                  <InputField
                    label={
                      <Typography color="inherit">
                        Starting displacement
                      </Typography>
                    }
                    lowerBound={-(springRestLength - 10)}
                    changeValue={(val: number) => {}}
                    step={10}
                    unit={""}
                    upperBound={springRestLength}
                    value={springStartLength - springRestLength}
                    effect={(val: number) => {
                      setStartPosY(springRestLength + val);
                      setSpringStartLength(springRestLength + val);
                      setSimulationReset(!simulationReset);
                    }}
                    radianEquivalent={false}
                    mode={"Freeform"}
                    labelWidth={"7em"}
                  />
                </div>
              )}
              {simulationType == "Inclined Plane" && simulationPaused && (
                <div>
                  <InputField
                    label={<Box>&theta;</Box>}
                    lowerBound={0}
                    changeValue={setWedgeAngle}
                    step={1}
                    unit={"°"}
                    upperBound={49}
                    value={wedgeAngle}
                    effect={(val: number) => {
                      changeWedgeBasedOnNewAngle(val);
                      setSimulationReset(!simulationReset);
                    }}
                    radianEquivalent={true}
                    mode={"Freeform"}
                    labelWidth={"2em"}
                  />
                  <InputField
                    label={
                      <Box>
                        &mu;<sub>s</sub>
                      </Box>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfStaticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={1}
                    value={coefficientOfStaticFriction}
                    effect={(val: number) => {
                      updateForcesWithFriction(val);
                      if (val < Number(coefficientOfKineticFriction)) {
                        setCoefficientOfKineticFriction(val);
                      }
                      setSimulationReset(!simulationReset);
                    }}
                    mode={"Freeform"}
                    labelWidth={"2em"}
                  />
                  <InputField
                    label={
                      <Box>
                        &mu;<sub>k</sub>
                      </Box>
                    }
                    lowerBound={0}
                    changeValue={setCoefficientOfKineticFriction}
                    step={0.1}
                    unit={""}
                    upperBound={Number(coefficientOfStaticFriction)}
                    value={coefficientOfKineticFriction}
                    effect={(val: number) => {
                      setSimulationReset(!simulationReset);
                    }}
                    mode={"Freeform"}
                    labelWidth={"2em"}
                  />
                </div>
              )}
              {simulationType == "Inclined Plane" && !simulationPaused && (
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
              {simulationType == "Pendulum" && !simulationPaused && (
                <Typography>
                  &theta;: {Math.round(pendulumAngle * 100) / 100}° ≈{" "}
                  {Math.round(((pendulumAngle * Math.PI) / 180) * 100) / 100}{" "}
                  rad
                </Typography>
              )}
              {simulationType == "Pendulum" && simulationPaused && (
                <div>
                  <InputField
                    label={<Box>Angle</Box>}
                    lowerBound={0}
                    changeValue={setPendulumAngle}
                    step={1}
                    unit={"°"}
                    upperBound={59}
                    value={pendulumAngle}
                    effect={(value) => {
                      setStartPendulumAngle(value);
                      if (simulationType == "Pendulum") {
                        const mag =
                          mass *
                          Math.abs(gravity) *
                          Math.cos((value * Math.PI) / 180);

                        const forceOfTension: IForce = {
                          description: "Tension",
                          magnitude: mag,
                          directionInDegrees: 90 - value,
                          component: false,
                        };

                        const tensionComponent: IForce = {
                          description: "Tension",
                          magnitude: mag,
                          directionInDegrees: 90 - value,
                          component: true,
                        };
                        const gravityParallel: IForce = {
                          description: "Gravity Parallel Component",
                          magnitude:
                            Math.abs(gravity) *
                            Math.cos((value * Math.PI) / 180),
                          directionInDegrees: 270 - value,
                          component: true,
                        };
                        const gravityPerpendicular: IForce = {
                          description: "Gravity Perpendicular Component",
                          magnitude:
                            Math.abs(gravity) *
                            Math.sin((value * Math.PI) / 180),
                          directionInDegrees: -value,
                          component: true,
                        };

                        const length = pendulumLength;
                        const x =
                          length * Math.cos(((90 - value) * Math.PI) / 180);
                        const y =
                          length * Math.sin(((90 - value) * Math.PI) / 180);
                        const xPos = xMax / 2 - x - radius;
                        const yPos = y - radius - 5;
                        setStartPosX(xPos);
                        setStartPosY(yPos);

                        setStartForces([
                          {
                            description: "Gravity",
                            magnitude: Math.abs(gravity) * mass,
                            directionInDegrees: 270,
                            component: false,
                          },
                          forceOfTension,
                        ]);
                        setUpdatedForces([
                          {
                            description: "Gravity",
                            magnitude: Math.abs(gravity) * mass,
                            directionInDegrees: 270,
                            component: false,
                          },
                          forceOfTension,
                        ]);
                        setComponentForces([
                          tensionComponent,
                          gravityParallel,
                          gravityPerpendicular,
                        ]);
                        setAdjustPendulumAngle({
                          angle: value,
                          length: pendulumLength,
                        });
                        setSimulationReset(!simulationReset);
                      }
                    }}
                    radianEquivalent={true}
                    mode={"Freeform"}
                    labelWidth={"5em"}
                  />
                  <InputField
                    label={<Box>Rod length</Box>}
                    lowerBound={0}
                    changeValue={setPendulumLength}
                    step={1}
                    unit={"m"}
                    upperBound={400}
                    value={Math.round(pendulumLength)}
                    effect={(value) => {
                      if (simulationType == "Pendulum") {
                        setAdjustPendulumAngle({
                          angle: pendulumAngle,
                          length: value,
                        });
                        setSimulationReset(!simulationReset);
                      }
                    }}
                    radianEquivalent={false}
                    mode={"Freeform"}
                    labelWidth={"5em"}
                  />
                </div>
              )}
            </div>
          )}
          <div className="mechanicsSimulationEquation">
            {mode == "Freeform" && (
              <table>
                <tbody>
                  <tr>
                    <td>{simulationType == "Pulley" ? "Red Weight" : ""}</td>
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
                      <Box>Position</Box>
                    </td>
                    {(!simulationPaused ||
                      simulationType == "Inclined Plane" ||
                      simulationType == "Suspension" ||
                      simulationType == "Circular Motion" ||
                      simulationType == "Pulley") && (
                      <td style={{ cursor: "default" }}>
                        {positionXDisplay} m
                      </td>
                    )}{" "}
                    {simulationPaused &&
                      simulationType != "Inclined Plane" &&
                      simulationType != "Suspension" &&
                      simulationType != "Circular Motion" &&
                      simulationType != "Pulley" && (
                        <td
                          style={{
                            cursor: "default",
                          }}
                        >
                          <InputField
                            lowerBound={0}
                            changeValue={setPositionXDisplay}
                            step={1}
                            unit={"m"}
                            upperBound={xMax - 110}
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
                        </td>
                      )}{" "}
                    {(!simulationPaused ||
                      simulationType == "Inclined Plane" ||
                      simulationType == "Suspension" ||
                      simulationType == "Circular Motion" ||
                      simulationType == "Pulley") && (
                      <td style={{ cursor: "default" }}>
                        {positionYDisplay} m
                      </td>
                    )}{" "}
                    {simulationPaused &&
                      simulationType != "Inclined Plane" &&
                      simulationType != "Suspension" &&
                      simulationType != "Circular Motion" &&
                      simulationType != "Pulley" && (
                        <td
                          style={{
                            cursor: "default",
                          }}
                        >
                          <InputField
                            lowerBound={0}
                            changeValue={setPositionYDisplay}
                            step={1}
                            unit={"m"}
                            upperBound={yMax - 110}
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
                        </td>
                      )}{" "}
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
                      <Box>Velocity</Box>
                    </td>
                    {(!simulationPaused ||
                      (simulationType != "One Weight" &&
                        simulationType != "Circular Motion")) && (
                      <td style={{ cursor: "default" }}>
                        {velocityXDisplay} m/s
                      </td>
                    )}{" "}
                    {simulationPaused &&
                      (simulationType == "One Weight" ||
                        simulationType == "Circular Motion") && (
                        <td
                          style={{
                            cursor: "default",
                          }}
                        >
                          <InputField
                            lowerBound={-50}
                            changeValue={setVelocityXDisplay}
                            step={1}
                            unit={"m/s"}
                            upperBound={50}
                            value={velocityXDisplay}
                            effect={(value) => {
                              setStartVelX(value);
                              setSimulationReset(!simulationReset);
                            }}
                            small={true}
                            mode={"Freeform"}
                          />
                        </td>
                      )}{" "}
                    {(!simulationPaused || simulationType != "One Weight") && (
                      <td style={{ cursor: "default" }}>
                        {velocityYDisplay} m/s
                      </td>
                    )}{" "}
                    {simulationPaused && simulationType == "One Weight" && (
                      <td
                        style={{
                          cursor: "default",
                        }}
                      >
                        <InputField
                          lowerBound={-50}
                          changeValue={setVelocityYDisplay}
                          step={1}
                          unit={"m/s"}
                          upperBound={50}
                          value={velocityYDisplay}
                          effect={(value) => {
                            setStartVelY(-value);
                            setDisplayChange({
                              xDisplay: positionXDisplay,
                              yDisplay: positionYDisplay,
                            });
                          }}
                          small={true}
                          mode={"Freeform"}
                        />
                      </td>
                    )}{" "}
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
                      <Box>Acceleration</Box>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationXDisplay} m/s<sup>2</sup>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationYDisplay} m/s<sup>2</sup>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Box>Momentum</Box>
                    </td>
                    <td>
                      {Math.round(velocityXDisplay * mass * 10) / 10} kg*m/s
                    </td>
                    <td>
                      {Math.round(velocityYDisplay * mass * 10) / 10} kg*m/s
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
            {mode == "Freeform" && simulationType == "Pulley" && (
              <table>
                <tbody>
                  <tr>
                    <td>Blue Weight</td>
                    <td>X</td>
                    <td>Y</td>
                  </tr>
                  <tr>
                    <td>
                      <Box>Position</Box>
                    </td>
                    <td style={{ cursor: "default" }}>{positionXDisplay2} m</td>
                    <td style={{ cursor: "default" }}>{positionYDisplay2} m</td>
                  </tr>
                  <tr>
                    <td>
                      <Box>Velocity</Box>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {velocityXDisplay2} m/s
                    </td>

                    <td style={{ cursor: "default" }}>
                      {velocityYDisplay2} m/s
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Box>Acceleration</Box>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationXDisplay2} m/s<sup>2</sup>
                    </td>
                    <td style={{ cursor: "default" }}>
                      {accelerationYDisplay2} m/s<sup>2</sup>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Box>Momentum</Box>
                    </td>
                    <td>
                      {Math.round(velocityXDisplay2 * mass * 10) / 10} kg*m/s
                    </td>
                    <td>
                      {Math.round(velocityYDisplay2 * mass * 10) / 10} kg*m/s
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          {simulationType != "Pendulum" && simulationType != "Spring" && (
            <div>
              <p>Kinematic Equations</p>
              <ul>
                <li>
                  Position: x<sub>1</sub>=x<sub>0</sub>+v<sub>0</sub>t+
                  <sup>1</sup>&frasl;
                  <sub>2</sub>at
                  <sup>2</sup>
                </li>
                <li>
                  Velocity: v<sub>1</sub>=v<sub>0</sub>+at
                </li>
                <li>Acceleration: a = F/m</li>
              </ul>
            </div>
          )}
          {simulationType == "Spring" && (
            <div>
              <p>Harmonic Motion Equations: Spring</p>
              <ul>
                <li>
                  Spring force: F<sub>s</sub>=kd
                </li>
                <li>
                  Spring period: T<sub>s</sub>=2&pi;&#8730;<sup>m</sup>&frasl;
                  <sub>k</sub>
                </li>
                <li>Equilibrium displacement for vertical spring: d = mg/k</li>
                <li>
                  Elastic potential energy: U<sub>s</sub>=<sup>1</sup>&frasl;
                  <sub>2</sub>kd<sup>2</sup>
                </li>
                <ul>
                  <li>
                    Maximum when system is at maximum displacement, 0 when
                    system is at 0 displacement
                  </li>
                </ul>
                <li>
                  Translational kinetic energy: K=<sup>1</sup>&frasl;
                  <sub>2</sub>mv<sup>2</sup>
                </li>
                <ul>
                  <li>
                    Maximum when system is at maximum/minimum velocity (at 0
                    displacement), 0 when velocity is 0 (at maximum
                    displacement)
                  </li>
                </ul>
              </ul>
            </div>
          )}
          {simulationType == "Pendulum" && (
            <div>
              <p>Harmonic Motion Equations: Pendulum</p>
              <ul>
                <li>
                  Pendulum period: T<sub>p</sub>=2&pi;&#8730;<sup>l</sup>&frasl;
                  <sub>g</sub>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          top: window.innerHeight - 120 + 20 + "px",
          left: xMin + 90 - 80 + "px",
          zIndex: -10000,
        }}
      >
        <svg width={100 + "px"} height={100 + "px"}>
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
            x1={20}
            y1={70}
            x2={70}
            y2={70}
            stroke={"#000000"}
            strokeWidth="2"
            markerEnd="url(#miniArrow)"
          />
          <line
            x1={20}
            y1={70}
            x2={20}
            y2={20}
            stroke={"#000000"}
            strokeWidth="2"
            markerEnd="url(#miniArrow)"
          />
        </svg>
        <p
          style={{
            position: "fixed",
            top: window.innerHeight - 120 + 40 + "px",
            left: xMin + 90 - 80 + "px",
          }}
        >
          {simulationType == "Circular Motion" ? "Z" : "Y"}
        </p>
        <p
          style={{
            position: "fixed",
            top: window.innerHeight - 120 + 80 + "px",
            left: xMin + 90 - 40 + "px",
          }}
        >
          X
        </p>
      </div>
    </div>
  );
}

export default App;
