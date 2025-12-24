import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import ContentCard from "../ui/ContentCard";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  content?: string;
};

type WorkspaceGovernancePageProps = {
  palette: any;
  API_BASE: string;
};

export default function WorkspaceGovernancePage({
  palette,
  API_BASE,
}: WorkspaceGovernancePageProps) {
  const navigate = useNavigate();
  const [document, setDocument] = useState<CanonicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all canonical documents and find the one with matching key
        const res = await fetch(`${API_BASE}/api/canonical-documents`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const documents = (await res.json()) as CanonicalDocument[];
        
        // Store available keys for error messages
        const keys = documents.map((doc) => doc.key);
        setAvailableKeys(keys);
        
        // Try exact match first
        let govDoc = documents.find(
          (doc) => doc.key === "continuum-workspace-governance.md"
        );

        // Try case-insensitive match
        if (!govDoc) {
          govDoc = documents.find(
            (doc) => doc.key.toLowerCase() === "continuum-workspace-governance.md"
          );
        }

        // Try partial match (contains both "governance" and "workspace")
        if (!govDoc) {
          govDoc = documents.find(
            (doc) => {
              const keyLower = doc.key.toLowerCase();
              return keyLower.includes("governance") && keyLower.includes("workspace");
            }
          );
        }

        if (!govDoc) {
          const availableKeysStr = keys.join(", ");
          console.error("Available canonical document keys:", availableKeysStr);
          throw new Error(
            `Workspace governance document not found. Looking for key: "continuum-workspace-governance.md". Available keys: ${availableKeysStr || "none"}`
          );
        }

        // Fetch the full document content
        const docRes = await fetch(
          `${API_BASE}/api/canonical-documents/${govDoc.id}`
        );
        if (!docRes.ok) {
          throw new Error(`HTTP ${docRes.status}`);
        }
        const fullDoc = (await docRes.json()) as CanonicalDocument;
        setDocument(fullDoc);
      } catch (err: any) {
        console.error("Error loading workspace governance document", err);
        setError(err?.message ?? "Failed to load workspace governance document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [API_BASE]);

  if (loading) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <LoadingRow message="Loading workspace governance..." palette={palette} />
        </ContentCard>
      </Stack>
    );
  }

  if (error || !document) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <Stack gap="md">
            <ErrorState message={error || "Workspace governance document not found"} palette={palette} />
            {availableKeys.length > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={600} c={palette.text}>
                  Available canonical document keys:
                </Text>
                <Text size="sm" c={palette.textSoft} style={{ fontFamily: "var(--font-mono)" }}>
                  {availableKeys.join(", ")}
                </Text>
              </Stack>
            )}
          </Stack>
        </ContentCard>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Workspace Governance"
        subtitle="Workspace-level governance rules and policies"
        palette={palette}
        right={
          <Button
            leftSection={<Icons.ArrowUpRight size={16} />}
            onClick={() => navigate(`/canonical-documents/${document.id}`)}
            size="sm"
            variant="subtle"
            styles={{
              root: {
                color: palette.text,
              },
            }}
          >
            Open Canonical Doc
          </Button>
        }
      />

      <ContentCard palette={palette}>
        {document.content ? (
          <DocumentViewer content={document.content} palette={palette} maxHeight="none" />
        ) : (
          <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
            No content available.
          </Text>
        )}
      </ContentCard>
    </Stack>
  );
}

