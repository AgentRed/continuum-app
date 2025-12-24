import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Badge,
  Button,
  Checkbox,
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
import { getContentAudit, getContentAuditReport, type ContentAuditResponse, type AuditItem } from "../lib/auditApi";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import DocumentViewer from "../components/DocumentViewer";

type ContentAuditPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ContentAuditPage({ palette, API_BASE }: ContentAuditPageProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<ContentAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOk, setShowOk] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getContentAudit(API_BASE);
      setData(result);
    } catch (err: any) {
      console.error("Error loading content audit", err);
      setError(err?.message ?? "Failed to load content audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [API_BASE]);

  useEffect(() => {
    if (reportOpen && reportContent === null) {
      const fetchReport = async () => {
        try {
          setReportLoading(true);
          setReportError(null);
          const content = await getContentAuditReport(API_BASE);
          setReportContent(content);
        } catch (err: any) {
          console.error("Error loading audit report", err);
          setReportError(err?.message ?? "Failed to load audit report");
        } finally {
          setReportLoading(false);
        }
      };
      fetchReport();
    }
  }, [reportOpen, API_BASE, reportContent]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    
    return data.items.filter((item) => {
      // Severity filter
      if (severityFilter !== "ALL" && item.severity !== severityFilter) {
        return false;
      }
      
      // Show OK filter
      if (!showOk && item.severity === "OK") {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchable = [
          item.id,
          item.key,
          item.title,
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchable.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, severityFilter, showOk, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSeverityColor = (severity: string) => {
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

  const handleRowClick = (item: AuditItem) => {
    if (item.entityType === "CANONICAL_DOCUMENT") {
      navigate(`/canonical-documents/${item.id}`);
    } else {
      navigate(`/documents/${item.id}`);
    }
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Content Audit"
        subtitle="Find empty docs and documents with weak markdown so they render cleanly."
        palette={palette}
        right={
          data && (
            <Group gap="xs">
              <Badge color="gray" variant="light">
                Total: {data.summary.total}
              </Badge>
              <Badge color="green" variant="light">
                OK: {data.summary.ok}
              </Badge>
              <Badge color="yellow" variant="light">
                WARN: {data.summary.warn}
              </Badge>
              <Badge color="red" variant="light">
                FAIL: {data.summary.fail}
              </Badge>
            </Group>
          )
        }
      />

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
          {/* Controls */}
          <Group gap="md" align="flex-end">
            <Button
              leftSection={<Icons.Refresh size={16} />}
              onClick={fetchAudit}
              size="sm"
              loading={loading}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Refresh
            </Button>
            
            <Checkbox
              label="Show OK"
              checked={showOk}
              onChange={(e) => setShowOk(e.currentTarget.checked)}
              styles={{
                label: {
                  color: palette.text,
                },
              }}
            />
            
            <Select
              label="Severity"
              value={severityFilter}
              onChange={(value) => setSeverityFilter(value || "ALL")}
              data={["ALL", "FAIL", "WARN", "OK"]}
              styles={{
                input: {
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                  color: palette.text,
                },
                dropdown: {
                  backgroundColor: palette.surface,
                },
                option: {
                  color: palette.text,
                },
                label: {
                  color: palette.text,
                },
              }}
            />
            
            <TextInput
              label="Search"
              placeholder="Filter by key, title, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: palette.background,
                  borderColor: palette.border,
                  color: palette.text,
                },
                label: {
                  color: palette.text,
                },
              }}
              style={{ flex: 1 }}
            />
          </Group>

          {/* Results */}
          {loading && (
            <LoadingRow message="Loading content audit..." palette={palette} />
          )}

          {error && (
            <ErrorState message={error} palette={palette} />
          )}

          {!loading && !error && (!data || filteredItems.length === 0) && (
            <EmptyState
              message={data ? "No items match the current filters." : "No audit data available."}
              palette={palette}
            />
          )}

          {!loading && !error && data && filteredItems.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "10%" }}>Severity</Table.Th>
                  <Table.Th style={{ width: "15%" }}>Type</Table.Th>
                  <Table.Th style={{ width: "30%" }}>Title/Key</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Markdown Score</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Content Length</Table.Th>
                  <Table.Th style={{ width: "15%" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "10%" }}>Reasons</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredItems.map((item) => (
                  <Table.Tr
                    key={`${item.entityType}-${item.id}`}
                    onClick={() => handleRowClick(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "10%" }}>
                      <Badge color={getSeverityColor(item.severity)} variant="filled" size="sm">
                        {item.severity}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: "15%" }}>
                      <Text size="sm" c={palette.text}>
                        {item.entityType === "CANONICAL_DOCUMENT" ? "Canonical" : "Document"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "30%" }}>
                      <Text
                        size="sm"
                        fw={500}
                        lineClamp={1}
                        c={palette.text}
                        component={Link}
                        to={item.entityType === "CANONICAL_DOCUMENT" 
                          ? `/canonical-documents/${item.id}`
                          : `/documents/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textDecoration: "none" }}
                      >
                        {item.title || item.key || item.id}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Text size="sm" c={palette.text}>
                        {item.markdownScore.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Text size="sm" c={palette.text}>
                        {item.contentLength}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "15%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {formatDate(item.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%" }}>
                      {item.reasons.length > 0 ? (
                        <Text size="xs" c={palette.textSoft} lineClamp={2}>
                          {item.reasons.join(", ")}
                        </Text>
                      ) : (
                        <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                          —
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}

          {/* Report Viewer */}
          <Stack gap="xs">
            <Button
              leftSection={<Icons.Alert size={16} />}
              onClick={() => setReportOpen(!reportOpen)}
              variant="subtle"
              size="sm"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              {reportOpen ? "Hide" : "View"} Markdown Report
            </Button>
            
            <Collapse in={reportOpen}>
              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                }}
              >
                {reportLoading && (
                  <LoadingRow message="Loading report..." palette={palette} />
                )}
                
                {reportError && (
                  <Text size="sm" c="red.3">
                    {reportError}
                  </Text>
                )}
                
                {!reportLoading && !reportError && reportContent && (
                  <DocumentViewer content={reportContent} palette={palette} maxHeight="none" />
                )}
              </Paper>
            </Collapse>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

