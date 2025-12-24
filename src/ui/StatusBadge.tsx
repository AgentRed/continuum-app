import React from "react";
import { Badge } from "@mantine/core";

type StatusBadgeProps = {
  value: string;
  kind?: "proposal" | "doc" | "workspace";
};

export default function StatusBadge({ value, kind = "doc" }: StatusBadgeProps) {
  const getColor = () => {
    if (kind === "proposal") {
      switch (value) {
        case "DRAFT":
          return "blue";
        case "SUBMITTED":
          return "cyan";
        case "APPROVED":
          return "yellow";
        case "REJECTED":
          return "red";
        case "APPLIED":
          return "green";
        default:
          return "gray";
      }
    } else if (kind === "doc") {
      switch (value) {
        case "Governed":
          return "yellow";
        case "Standard":
          return "blue";
        case "Ready":
          return "green";
        case "No":
          return "gray";
        default:
          return "blue";
      }
    } else if (kind === "workspace") {
      return "yellow";
    }
    return "blue";
  };

  return (
    <Badge color={getColor()} variant="filled" size="sm">
      {value}
    </Badge>
  );
}


