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

  let wallStyle = {
    width: length + "%",
    height: 0.5 + "vw",
    position: "absolute" as "absolute",
    left: xPos + "%",
    top: yPos + "%",
    backgroundColor: "#6c7b8b",
    zIndex: -1000,
    margin: 0,
    padding: 0,
  };
  if (angleInDegrees != 0) {
    wallStyle.width = 0.5 + "vw";
    wallStyle.height = length + "%";
  }

  return <div style={wallStyle}></div>;
};
