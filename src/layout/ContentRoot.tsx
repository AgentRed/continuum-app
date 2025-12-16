import React from "react";
import { Box } from "@mantine/core";
import { useContentScale } from "../context/FontSizeContext";

interface ContentRootProps {
  children: React.ReactNode;
}

const ContentRoot: React.FC<ContentRootProps> = ({ children }) => {
  const { contentScale } = useContentScale();
  
  console.log("ContentRoot: Applying zoom scale:", contentScale);

  return (
    <Box 
      style={{ 
        zoom: contentScale,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
};

export default ContentRoot;











