import { useState, useEffect, useCallback } from "react";
import "./Wedge.scss";

export interface IWedgeProps {
  startHeight: number;
  startWidth: number;
  startLeft: number;
}

export const Wedge = (props: IWedgeProps) => {
  const { startHeight, startWidth, startLeft } = props;

  const [angleInRadians, setAngleInRadians] = useState(
    Math.atan(startHeight / startWidth)
  );
  const [left, setLeft] = useState(startLeft);
  const [coordinates, setCoordinates] = useState("");

  const color = "#deb887";

  useEffect(() => {
    const coordinatePair1 =
      Math.round(left) + "," + Math.round(window.innerHeight * 0.8) + " ";
    const coordinatePair2 =
      Math.round(left + startWidth) +
      "," +
      Math.round(window.innerHeight * 0.8) +
      " ";
    const coordinatePair3 =
      Math.round(left) +
      "," +
      Math.round(window.innerHeight * 0.8 - startHeight);
    const coord = coordinatePair1 + coordinatePair2 + coordinatePair3;
    setCoordinates(coord);
  }, [left, startWidth, startHeight]);

  useEffect(() => {
    setAngleInRadians(Math.atan(startHeight / startWidth));
  }, [startWidth, startHeight]);

  return (
    <div>
      <div style={{ position: "absolute", left: "0", top: "0", zIndex: -5 }}>
        <svg
          width={window.innerWidth * 0.7 + "px"}
          height={window.innerHeight * 0.8 + "px"}
        >
          <polygon points={coordinates} style={{ fill: "burlywood" }} />
        </svg>
      </div>

      <p
        style={{
          position: "absolute",
          zIndex: 500,
          left: Math.round(left + startWidth - 80) + "px",
          top: Math.round(window.innerHeight * 0.8 - 40) + "px",
        }}
      >
        {Math.round(((angleInRadians * 180) / Math.PI) * 100) / 100}°
      </p>
    </div>
  );
};
