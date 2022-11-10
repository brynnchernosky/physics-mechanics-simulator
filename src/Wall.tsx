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
    left: 0,
    top: window.innerHeight * 0.8 + "px",
    backgroundColor: "#6c7b8b",
    zIndex: -1000,
    margin: 0,
    padding: 0,
  };

  return <div style={wallStyle}></div>;
};
