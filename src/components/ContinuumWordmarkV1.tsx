import React from "react";

// V1: Classic teal-to-warm HSL gradient (preserved exactly as current production)
export default function ContinuumWordmarkV1() {
  const text = "CONTINUUM";
  const letters = text.split("");

  const getClassicColor = (i: number, n: number) => {
    const startHue = 170; // teal
    const endHue = 20; // warm orange
    const saturation = 90;
    const lightness = 70;
    const t = n <= 1 ? 0 : i / (n - 1);
    const h = startHue + (endHue - startHue) * t;
    return `hsl(${h}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-logo)",
        fontWeight: 400,
        fontSize: "2.44140625rem",
        letterSpacing: "0.08em",
        display: "flex",
        alignItems: "center",
        lineHeight: 1.2,
      }}
    >
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          style={{
            color: getClassicColor(i, letters.length),
            display: "inline-block",
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

