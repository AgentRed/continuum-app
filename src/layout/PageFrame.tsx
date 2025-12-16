import React from "react";
import { Box, Group } from "@mantine/core";
import FontSizeControl from "../components/FontSizeControl";

interface PageFrameProps {
  children: React.ReactNode;
}

const PageFrame: React.FC<PageFrameProps> = ({ children }) => {
  return (
    <Box style={{ width: "100%", maxWidth: "none" }}>
      <Group justify="flex-end" mb="sm" style={{ pointerEvents: "auto" }}>
        <FontSizeControl />
      </Group>
      <Box style={{ width: "100%", maxWidth: "none", flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageFrame;











