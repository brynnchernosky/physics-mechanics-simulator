import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
export interface IInputProps {
  label: JSX.Element;
  unit: string;
  value: number | string | Array<number | string>;
  radianEquivalent?: boolean;
}

export const InputValue = (props: IInputProps) => {
  const { label, unit, value, radianEquivalent } = props;

  const [tempValue, setTempValue] = useState(value);
  const [tempRadianValue, setTempRadianValue] = useState(
    (Number(value) * Math.PI) / 180
  );

  return (
    <div style={{ display: "flex", lineHeight: "1", textAlign: "right" }}>
      <div style={{ marginTop: "-10px" }}>{label}</div>
      <TextField
        type="number"
        variant="standard"
        value={tempValue}
        sx={{ height: "1em", width: "5em", marginLeft: "15px" }}
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
          sx={{ height: "1em", width: "5em", marginLeft: "15px" }}
          InputProps={{
            endAdornment: <InputAdornment position="end">rad</InputAdornment>,
          }}
        />
      )}
    </div>
  );
};
