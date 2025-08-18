"use client";
import * as React from "react";

interface CircularProgressProps {
  value?: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  value = 0,
  size = 100,
  strokeWidth = 10,
}: CircularProgressProps) {
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [offset, setOffset] = React.useState(
    circumference - (safeValue / 100) * circumference
  );

  React.useEffect(() => {
    const progressOffset =
      circumference - (safeValue / 100) * circumference;
    setOffset(progressOffset);
  }, [safeValue, circumference]);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#3b82f6"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transition: "stroke-dashoffset 0.5s ease",
        }}
      />
      <text
        x="50%"
        y="50%"
        dy="0.3em"
        textAnchor="middle"
        className="fill-current text-lg font-semibold rotate-[90deg]"
      >
        {safeValue}%
      </text>
    </svg>
  );
}
