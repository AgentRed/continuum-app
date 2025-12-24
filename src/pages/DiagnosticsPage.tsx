import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Collapse,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";

type AuditFinding = {
  id: string;
  entityType: "DOCUMENT" | "CANONICAL_DOCUMENT";
  key: string;
  title?: string;
  severity: "OK" | "WARN" | "FAIL";
  contentLength: number;
  markdownScore?: number;
  reasons: string[];
  updatedAt: string;
};

type DiagnosticsPageProps = {
  palette: any;
  API_BASE: string;
};

export default function DiagnosticsPage({
  palette,
  API_BASE,
}: DiagnosticsPageProps) {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [reportMd, setReportMd] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch audit findings
        const findingsRes = await fetch(`${API_BASE}/api/audit/content`);
        if (!findingsRes.ok) {
          throw new Error(`HTTP ${findingsRes.status}`);
        }
        const responseData = await findingsRes.json();
        
        // Handle different response structures
        let findingsData: AuditFinding[] = [];
        if (Array.isArray(responseData)) {
          findingsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Try common property names
          findingsData = responseData.findings || responseData.data || responseData.items || [];
          if (!Array.isArray(findingsData)) {
            findingsData = [];
          }
        }
        
        setFindings(findingsData);

        // Fetch report markdown
        try {
          const reportRes = await fetch(`${API_BASE}/api/audit/content/report.md`);
          if (reportRes.ok) {
            const reportText = await reportRes.text();
            setReportMd(reportText);
          }
        } catch (err) {
          // Report is optional, don't fail if it's missing
          console.warn("Could not load report.md", err);
        }
      } catch (err: any) {
        console.error("Error loading diagnostics", err);
        setError(err?.message ?? "Failed to load diagnostics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  // Calculate summary counts
  const summary = useMemo(() => {
    if (!Array.isArray(findings)) {
      return { total: 0, ok: 0, warn: 0, fail: 0 };
    }
    const total = findings.length;
    const ok = findings.filter((f) => f.severity === "OK").length;
    const warn = findings.filter((f) => f.severity === "WARN").length;
    const fail = findings.filter((f) => f.severity === "FAIL").length;
    return { total, ok, warn, fail };
  }, [findings]);

  // Filter findings
  const filteredFindings = useMemo(() => {
    if (!Array.isArray(findings)) {
      return [];
    }
    
    let filtered = findings;

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((f) => f.severity === severityFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.key?.toLowerCase().includes(query) ||
          (f.title && f.title.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [findings, severityFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpen = (finding: AuditFinding) => {
    if (finding.entityType === "CANONICAL_DOCUMENT") {
      navigate(`/canonical-documents/${finding.id}`);
    } else if (finding.entityType === "DOCUMENT") {
      navigate(`/documents/${finding.id}`);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colorMap: Record<string, string> = {
      OK: "green",
      WARN: "yellow",
      FAIL: "red",
    };
    return (
      <Badge color={colorMap[severity] || "gray"} variant="filled" size="sm">
        {severity}
      </Badge>
    );
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Diagnostics"
        subtitle="System integrity checks and content quality audit"
        palette={palette}
      />

      {/* Summary Cards */}
      <Group gap="md">
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c={palette.textSoft}>
              Total
            </Text>
            <Text size="xl" fw={700} c={palette.text}>
              {summary.total}
            </Text>
          </Stack>
        </Paper>
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c={palette.textSoft}>
              OK
            </Text>
            <Text size="xl" fw={700} c="green">
              {summary.ok}
            </Text>
          </Stack>
        </Paper>
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c={palette.textSoft}>
              WARN
            </Text>
            <Text size="xl" fw={700} c="yellow">
              {summary.warn}
            </Text>
          </Stack>
        </Paper>
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            flex: 1,
            minWidth: 120,
          }}
        >
          <Stack gap="xs">
            <Text size="xs" c={palette.textSoft}>
              FAIL
            </Text>
            <Text size="xl" fw={700} c="red">
              {summary.fail}
            </Text>
          </Stack>
        </Paper>
      </Group>

      {/* Report Section */}
      {reportMd && (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack gap="md">
            <Button
              variant="subtle"
              leftSection={
                <Icons.ChevronDown
                  size={16}
                  style={{
                    transform: showReport ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              }
              onClick={() => setShowReport(!showReport)}
              styles={{
                root: {
                  color: palette.text,
                  alignSelf: "flex-start",
                },
              }}
            >
              {showReport ? "Hide" : "View"} Report
            </Button>
            <Collapse in={showReport}>
              <Paper
                p="md"
                style={{
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                  fontFamily: "monospace",
                  fontSize: "12px",
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              >
                <Text
                  component="pre"
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    color: palette.text,
                    fontFamily: "monospace",
                  }}
                >
                  {reportMd}
                </Text>
              </Paper>
            </Collapse>
          </Stack>
        </Paper>
      )}

      {/* Findings Table */}
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        <Stack gap="md">
          {/* Filters */}
          <Group gap="md">
            <Select
              label="Severity"
              placeholder="All"
              value={severityFilter}
              onChange={(value) => setSeverityFilter(value || "all")}
              data={[
                { value: "all", label: "All" },
                { value: "FAIL", label: "FAIL" },
                { value: "WARN", label: "WARN" },
                { value: "OK", label: "OK" },
              ]}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
            <TextInput
              label="Search"
              placeholder="Search by key or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
          </Group>

          {loading && (
            <LoadingRow message="Loading diagnostics..." palette={palette} />
          )}

          {error && <ErrorState message={error} palette={palette} />}

          {!loading && !error && filteredFindings.length === 0 && (
            <EmptyState
              message={
                findings.length === 0
                  ? "No findings found."
                  : "No findings match the current filters."
              }
              palette={palette}
            />
          )}

          {!loading && !error && filteredFindings.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "8%" }}>Severity</Table.Th>
                  <Table.Th style={{ width: "12%" }}>Entity Type</Table.Th>
                  <Table.Th style={{ width: "20%" }}>Key / Title</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>
                    Content Length
                  </Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>
                    Markdown Score
                  </Table.Th>
                  <Table.Th style={{ width: "20%" }}>Reasons</Table.Th>
                  <Table.Th style={{ width: "10%" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>
                    Action
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredFindings.map((finding) => (
                  <Table.Tr key={finding.id}>
                    <Table.Td style={{ width: "8%" }}>
                      {getSeverityBadge(finding.severity)}
                    </Table.Td>
                    <Table.Td style={{ width: "12%" }}>
                      <Text size="sm" c={palette.text}>
                        {finding.entityType === "CANONICAL_DOCUMENT"
                          ? "Canonical"
                          : "Document"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                        {finding.title || finding.key}
                      </Text>
                      {finding.title && (
                        <Text size="xs" c={palette.textSoft} lineClamp={1}>
                          {finding.key}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Text size="sm" c={palette.text}>
                        {finding.contentLength.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Text size="sm" c={palette.text}>
                        {finding.markdownScore !== undefined
                          ? `${finding.markdownScore}/10`
                          : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="sm" lineClamp={2} c={palette.text}>
                        {finding.reasons.length > 0
                          ? finding.reasons.join(", ")
                          : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%" }}>
                      <Text size="xs" c={palette.textSoft}>
                        {formatDate(finding.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => handleOpen(finding)}
                        styles={{
                          root: {
                            color: palette.accent,
                          },
                        }}
                      >
                        Open
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

