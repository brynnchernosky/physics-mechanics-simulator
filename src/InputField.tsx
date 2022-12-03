import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
export interface IInputProps {
  label?: JSX.Element;
  lowerBound: number;
  changeValue: (val: number) => any;
  step: number;
  unit: string;
  upperBound: number;
  value: number | string | Array<number | string>;
  correctValue?: number;
  showIcon?: boolean;
  effect?: (val: number) => any;
  radianEquivalent?: boolean;
  small?: boolean;
  mode?: string;
}

export const InputField = (props: IInputProps) => {
  const {
    changeValue,
    correctValue,
    effect,
    label,
    lowerBound,
    mode,
    radianEquivalent,
    showIcon,
    small,
    step,
    unit,
    upperBound,
    value,
  } = props;
  let epsilon: number = 0.01;

  let width = small ? "6em" : "7em";
  let margin = small ? "0px" : "10px";

  const [tempValue, setTempValue] = useState<any>(
    mode != "Freeform" && !showIcon ? 0 : value
  );

  const [tempRadianValue, setTempRadianValue] = useState(
    mode != "Freeform" && !showIcon ? 0 : (Number(value) * Math.PI) / 180
  );

  useEffect(() => {
    if (mode == "Freeform") {
      if (Math.abs(tempValue - Number(value)) > 1) {
        setTempValue(Number(value));
      }
    }
  }, [value]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value == "" ? 0 : Number(event.target.value);
    if (value > upperBound) {
      value = upperBound;

      if (
        label ===
        (
          <p>
            &mu;<sub>k</sub>
          </p>
        )
      ) {
        // add alert "Coefficient of kinetic friction must be less than coefficient of static friction"
      }
    } else if (value < lowerBound) {
      value = lowerBound;
    }
    changeValue(value);
    setTempValue(event.target.value == "" ? event.target.value : value);
    setTempRadianValue((value * Math.PI) / 180);
    if (effect) {
      effect(value);
    }
  };

  const onChangeRadianValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value === "" ? 0 : Number(event.target.value);
    if (value > 2 * Math.PI) {
      value = 2 * Math.PI;
    } else if (value < 0) {
      value = 0;
    }
    changeValue((value * 180) / Math.PI);
    setTempValue((value * 180) / Math.PI);
    setTempRadianValue(value);
    if (effect) {
      effect((value * 180) / Math.PI);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        lineHeight: "1",
        textAlign: "right",
      }}
    >
      {label && (
        <div
          style={{ marginTop: "0.3em", marginBottom: "-0.5em", width: "2em" }}
        >
          {label}
        </div>
      )}
      <TextField
        type="number"
        variant="standard"
        value={tempValue}
        onChange={onChange}
        sx={{
          height: "1em",
          width: { width },
          marginLeft: { margin },
          zIndex: "modal",
        }}
        inputProps={{
          step: step,
          min: lowerBound,
          max: upperBound,
          type: "number",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {Math.abs(Number(value) - (correctValue ?? 0)) < epsilon &&
                showIcon && <TaskAltIcon color={"success"} />}
              {Math.abs(Number(value) - (correctValue ?? 0)) >= epsilon &&
                showIcon && <ErrorOutlineIcon color={"error"} />}
            </InputAdornment>
          ),
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
      />
      {radianEquivalent && (
        <div
          style={{ marginTop: "0.3em", marginBottom: "-0.5em", width: "1em" }}
        >
          <p>≈</p>
        </div>
      )}
      {radianEquivalent && (
        <TextField
          type="number"
          variant="standard"
          value={tempRadianValue}
          onChange={onChangeRadianValue}
          sx={{
            height: "1em",
            width: { width },
            marginLeft: { margin },
            zIndex: "modal",
          }}
          inputProps={{
            step: Math.PI / 8,
            min: 0,
            max: 2 * Math.PI,
            type: "number",
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end">rad</InputAdornment>,
          }}
        />
      )}
    </div>
  );
};
