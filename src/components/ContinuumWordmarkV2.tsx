import React from "react";

// V2: Full-spectrum palette gradient (9-color palette)
const PALETTE = [
  "#005F73",
  "#0A9396",
  "#94D2BD",
  "#E9D8A6",
  "#EE9B00",
  "#CA6702",
  "#BB3E03",
  "#AE2012",
  "#9B2226",
];

// Linear interpolation helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Interpolate between two hex colors
function interpolateColor(color1: string, color2: string, t: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(lerp(rgb1[0], rgb2[0], t));
  const g = Math.round(lerp(rgb1[1], rgb2[1], t));
  const b = Math.round(lerp(rgb1[2], rgb2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

// Get color for a letter index by interpolating across the palette
function getSpectrumColor(index: number, totalLetters: number): string {
  if (totalLetters <= 1) {
    return PALETTE[0];
  }

  // Map index to position in palette (0 to palette.length - 1)
  const palettePosition = (index / (totalLetters - 1)) * (PALETTE.length - 1);
  const paletteIndex = Math.floor(palettePosition);
  const t = palettePosition - paletteIndex;

  // If we're at the last palette color, return it
  if (paletteIndex >= PALETTE.length - 1) {
    return PALETTE[PALETTE.length - 1];
  }

  // Interpolate between two adjacent palette colors
  return interpolateColor(PALETTE[paletteIndex], PALETTE[paletteIndex + 1], t);
}

export default function ContinuumWordmarkV2() {
  const text = "CONTINUUM";
  const letters = text.split("");

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
            color: getSpectrumColor(i, letters.length),
            display: "inline-block",
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

