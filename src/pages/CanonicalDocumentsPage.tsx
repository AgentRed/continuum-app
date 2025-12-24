import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import ContentQualityBadge from "../components/ContentQualityBadge";
import DocumentHealthIndicator from "../components/DocumentHealthIndicator";
import { useContentQuality } from "../context/ContentQualityContext";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  governed: boolean;
  updatedAt: string;
};

type CanonicalDocumentsPageProps = {
  palette: any;
  API_BASE: string;
};

export default function CanonicalDocumentsPage({
  palette,
  API_BASE,
}: CanonicalDocumentsPageProps) {
  const navigate = useNavigate();
  const { refresh: refreshQuality, loading: qualityLoading, canonicalById, canonicalByKey } = useContentQuality();
  const [documents, setDocuments] = useState<CanonicalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/canonical-documents`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as CanonicalDocument[];
        setDocuments(data);
      } catch (err: any) {
        console.error("Error loading canonical documents", err);
        setError(err?.message ?? "Failed to load canonical documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Canonical Documents"
        subtitle="Browse canonical documents across the system."
        palette={palette}
        right={
          <Button
            leftSection={<Icons.Refresh size={16} />}
            onClick={refreshQuality}
            size="sm"
            loading={qualityLoading}
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Refresh Quality
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
            <LoadingRow message="Loading canonical documents..." palette={palette} />
          )}

          {error && (
            <ErrorState message={error} palette={palette} />
          )}

          {!loading && !error && documents.length === 0 && (
            <EmptyState message="No canonical documents found." palette={palette} />
          )}

          {!loading && !error && documents.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "18%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "18%" }}>Key</Table.Th>
                  <Table.Th style={{ width: "12%", textAlign: "center" }}>
                    Health
                  </Table.Th>
                  <Table.Th style={{ width: "12%", textAlign: "center" }}>
                    Quality
                  </Table.Th>
                  <Table.Th style={{ width: "12%", textAlign: "center" }}>
                    Governed
                  </Table.Th>
                  <Table.Th style={{ width: "28%", whiteSpace: "nowrap" }}>
                    Updated
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr
                    key={doc.id}
                    onClick={() => navigate(`/canonical-documents/${doc.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "18%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                        {doc.title || doc.key}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "18%" }}>
                      <Text size="sm" lineClamp={1} c={palette.text}>
                        {doc.key}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "12%", textAlign: "center" }}>
                      <DocumentHealthIndicator
                        entityType="CANONICAL_DOCUMENT"
                        id={doc.id}
                        key={doc.key}
                        compact
                      />
                    </Table.Td>
                    <Table.Td style={{ width: "12%", textAlign: "center" }}>
                      {(() => {
                        const auditItem = canonicalById[doc.id] || (doc.key ? canonicalByKey[doc.key.toLowerCase()] : null);
                        return (
                          <ContentQualityBadge
                            severity={auditItem?.severity || null}
                            reasons={auditItem?.reasons || []}
                            compact
                          />
                        );
                      })()}
                    </Table.Td>
                    <Table.Td style={{ width: "12%", textAlign: "center" }}>
                      <Badge
                        color={doc.governed ? "yellow" : "blue"}
                        variant="filled"
                        size="sm"
                      >
                        {doc.governed ? "Governed" : "Standard"}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: "28%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {formatDate(doc.updatedAt)}
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


