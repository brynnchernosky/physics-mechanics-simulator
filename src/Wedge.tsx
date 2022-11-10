import { useState, useEffect, useCallback } from "react";
import "./Wedge.scss";

export interface IWedgeProps {
  startHeight: number;
  startWidth: number;
  startLeft: number;
}

export const Wedge = (props: IWedgeProps) => {
  const { startHeight, startWidth, startLeft } = props;

  const [height, setHeight] = useState(startHeight);
  const [width, setWidth] = useState(startWidth);
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
      Math.round(left + width) +
      "," +
      Math.round(window.innerHeight * 0.8) +
      " ";
    const coordinatePair3 =
      Math.round(left) + "," + Math.round(window.innerHeight * 0.8 - height);
    const coord = coordinatePair1 + coordinatePair2 + coordinatePair3;
    setCoordinates(coord);
  }, [left, width, height]);

  return (
    <div style={{ position: "absolute", left: "0", top: "0", zIndex: -5 }}>
      <svg width={window.innerWidth + "px"} height={window.innerHeight + "px"}>
        <polygon points={coordinates} style={{ fill: "sienna" }} />
      </svg>
    </div>
  );
};
