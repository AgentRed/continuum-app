import React from "react";
import { Badge, Tooltip } from "@mantine/core";
import { useAudit } from "../context/AuditContext";
import type { AuditEntityType } from "../lib/auditApi";

type ContentStatusBadgeProps = {
  palette: any;
  entityType: AuditEntityType;
  id?: string;
  key?: string;
  compact?: boolean;
};

export default function ContentStatusBadge({
  palette,
  entityType,
  id,
  key: keyProp,
  compact = true,
}: ContentStatusBadgeProps) {
  const { getBestMatch } = useAudit();
  
  const item = getBestMatch({ entityType, id, key: keyProp });
  
  if (!item) {
    return null;
  }

  const getColor = () => {
    switch (item.severity) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tooltipContent = (
    <div>
      <div><strong>Severity:</strong> {item.severity}</div>
      {item.reasons.length > 0 && (
        <div><strong>Reasons:</strong> {item.reasons.join(", ")}</div>
      )}
      <div><strong>Content Length:</strong> {item.contentLength}</div>
      <div><strong>Updated:</strong> {formatDate(item.updatedAt)}</div>
    </div>
  );

  return (
    <Tooltip label={tooltipContent} withArrow>
      <Badge
        color={getColor()}
        variant="filled"
        size={compact ? "sm" : "md"}
      >
        {item.severity}
      </Badge>
    </Tooltip>
  );
}

