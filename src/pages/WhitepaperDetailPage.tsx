import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import DocumentViewer from "../components/DocumentViewer";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import {
  listCanonicalDocuments,
  getCanonicalDocument,
  findCanonicalByKey,
  type CanonicalDocument,
} from "../lib/canonicalDocsApi";

type WhitepaperDetailPageProps = {
  palette: any;
  API_BASE: string;
};

export default function WhitepaperDetailPage({
  palette,
  API_BASE,
}: WhitepaperDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<CanonicalDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("No whitepaper identifier provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Decode the identifier
        const decoded = decodeURIComponent(id);

        let doc: CanonicalDocument | null = null;

        // Try finding by key first
        try {
          const allDocs = await listCanonicalDocuments(API_BASE);
          doc = findCanonicalByKey(allDocs, decoded);
        } catch (err) {
          // Continue to try by ID
        }

        // If not found by key, try by ID
        if (!doc) {
          try {
            doc = await getCanonicalDocument(API_BASE, decoded);
          } catch (err) {
            // ID lookup failed
          }
        }

        if (!doc) {
          setError(`Whitepaper not found: ${decoded}`);
          return;
        }

        // If doc doesn't have content, fetch it again
        if (!doc.content) {
          doc = await getCanonicalDocument(API_BASE, doc.id);
        }

        setDocument(doc);
      } catch (err: any) {
        console.error("Error loading whitepaper", err);
        setError(err?.message ?? "Failed to load whitepaper");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, API_BASE]);

  if (loading) {
    return (
      <Stack gap="md">
        <PageHeaderCard
          title="Whitepaper"
          subtitle="Loading..."
          palette={palette}
        />
        <LoadingRow palette={palette} />
      </Stack>
    );
  }

  if (error || !document) {
    return (
      <Stack gap="md">
        <PageHeaderCard
          title="Whitepaper"
          subtitle="Error"
          palette={palette}
        />
        <ErrorState
          message={error || "Whitepaper not found"}
          palette={palette}
        />
        <Group>
          <Button
            variant="subtle"
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={() => navigate("/whitepapers")}
            styles={{
              root: { color: palette.text },
            }}
          >
            Back to Whitepapers
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageHeaderCard
        title={document.title || document.key}
        subtitle="Long-form system paper"
        palette={palette}
        right={
          <Group gap="xs">
            <Button
              variant="subtle"
              leftSection={<Icons.ArrowLeft size={16} />}
              onClick={() => navigate("/whitepapers")}
              styles={{
                root: { color: palette.text },
              }}
            >
              Back
            </Button>
            <Button
              variant="subtle"
              leftSection={<Icons.Edit size={16} />}
              component={Link}
              to={`/canonical-documents/${document.id}`}
              styles={{
                root: { color: palette.text },
              }}
            >
              Edit
            </Button>
          </Group>
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
        <DocumentViewer
          content={document.content || ""}
          palette={palette}
        />
      </Paper>
    </Stack>
  );
}

