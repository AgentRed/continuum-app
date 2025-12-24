import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import PageHeaderCard from "../ui/PageHeaderCard";
import { getTableStyles } from "../ui/tableStyles";
import { listCanonicalDocuments, type CanonicalDocument } from "../lib/canonicalDocsApi";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { WHITEPAPERS_CARD_SUBTITLE } from "../content/libraryCopy";

type WhitepapersPageProps = {
  palette: any;
  API_BASE: string;
};

/**
 * Filter canonical documents to find whitepapers
 * Checks key, title, and frontmatter (if content is available)
 */
/**
 * Filter canonical documents to find whitepapers
 * Stable client-side classifier based on key patterns
 */
function isWhitepaper(doc: CanonicalDocument): boolean {
  const key = doc.key.toLowerCase();
  
  // Check key patterns:
  // - key includes "whitepaper" (case-insensitive)
  // - key starts with "continuum-" and includes "whitepaper"
  if (key.includes("whitepaper")) {
    return true;
  }
  
  if (key.startsWith("continuum-") && key.includes("whitepaper")) {
    return true;
  }

  return false;
}

export default function WhitepapersPage({ palette, API_BASE }: WhitepapersPageProps) {
  const navigate = useNavigate();
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
        
        // Filter to whitepapers
        const whitepapers = data.filter(isWhitepaper);
        setDocuments(whitepapers);
      } catch (err: any) {
        console.error("Error loading whitepapers", err);
        setError(err?.message ?? "Failed to load whitepapers");
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

  const handleRowClick = (doc: CanonicalDocument) => {
    // Navigate to canonical document view (same route used elsewhere)
    navigate(`/canonical-documents/${doc.id}`);
  };

  if (loading) {
    return (
      <Stack gap="md">
        <PageHeaderCard
          title="Whitepapers"
          subtitle={WHITEPAPERS_CARD_SUBTITLE}
          palette={palette}
        />
        <LoadingRow palette={palette} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap="md">
        <PageHeaderCard
          title="Whitepapers"
          subtitle={WHITEPAPERS_CARD_SUBTITLE}
          palette={palette}
        />
        <ErrorState message={error} palette={palette} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
        <PageHeaderCard
          title="Whitepapers"
          subtitle={WHITEPAPERS_CARD_SUBTITLE}
          palette={palette}
        />

      {documents.length === 0 ? (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <EmptyState
            message="No whitepapers found. Create canonical documents with a key containing 'whitepaper'."
            palette={palette}
          />
        </Paper>
      ) : (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Table
            withTableBorder
            withColumnBorders
            style={{ tableLayout: "fixed", width: "100%" }}
            styles={getTableStyles(palette)}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "40%" }}>Title</Table.Th>
                <Table.Th style={{ width: "40%" }}>Description</Table.Th>
                <Table.Th style={{ width: "20%" }}>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.map((doc) => (
                <Table.Tr
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td style={{ width: "40%" }}>
                    <Text size="sm" fw={500} c={palette.text}>
                      {doc.title || doc.key}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ width: "40%" }}>
                    <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                      {/* Description field not available in CanonicalDocument type */}
                      —
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ width: "20%" }}>
                    <Text size="xs" c={palette.textSoft}>
                      {formatDate(doc.updatedAt)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}

