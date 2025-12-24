import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import DocumentEditor from "../components/DocumentEditor";
import ContentCard from "../ui/ContentCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  content?: string;
};

type AboutPageProps = {
  palette: any;
  API_BASE: string;
};

export default function AboutPage({ palette, API_BASE }: AboutPageProps) {
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

        // Find the about document
        const aboutDoc = documents.find(
          (doc) => doc.key === "continuum-about.md"
        );

        if (!aboutDoc) {
          throw new Error(
            `Document with key "continuum-about.md" not found. Available keys: ${keys.join(", ")}`
          );
        }

        setDocument(aboutDoc);
        setEditContent(aboutDoc.content || "");
      } catch (err: any) {
        console.error("Error loading about document", err);
        setError(err?.message ?? "Failed to load about document");
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
      console.error("Error saving about document", err);
      setSaveError(err?.message ?? "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <LoadingRow message="Loading about page…" palette={palette} />
        </ContentCard>
      </Stack>
    );
  }

  if (error || !document) {
    return (
      <Stack gap="md">
        <ContentCard palette={palette}>
          <Stack gap="md">
            <ErrorState message={error || "About document not found"} palette={palette} />
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
        <ContentCard
          palette={palette}
          title={document.title || "About Continuum"}
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
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editing}
        onClose={handleCancel}
        title="Edit About Page"
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
