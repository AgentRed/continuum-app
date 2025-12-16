import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App.tsx";
import "./index.css";

// Typography theme configuration
const theme = createTheme({
  fontFamily: '"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontFamilyMonospace: '"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  headings: {
    fontFamily: '"Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    sizes: {
      h1: { fontSize: "calc(var(--font-size-base) * 2.5)", lineHeight: "1.2" },
      h2: { fontSize: "calc(var(--font-size-base) * 2)", lineHeight: "1.3" },
      h3: { fontSize: "calc(var(--font-size-base) * 1.75)", lineHeight: "1.4" },
      h4: { fontSize: "calc(var(--font-size-base) * 1.5)", lineHeight: "1.4" },
      h5: { fontSize: "calc(var(--font-size-base) * 1.25)", lineHeight: "1.5" },
      h6: { fontSize: "calc(var(--font-size-base) * 1.1)", lineHeight: "1.5" },
    },
  },
  defaultRadius: "md",
});

// Font size initialization
function FontSizeInitializer() {
  useEffect(() => {
    const savedScale = localStorage.getItem("continuum_fontSize");
    const root = document.documentElement;
    
    // Default to 1.0 (100%) if nothing saved
    let scale = 1.0;
    if (savedScale) {
      const parsed = parseFloat(savedScale);
      if (!isNaN(parsed) && parsed >= 0.75 && parsed <= 1.5) {
        scale = parsed;
      }
    }
    const baseSize = `${scale}rem`;
    
    root.style.setProperty("--font-size-base", baseSize);
    root.style.setProperty("--font-size-scale", scale.toString());
    console.log("FontSizeInitializer: Set initial font size to", scale);
  }, []);
  
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <FontSizeInitializer />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
