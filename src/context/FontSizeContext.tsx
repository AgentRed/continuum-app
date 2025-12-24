import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface FontSizeContextType {
  contentScale: number;
  setContentScale: (value: number) => void;
  resetContentScale: () => void;
  increaseContentScale: () => void;
  decreaseContentScale: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = "continuum.contentScale";
const DEFAULT_SCALE = 1.0;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.25;
const SCALE_STEP = 0.05;

export const FontSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const storageKey = `${STORAGE_KEY_PREFIX}.${currentPath}`;

  // Load content scale for current path from localStorage
  const [contentScale, setContentScaleState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          console.log(`Loaded content scale for ${currentPath}:`, parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading content scale from localStorage:", e);
    }
    console.log(`Using default content scale for ${currentPath}:`, DEFAULT_SCALE);
    return DEFAULT_SCALE;
  });

  // Update content scale when path changes
  useEffect(() => {
    const newStorageKey = `${STORAGE_KEY_PREFIX}.${currentPath}`;
    try {
      const saved = localStorage.getItem(newStorageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          console.log(`Path changed to ${currentPath}, loading content scale:`, parsed);
          setContentScaleState(parsed);
        } else {
          console.log(`Path changed to ${currentPath}, using default:`, DEFAULT_SCALE);
          setContentScaleState(DEFAULT_SCALE);
        }
      } else {
        console.log(`Path changed to ${currentPath}, no saved value, using default:`, DEFAULT_SCALE);
        setContentScaleState(DEFAULT_SCALE);
      }
    } catch (e) {
      console.error("Error reading content scale from localStorage:", e);
      setContentScaleState(DEFAULT_SCALE);
    }
  }, [currentPath]);

  // Save content scale to localStorage when it changes
  const setContentScale = (value: number) => {
    const clampedValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));
    console.log(`Setting content scale for ${currentPath} to:`, clampedValue);
    setContentScaleState(clampedValue);
    
    try {
      const newStorageKey = `${STORAGE_KEY_PREFIX}.${currentPath}`;
      localStorage.setItem(newStorageKey, String(clampedValue));
      console.log(`Saved content scale to localStorage key: ${newStorageKey}`);
    } catch (e) {
      console.error("Error saving content scale to localStorage:", e);
    }
  };

  const resetContentScale = () => {
    console.log(`Resetting content scale for ${currentPath} to default:`, DEFAULT_SCALE);
    setContentScale(DEFAULT_SCALE);
  };

  const increaseContentScale = () => {
    const newValue = Math.min(MAX_SCALE, contentScale + SCALE_STEP);
    console.log(`Increasing content scale from ${contentScale} to:`, newValue);
    setContentScale(newValue);
  };

  const decreaseContentScale = () => {
    const newValue = Math.max(MIN_SCALE, contentScale - SCALE_STEP);
    console.log(`Decreasing content scale from ${contentScale} to:`, newValue);
    setContentScale(newValue);
  };

  return (
    <FontSizeContext.Provider
      value={{
        contentScale,
        setContentScale,
        resetContentScale,
        increaseContentScale,
        decreaseContentScale,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useContentScale = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useContentScale must be used within a FontSizeProvider");
  }
  return context;
};






























