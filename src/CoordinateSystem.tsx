import { useState, useEffect, useCallback } from "react";
import "./Wedge.scss";

export interface ICoordinateSystemProps {
  top: number;
  right: number;
  upAxis?: string;
}

export const CoordinateSystem = (props: ICoordinateSystemProps) => {
  const { top, right, upAxis } = props;

  return (
    <div
      style={{
        position: "fixed",
        top: top + 20 + "px",
        left: right - 80 + "px",
        zIndex: -10000,
      }}
    >
      <svg width={100 + "px"} height={100 + "px"}>
        <defs>
          <marker
            id="miniArrow"
            markerWidth="20"
            markerHeight="20"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={"#000000"} />
          </marker>
        </defs>
        <line
          x1={20}
          y1={70}
          x2={70}
          y2={70}
          stroke={"#000000"}
          strokeWidth="2"
          markerEnd="url(#miniArrow)"
        />
        <line
          x1={20}
          y1={70}
          x2={20}
          y2={20}
          stroke={"#000000"}
          strokeWidth="2"
          markerEnd="url(#miniArrow)"
        />
      </svg>
      <p
        style={{
          position: "fixed",
          top: top + 40 + "px",
          left: right - 80 + "px",
        }}
      >
        {upAxis ?? "Y"}
      </p>
      <p
        style={{
          position: "fixed",
          top: top + 80 + "px",
          left: right - 40 + "px",
        }}
      >
        X
      </p>
    </div>
  );
};
