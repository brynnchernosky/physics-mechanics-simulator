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
}

export const InputField = (props: IInputProps) => {
  const {
    changeValue,
    correctValue,
    effect,
    label,
    lowerBound,
    radianEquivalent,
    showIcon,
    small,
    step,
    unit,
    upperBound,
    value,
  } = props;
  let epsilon: number = 0.01;

  let width = small ? "6em" : "8em";
  let margin = small ? "0px" : "15px";

  const [tempValue, setTempValue] = useState<any>(0);
  const [tempRadianValue, setTempRadianValue] = useState(
    (Number(0) * Math.PI) / 180
  );

  console.log("temp value for field ", label, ": ", tempValue);
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
    <div style={{ display: "flex", lineHeight: "1", textAlign: "right" }}>
      {label && <div style={{ marginTop: "-10px", width: "2em" }}>{label}</div>}
      <TextField
        type="number"
        variant="standard"
        value={tempValue}
        onChange={onChange}
        sx={{ height: "1em", width: { width }, marginLeft: { margin } }}
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
      {radianEquivalent && <p>=</p>}
      {radianEquivalent && (
        <TextField
          type="number"
          variant="standard"
          value={tempRadianValue}
          onChange={onChangeRadianValue}
          sx={{ height: "1em", width: { width }, marginLeft: { margin } }}
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
