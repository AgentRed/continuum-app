import React from "react";
import { Box, Text } from "@mantine/core";

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

interface AppFooterProps {
  palette: PaletteDef;
}

const AppFooter: React.FC<AppFooterProps> = ({ palette }) => {
  return (
    <Box
      style={{
        backgroundColor: palette.header || palette.surface,
        borderTop: `1px solid ${palette.border}`,
        padding: "12px 16px",
        textAlign: "center",
      }}
    >
      <Text size="xs" c={palette.textSoft}>
        Copyright 2025 J. J. Seeber and Nucleus SI, LLC, All Rights Reserved
      </Text>
    </Box>
  );
};

export default AppFooter;





