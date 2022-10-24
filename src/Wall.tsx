import { useState, useEffect } from "react";
import "./Weight.scss";

export interface Force {
  magnitude: number;
  directionInDegrees: number;
}
export interface IWallProps {
  length: number;
  xPos: number;
  yPos: number;
  angleInDegrees: number;
}

export const Wall = (props: IWallProps) => {
  const { length, xPos, yPos, angleInDegrees } = props;

  const wallStyle = {
    width: length + "%",
    height: 5 + "px",
    position: "absolute" as "absolute",
    left: xPos + "%",
    top: yPos + "%",
    backgroundColor: "#6c7b8b",
    zIndex: -1000,
  };

  return <div style={wallStyle}></div>;
};
