import React from "react";
import { Group, Text, Tooltip } from "@mantine/core";
import { Icons } from "../ui/icons";
import { useContentQuality } from "../context/ContentQualityContext";
import type { AuditItem } from "../lib/auditApi";

type DocumentHealthIndicatorProps = {
  entityType: "DOCUMENT" | "CANONICAL_DOCUMENT";
  id?: string;
  key?: string;
  title?: string;
  content?: string;
  markdownScore?: number;
  compact?: boolean;
};

type HealthStatus = {
  severity: "OK" | "WARN" | "FAIL";
  label: string;
  icon: React.ReactNode;
  color: string;
};

export default function DocumentHealthIndicator({
  entityType,
  id,
  key: keyProp,
  title,
  content,
  markdownScore,
  compact = false,
}: DocumentHealthIndicatorProps) {
  const { documentById, documentByKey, canonicalById, canonicalByKey } = useContentQuality();

  // Try to get audit item from context
  let auditItem: AuditItem | undefined;
  if (entityType === "DOCUMENT") {
    auditItem = id ? documentById[id] : (keyProp ? documentByKey[keyProp.toLowerCase()] : undefined);
  } else {
    auditItem = id ? canonicalById[id] : (keyProp ? canonicalByKey[keyProp.toLowerCase()] : undefined);
  }

  // Determine severity
  let severity: "OK" | "WARN" | "FAIL" = "OK";
  if (auditItem) {
    severity = auditItem.severity;
  } else {
    // Infer from content if audit not available
    if (!content || content.trim().length === 0) {
      severity = "FAIL";
    } else if (markdownScore !== undefined && markdownScore <= 2) {
      severity = "WARN";
    }
  }

  const getHealthStatus = (): HealthStatus => {
    switch (severity) {
      case "OK":
        return {
          severity: "OK",
          label: "Healthy",
          icon: <Icons.Approve size={12} />,
          color: "green",
        };
      case "WARN":
        return {
          severity: "WARN",
          label: "Formatting issues",
          icon: <Icons.Alert size={12} />,
          color: "yellow",
        };
      case "FAIL":
        return {
          severity: "FAIL",
          label: "Missing or empty",
          icon: <Icons.Circle size={12} />,
          color: "red",
        };
      default:
        return {
          severity: "OK",
          label: "Healthy",
          icon: <Icons.Approve size={12} />,
          color: "green",
        };
    }
  };

  const status = getHealthStatus();
  const reasons = auditItem?.reasons || [];

  const tooltipContent = reasons.length > 0 ? (
    <div>
      <div><strong>Issues:</strong> {reasons.join(", ")}</div>
    </div>
  ) : null;

  const indicator = (
    <Group gap={4} align="center" style={{ display: "inline-flex" }}>
      <Text c={status.color} style={{ display: "flex", alignItems: "center" }}>
        {status.icon}
      </Text>
      {!compact && (
        <Text size="xs" c={status.color}>
          {status.label}
        </Text>
      )}
    </Group>
  );

  if (tooltipContent) {
    return (
      <Tooltip label={tooltipContent} withArrow>
        {indicator}
      </Tooltip>
    );
  }

  return indicator;
}

