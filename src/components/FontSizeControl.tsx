import React, { useState } from "react";
import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus, IconLetterA } from "@tabler/icons-react";
import { useContentScale } from "../context/FontSizeContext";

const FontSizeControl: React.FC = () => {
  const { contentScale, increaseContentScale, decreaseContentScale, resetContentScale } = useContentScale();
  const [flash, setFlash] = useState(false);

  const MIN_SCALE = 0.85;
  const MAX_SCALE = 1.25;
  const DEFAULT_SCALE = 1.0;

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("FontSizeControl: handleDecrease clicked, current contentScale:", contentScale);
    decreaseContentScale();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("FontSizeControl: handleIncrease clicked, current contentScale:", contentScale);
    increaseContentScale();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("FontSizeControl: handleReset clicked, current contentScale:", contentScale);
    resetContentScale();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  return (
    <div
      style={{
        pointerEvents: "auto",
        zIndex: 10000,
        border: flash ? "2px solid #ffc300" : "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "6px",
        padding: "4px 6px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <Group gap={4} align="center">
        <Tooltip label="Smaller" withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleDecrease}
            disabled={contentScale <= MIN_SCALE}
            styles={{
              root: {
                color: "#ffffff",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              },
            }}
          >
            <IconMinus size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Text size" withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleReset}
            disabled={contentScale === DEFAULT_SCALE}
            styles={{
              root: {
                color: "#ffffff",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              },
            }}
          >
            <IconLetterA size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Larger" withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleIncrease}
            disabled={contentScale >= MAX_SCALE}
            styles={{
              root: {
                color: "#ffffff",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                "&:disabled": {
                  opacity: 0.5,
                  cursor: "not-allowed",
                },
              },
            }}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </Tooltip>
        <Text size="xs" c="#ffffff" style={{ minWidth: "36px", textAlign: "center", fontFamily: "monospace" }}>
          {Math.round(contentScale * 100)}%
        </Text>
      </Group>
    </div>
  );
};

export default FontSizeControl;





