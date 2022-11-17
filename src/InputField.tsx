import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
export interface IInputProps {
  label: JSX.Element;
  lowerBound: number;
  changeValue: (val: number) => any;
  step: number;
  unit: string;
  upperBound: number;
  value: number | string | Array<number | string>;
  effect?: (val: number) => any;
}

export const InputField = (props: IInputProps) => {
  const {
    label,
    lowerBound,
    changeValue,
    step,
    unit,
    upperBound,
    value,
    effect,
  } = props;

  const [tempValue, setTempValue] = useState(value);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value === "" ? 0 : Number(event.target.value);
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
        alert(
          "Coefficient of kinetic friction must be less than coefficient of static friction"
        );
      }
    } else if (value < lowerBound) {
      value = lowerBound;
    }
    changeValue(value);
    setTempValue(value);
    if (effect) {
      effect(value);
    }
  };

  return (
    <div style={{ display: "flex", lineHeight: "1", textAlign: "right" }}>
      <div style={{ marginTop: "-10px" }}>{label}</div>
      <TextField
        type="number"
        variant="standard"
        value={tempValue}
        onChange={onChange}
        sx={{ height: "1em", width: "5em", marginLeft: "15px" }}
        inputProps={{
          step: step,
          min: lowerBound,
          max: upperBound,
          type: "number",
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
      />
    </div>
  );
};
