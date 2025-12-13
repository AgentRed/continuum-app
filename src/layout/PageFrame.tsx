import React from "react";
import { Box, Group } from "@mantine/core";
import FontSizeControl from "../components/FontSizeControl";

interface PageFrameProps {
  children: React.ReactNode;
}

const PageFrame: React.FC<PageFrameProps> = ({ children }) => {
  return (
    <Box>
      <Group justify="flex-end" mb="sm" style={{ pointerEvents: "auto" }}>
        <FontSizeControl />
      </Group>
      {children}
    </Box>
  );
};

export default PageFrame;



