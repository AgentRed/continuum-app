// src/theme/palettes.ts

export type ContinuumPaletteKey =
  | "roseSage"
  | "slateFrost"
  | "surfSteel"
  | "evergreenLavender"
  | "navyGold";

export interface ContinuumPalette {
  key: ContinuumPaletteKey;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    accent: string;
    muted: string;
  };
}

export const continuumPalettes: Record<ContinuumPaletteKey, ContinuumPalette> = {
  roseSage: {
    key: "roseSage",
    name: "Jet Black & Blush Rose",
    description: "Deep charcoal with rosy highlights and soft sage neutrals.",
    colors: {
      background: "#2c363f", // Jet Black
      surface: "#d6dbd2",    // Dust Grey
      primary: "#e75a7c",    // Blush Rose
      accent: "#bbc7a4",     // Dry Sage
      muted: "#f2f5ea",      // Ivory
    },
  },
  slateFrost: {
    key: "slateFrost",
    name: "Blue Slate & Petal Frost",
    description: "Soft blue greys with gentle pink frost highlights.",
    colors: {
      background: "#546a76", // Blue Slate
      surface: "#dbd3c9",    // Dust Grey
      primary: "#88a0a8",    // Cool Steel
      accent: "#fad4d8",     // Petal Frost
      muted: "#b4ceb3",      // Celadon
    },
  },
  surfSteel: {
    key: "surfSteel",
    name: "Turquoise Surf",
    description: "Inky black base with bright turquoise and cool steel neutrals.",
    colors: {
      background: "#071013", // Ink Black
      surface: "#a2aebb",    // Cool Steel
      primary: "#23b5d3",    // Turquoise Surf
      accent: "#75abbc",     // Pacific Blue
      muted: "#dfe0e2",      // Alabaster Grey
    },
  },
  evergreenLavender: {
    key: "evergreenLavender",
    name: "Evergreen & Lavender",
    description: "Forest evergreen grounded with lavender and warm neutrals.",
    colors: {
      background: "#093824", // Evergreen
      surface: "#c6ccb2",    // Ash Grey
      primary: "#bf4e30",    // Rosy Copper
      accent: "#e5eafa",     // Lavender
      muted: "#ffcd78",      // Apricot Cream
    },
  },
  navyGold: {
    key: "navyGold",
    name: "Regal Navy & Gold",
    description: "Deep navies with bright gold accents for a high contrast look.",
    colors: {
      background: "#000814", // Ink Black
      surface: "#001d3d",    // Prussian Blue
      primary: "#003566",    // Regal Navy
      accent: "#ffc300",     // School Bus Yellow
      muted: "#ffd60a",      // Gold
    },
  },
};

export function getPaletteOptions() {
  return Object.values(continuumPalettes).map((palette) => ({
    value: palette.key,
    label: palette.name,
    description: palette.description,
  }));
}