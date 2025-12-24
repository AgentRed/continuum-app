import React, { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";

const DEBUG = false;

type PaletteDef = {
  background: string;
  surface: string;
  header: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  border: string;
};

interface VUMeterProps {
  isActive: boolean;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  palette: PaletteDef;
}

// Continuum logo color palette (V2 wordmark colors)
const CONTINUUM_PALETTE = [
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
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

// Interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(lerp(rgb1[0], rgb2[0], t));
  const g = Math.round(lerp(rgb1[1], rgb2[1], t));
  const b = Math.round(lerp(rgb1[2], rgb2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
};

// Get color for a bar index by interpolating across the Continuum palette
const getContinuumColor = (index: number, totalBars: number): string => {
  if (totalBars <= 1) {
    return CONTINUUM_PALETTE[0];
  }

  const palettePosition = (index / (totalBars - 1)) * (CONTINUUM_PALETTE.length - 1);
  const paletteIndex = Math.floor(palettePosition);
  const t = palettePosition - paletteIndex;

  if (paletteIndex >= CONTINUUM_PALETTE.length - 1) {
    return CONTINUUM_PALETTE[CONTINUUM_PALETTE.length - 1];
  }

  return interpolateColor(CONTINUUM_PALETTE[paletteIndex], CONTINUUM_PALETTE[paletteIndex + 1], t);
};

export default function VUMeter({ isActive, analyser, audioContext, palette }: VUMeterProps) {
  const [barLevels, setBarLevels] = useState<number[]>(Array(24).fill(0));
  const animationFrameRef = useRef<number | null>(null);
  const barLevelsRef = useRef<number[]>(Array(24).fill(0));

  const BAR_COUNT = 24;

  useEffect(() => {
    // Defensive guard: if analyser or audioContext unavailable, hide meter
    if (!analyser || !audioContext) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (!isActive || audioContext.state === "suspended") {
      // Stop animation and decay levels
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Decay levels smoothly
      const decay = () => {
        if (!animationFrameRef.current) return; // Guard against cleanup
        const newLevels = barLevelsRef.current.map((level) => level * 0.9);
        barLevelsRef.current = newLevels;
        setBarLevels([...newLevels]);
        if (newLevels.some((l) => l > 0.01)) {
          animationFrameRef.current = requestAnimationFrame(decay);
        } else {
          animationFrameRef.current = null;
        }
      };
      if (barLevelsRef.current.some((l) => l > 0.01)) {
        animationFrameRef.current = requestAnimationFrame(decay);
      }
      return;
    }

    const draw = () => {
      // Defensive guards
      if (!analyser || !audioContext || !isActive || audioContext.state === "suspended") {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      try {
        // Get frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Bucket the spectrum into BAR_COUNT bars
        const newLevels: number[] = [];
        const binsPerBar = Math.floor(bufferLength / BAR_COUNT);

        for (let i = 0; i < BAR_COUNT; i++) {
          const binStart = i * binsPerBar;
          const binEnd = Math.min((i + 1) * binsPerBar, bufferLength);
          
          // Average magnitude in this frequency range
          let sum = 0;
          let count = 0;
          for (let j = binStart; j < binEnd; j++) {
            sum += dataArray[j];
            count++;
          }
          const avg = count > 0 ? sum / count : 0;
          
          // Normalize 0..1 (max is 255)
          let normalized = avg / 255;
          
          // Apply floor for quiet audio (show tiny baseline)
          normalized = Math.max(normalized, 0.02);
          
          // Smooth with previous level (exponential moving average)
          const prevLevel = barLevelsRef.current[i] || 0;
          const smoothed = prevLevel * 0.7 + normalized * 0.3;
          
          newLevels.push(smoothed);
        }

        barLevelsRef.current = newLevels;
        setBarLevels(newLevels);

        if (DEBUG) {
          const maxLevel = Math.max(...newLevels);
          if (maxLevel > 0.1) {
            console.log("VU max level:", maxLevel.toFixed(3));
          }
        }
      } catch (err) {
        if (DEBUG) console.error("VU meter error:", err);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, analyser, audioContext]);

  // If analyser not available, show fallback message
  if (!analyser || !audioContext) {
    return (
      <div
        style={{
          width: "100%",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          backgroundColor: palette.background,
          borderRadius: "4px",
          border: `1px solid ${palette.border}`,
        }}
      >
        <Text size="xs" c={palette.textSoft}>
          Meter unavailable
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "40px",
        display: "flex",
        alignItems: "flex-end",
        gap: "2px",
        padding: "4px",
        backgroundColor: palette.background,
        borderRadius: "4px",
        border: `1px solid ${palette.border}`,
      }}
    >
      {barLevels.map((level, index) => {
        const color = getContinuumColor(index, BAR_COUNT);
        const heightPercent = Math.round(level * 100);
        
        return (
          <div
            key={index}
            style={{
              flex: 1,
              minWidth: "2px",
              height: `${heightPercent}%`,
              minHeight: "2px", // Always show tiny baseline
              backgroundColor: color,
              borderRadius: "2px",
              transition: "height 0.05s linear", // Smooth animation
            }}
          />
        );
      })}
    </div>
  );
}
