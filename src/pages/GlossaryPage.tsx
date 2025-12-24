import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import DocumentEditor from "../components/DocumentEditor";
import ContentCard from "../ui/ContentCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import { getTableStyles } from "../ui/tableStyles";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  content?: string;
};

const GOVERNANCE_MATRIX_DATA = [
  {
    asset: "UI theme / palette switching",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "No",
    notes: "Local UI preference, not canon",
  },
  {
    asset: "Derived counts (node counts, document counts)",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Log as telemetry, not canon",
  },
  {
    asset: "Search index rebuild",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Deterministic, reversible",
  },
  {
    asset: "RAG embedding refresh (no text change)",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Must not alter source content",
  },
  {
    asset: "Create Workspace / Node",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Logged as a creation event",
  },
  {
    asset: "Rename Workspace / Node",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Meaning-impacting",
  },
  {
    asset: "Delete Workspace / Node",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Destructive",
  },
  {
    asset: "Add Document",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "Canonical ID must be assigned",
  },
  {
    asset: "Edit Document (non-governance)",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Content meaning can change",
  },
  {
    asset: "Edit Governance / Canon docs",
    allowedAutomatically: "No",
    approvalRequired: "Yes (strict)",
    loggingRequired: "Yes",
    notes: "Highest protection tier",
  },
  {
    asset: "Schema change / migrations",
    allowedAutomatically: "No",
    approvalRequired: "Yes (strict)",
    loggingRequired: "Yes",
    notes: "Must be planned and reversible",
  },
  {
    asset: "MCP server creation from template",
    allowedAutomatically: "Yes",
    approvalRequired: "No",
    loggingRequired: "Yes",
    notes: "If templates are pre-approved",
  },
  {
    asset: "MCP server capability change",
    allowedAutomatically: "No",
    approvalRequired: "Yes",
    loggingRequired: "Yes",
    notes: "Can expand system power",
  },
];

type GlossaryPageProps = {
  palette: any;
  API_BASE: string;
};

export default function GlossaryPage({ palette, API_BASE }: GlossaryPageProps) {
  const [document, setDocument] = useState<CanonicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all canonical documents to find the one we need
        const res = await fetch(`${API_BASE}/api/canonical-documents`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const documents = (await res.json()) as CanonicalDocument[];
        
        // Store available keys for error messages
        const keys = documents.map((doc) => doc.key);
        setAvailableKeys(keys);

        // Find the glossary document
        const glossaryDoc = documents.find(
          (doc) => doc.key === "continuum-glossary.md"
        );

        if (!glossaryDoc) {
          throw new Error(
            `Document with key "continuum-glossary.md" not found. Available keys: ${keys.join(", ")}`
          );
        }

        setDocument(glossaryDoc);
        setEditContent(glossaryDoc.content || "");
      } catch (err: any) {
        console.error("Error loading glossary document", err);
        setError(err?.message ?? "Failed to load glossary document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [API_BASE]);

  const handleEdit = () => {
    if (document) {
      setEditContent(document.content || "");
      setEditing(true);
      setSaveError(null);
    }
  };

  const handleCancel = () => {
    if (document) {
      setEditContent(document.content || "");
      setEditing(false);
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    if (!document?.id) return;

    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(`${API_BASE}/api/canonical-documents/${document.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Refetch document
      const updatedRes = await fetch(`${API_BASE}/api/canonical-documents/${document.id}`);
      if (updatedRes.ok) {
        const updatedData = (await updatedRes.json()) as CanonicalDocument;
        setDocument(updatedData);
        setEditContent(updatedData.content || "");
      }

      setEditing(false);
    } catch (err: any) {
      console.error("Error saving glossary document", err);
      setSaveError(err?.message ?? "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <LoadingRow message="Loading glossary…" palette={palette} />
        </ContentCard>
      </Stack>
    );
  }

  if (error || !document) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <Stack gap="md">
            <ErrorState message={error || "Glossary document not found"} palette={palette} />
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
    <>
      <Stack gap="md">
        {/* Glossary Content */}
        <ContentCard
          palette={palette}
          title={document.title || "Continuum Glossary"}
          right={
            <Button
              leftSection={<Icons.Edit size={16} />}
              onClick={handleEdit}
              size="sm"
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Edit
            </Button>
          }
        >
          {document.content ? (
            <DocumentViewer content={document.content} palette={palette} maxHeight="none" />
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content available.
            </Text>
          )}
        </ContentCard>

        {/* Governance Matrix */}
        <ContentCard palette={palette} title="Governance Matrix" subtitle="Governance matrix (v1)">
          <Table
            withTableBorder
            withColumnBorders
            horizontalSpacing="md"
            verticalSpacing="xs"
            styles={getTableStyles(palette)}
          >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Asset / Change Type</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Allowed Automatically?
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Approval Required?
                    </Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>
                      Logging Required?
                    </Table.Th>
                    <Table.Th>Notes</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {GOVERNANCE_MATRIX_DATA.map((row, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{row.asset}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {row.allowedAutomatically}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {row.approvalRequired}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {row.loggingRequired}
                      </Table.Td>
                      <Table.Td>{row.notes}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
        </ContentCard>
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editing}
        onClose={handleCancel}
        title="Edit Glossary"
        size="xl"
        styles={{
          content: {
            backgroundColor: palette.surface,
            maxWidth: "1100px",
          },
          body: {
            maxWidth: "1100px",
          },
        }}
      >
        <Stack gap="md" style={{ maxWidth: "1100px" }}>
          {saveError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {saveError}
            </Alert>
          )}
          <DocumentEditor
            title=""
            content={editContent}
            onTitleChange={() => {}}
            onContentChange={setEditContent}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            palette={palette}
            showTitle={false}
            minHeight="60vh"
          />
        </Stack>
      </Modal>
    </>
  );
}
