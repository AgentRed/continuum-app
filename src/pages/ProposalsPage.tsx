import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Badge,
  Button,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import { listProposals, type Proposal } from "../lib/proposalsApi";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import ContentQualityBadge from "../components/ContentQualityBadge";
import { useContentQuality } from "../context/ContentQualityContext";

type ProposalsPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ProposalsPage({
  palette,
  API_BASE,
}: ProposalsPageProps) {
  const navigate = useNavigate();
  const { canonicalById } = useContentQuality();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract canonical document ID from proposal content
  const getCanonicalDocIdFromProposal = (proposal: Proposal): string | null => {
    if (proposal.status !== "APPROVED" || !proposal.content) {
      return null;
    }
    try {
      const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
      const match = proposal.content.match(jsonBlockRegex);
      if (!match || !match[1]) {
        return null;
      }
      const parsed = JSON.parse(match[1].trim());
      if (parsed.actions && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
        const firstAction = parsed.actions[0];
        if (firstAction.type === "CANONICAL_DOCUMENT_UPDATE" && firstAction.id) {
          return firstAction.id;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProposals(API_BASE);
      setProposals(data);
    } catch (err: any) {
      console.error("Error loading proposals", err);
      setError(err?.message ?? "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [API_BASE]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: Proposal["status"]) => {
    switch (status) {
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
  };

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Proposals"
        subtitle="Browse proposals for system changes."
        palette={palette}
        right={
          <Button
            leftSection={<Icons.Refresh size={16} />}
            onClick={fetchProposals}
            size="sm"
            loading={loading}
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Refresh
          </Button>
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
          {loading && (
            <LoadingRow message="Loading proposals..." palette={palette} />
          )}

          {error && (
            <ErrorState message={error} palette={palette} />
          )}

          {!loading && !error && proposals.length === 0 && (
            <EmptyState message="No proposals found." palette={palette} />
          )}

          {!loading && !error && proposals.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "40%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "15%", textAlign: "center" }}>
                    Status
                  </Table.Th>
                  <Table.Th style={{ width: "15%", textAlign: "center" }}>
                    Quality
                  </Table.Th>
                  <Table.Th style={{ width: "30%", whiteSpace: "nowrap" }}>
                    Updated
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {proposals.map((proposal) => (
                  <Table.Tr
                    key={proposal.id}
                    onClick={() => navigate(`/proposals/${proposal.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "40%" }}>
                      <Text
                        size="sm"
                        fw={500}
                        lineClamp={1}
                        c={palette.text}
                        component={Link}
                        to={`/proposals/${proposal.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textDecoration: "none" }}
                      >
                        {proposal.title}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "15%", textAlign: "center" }}>
                      <Badge
                        color={getStatusColor(proposal.status)}
                        variant="filled"
                        size="sm"
                      >
                        {proposal.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: "15%", textAlign: "center" }}>
                      {(() => {
                        const canonicalDocId = getCanonicalDocIdFromProposal(proposal);
                        if (!canonicalDocId) {
                          return null;
                        }
                        const auditItem = canonicalById[canonicalDocId];
                        return (
                          <ContentQualityBadge
                            severity={auditItem?.severity || null}
                            reasons={auditItem?.reasons || []}
                            compact
                          />
                        );
                      })()}
                    </Table.Td>
                    <Table.Td style={{ width: "30%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {formatDate(proposal.updatedAt)}
                      </Text>
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
