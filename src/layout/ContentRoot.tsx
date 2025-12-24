import React from "react";
import { Box } from "@mantine/core";
import { useContentScale } from "../context/FontSizeContext";

interface ContentRootProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ContentRoot: React.FC<ContentRootProps> = ({ children, style }) => {
  const { contentScale } = useContentScale();
  
  console.log("ContentRoot: Applying zoom scale:", contentScale);

  return (
    <Box 
      style={{ 
        zoom: contentScale,
        width: "100%",
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

export default ContentRoot;































