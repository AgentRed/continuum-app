import React from "react";

type ContinuumLogoSize = "sm" | "md" | "lg";

type ContinuumLogoProps = {
  size?: ContinuumLogoSize;
  className?: string;
};

const sizeStyles: Record<ContinuumLogoSize, React.CSSProperties> = {
  sm: {
    fontSize: "27px",
    letterSpacing: "0.16em",
  },
  md: {
    fontSize: "33px",
    letterSpacing: "0.2em",
  },
  lg: {
    fontSize: "39px",
    letterSpacing: "0.22em",
  },
};

export const ContinuumLogo: React.FC<ContinuumLogoProps> = ({
  size = "md",
  className,
}) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: '"Geo", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 400,
    textTransform: "uppercase",
    background:
      "linear-gradient(90deg, #0BAFB9 0%, #EFD044 30%, #E17C2D 65%, #CF3C35 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    display: "inline-block",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  };

  const style: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
  };

  return (
    <span className={className} style={style}>
      CONTINUUM
    </span>
  );
};

export default ContinuumLogo;

