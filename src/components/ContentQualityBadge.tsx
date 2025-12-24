import React from "react";
import { Badge, Tooltip } from "@mantine/core";

type ContentQualityBadgeProps = {
  severity?: "OK" | "WARN" | "FAIL" | null;
  reasons?: string[];
  compact?: boolean;
};

export default function ContentQualityBadge({
  severity,
  reasons = [],
  compact = true,
}: ContentQualityBadgeProps) {
  if (!severity) {
    return null;
  }

  const getColor = () => {
    switch (severity) {
      case "OK":
        return "green";
      case "WARN":
        return "yellow";
      case "FAIL":
        return "red";
      default:
        return "gray";
    }
  };

  const getLabel = () => {
    switch (severity) {
      case "OK":
        return "OK";
      case "WARN":
        return "Needs Markdown";
      case "FAIL":
        return "Empty";
      default:
        return severity;
    }
  };

  const badgeSize = compact ? "sm" : "md";

  const tooltipContent = reasons.length > 0 ? (
    <div>
      <div><strong>Reasons:</strong> {reasons.join(", ")}</div>
    </div>
  ) : null;

  const badge = (
    <Badge
      color={getColor()}
      variant="filled"
      size={badgeSize}
    >
      {getLabel()}
    </Badge>
  );

  if (tooltipContent) {
    return (
      <Tooltip label={tooltipContent} withArrow>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}

