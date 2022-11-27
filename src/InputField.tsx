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
  radianEquivalent?: boolean;
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
    radianEquivalent,
  } = props;

  const [tempValue, setTempValue] = useState(value);
  const [tempRadianValue, setTempRadianValue] = useState(
    (Number(value) * Math.PI) / 180
  );

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
      {radianEquivalent && <p>=</p>}
      {radianEquivalent && (
        <TextField
          type="number"
          variant="standard"
          value={tempRadianValue}
          onChange={onChangeRadianValue}
          sx={{ height: "1em", width: "5em", marginLeft: "15px" }}
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
