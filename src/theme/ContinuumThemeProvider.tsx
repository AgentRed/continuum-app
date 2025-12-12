// src/theme/ContinuumThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import {
  continuumPalettes,
  ContinuumPaletteKey,
  getPaletteOptions,
} from "./palettes";

interface ContinuumThemeContextValue {
  paletteKey: ContinuumPaletteKey;
  setPaletteKey: (key: ContinuumPaletteKey) => void;
  paletteOptions: { value: string; label: string; description?: string }[];
}

const ContinuumThemeContext = createContext<ContinuumThemeContextValue | null>(
  null
);

function buildColorScale(hex: string): string[] {
  // Simple scale, same color at all positions for now.
  // We can refine this later.
  return new Array(10).fill(hex);
}

function createMantineThemeFromPalette(paletteKey: ContinuumPaletteKey) {
  const palette = continuumPalettes[paletteKey];

  return createTheme({
    primaryColor: "primary",
    colors: {
      primary: buildColorScale(palette.colors.primary),
      background: buildColorScale(palette.colors.background),
      surface: buildColorScale(palette.colors.surface),
      accent: buildColorScale(palette.colors.accent),
      muted: buildColorScale(palette.colors.muted),
    },
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    defaultRadius: "md",
  });
}

interface ContinuumThemeProviderProps {
  children: ReactNode;
}

export function ContinuumThemeProvider({
  children,
}: ContinuumThemeProviderProps) {
  const [paletteKey, setPaletteKey] =
    useState<ContinuumPaletteKey>("navyGold");

  const theme = useMemo(
    () => createMantineThemeFromPalette(paletteKey),
    [paletteKey]
  );

  const value: ContinuumThemeContextValue = useMemo(
    () => ({
      paletteKey,
      setPaletteKey,
      paletteOptions: getPaletteOptions(),
    }),
    [paletteKey]
  );

  return (
    <ContinuumThemeContext.Provider value={value}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        {children}
      </MantineProvider>
    </ContinuumThemeContext.Provider>
  );
}

export function useContinuumTheme() {
  const ctx = useContext(ContinuumThemeContext);
  if (!ctx) {
    throw new Error(
      "useContinuumTheme must be used within a ContinuumThemeProvider"
    );
  }
  return ctx;
}
