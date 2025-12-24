import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import DocumentEditor from "../components/DocumentEditor";
import ContentQualityBadge from "../components/ContentQualityBadge";
import DocumentHealthIndicator from "../components/DocumentHealthIndicator";
import { useContentQuality } from "../context/ContentQualityContext";
import { updateProposal, type Proposal } from "../lib/proposalsApi";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  governed: boolean;
  createdAt: string;
  updatedAt: string;
  content?: string;
  isCanonical?: boolean;
};

type CanonicalDocumentViewPageProps = {
  palette: any;
  API_BASE: string;
};

export default function CanonicalDocumentViewPage({
  palette,
  API_BASE,
}: CanonicalDocumentViewPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canonicalById, canonicalByKey } = useContentQuality();
  const [document, setDocument] = useState<CanonicalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copyContentSuccess, setCopyContentSuccess] = useState(false);
  const [copyKeySuccess, setCopyKeySuccess] = useState(false);
  const [jsonModalOpened, setJsonModalOpened] = useState(false);
  const [governing, setGoverning] = useState(false);
  const [governError, setGovernError] = useState<string | null>(null);
  const [alreadyGovernedNotice, setAlreadyGovernedNotice] = useState(false);
  const [togglingCanonical, setTogglingCanonical] = useState(false);
  const [canonicalError, setCanonicalError] = useState<string | null>(null);
  const [fixProposalModalOpened, setFixProposalModalOpened] = useState(false);
  const [cleanupProposalModalOpened, setCleanupProposalModalOpened] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Reset state when id changes
  useEffect(() => {
    setDocument(null);
    setLoading(true);
    setError(null);
    setEditing(false);
    setEditTitle("");
    setEditContent("");
    setSaving(false);
    setSaveError(null);
    setCopyContentSuccess(false);
    setCopyKeySuccess(false);
    setJsonModalOpened(false);
    setGoverning(false);
    setGovernError(null);
    setAlreadyGovernedNotice(false);
    setTogglingCanonical(false);
    setCanonicalError(null);
  }, [id]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("No document ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/canonical-documents/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Document not found");
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as CanonicalDocument;
        setDocument(data);
        setEditTitle(data.title || "");
        setEditContent(data.content || "");
      } catch (err: any) {
        console.error("Error loading canonical document", err);
        setError(err?.message ?? "Failed to load canonical document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, API_BASE]);

  const handleEdit = () => {
    if (document) {
      setEditTitle(document.title || "");
      setEditContent(document.content || "");
      setEditing(true);
      setSaveError(null);
    }
  };

  const handleCancel = () => {
    if (document) {
      setEditTitle(document.title || "");
      setEditContent(document.content || "");
      setEditing(false);
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    if (!id || !document) return;

    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(`${API_BASE}/api/canonical-documents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim() || undefined,
          content: editContent.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Refetch document
      const updatedRes = await fetch(`${API_BASE}/api/canonical-documents/${id}`);
      if (updatedRes.ok) {
        const updatedData = (await updatedRes.json()) as CanonicalDocument;
        setDocument(updatedData);
        setEditTitle(updatedData.title || "");
        setEditContent(updatedData.content || "");
      }

      setEditing(false);
    } catch (err: any) {
      console.error("Error saving canonical document", err);
      setSaveError(err?.message ?? "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkGoverned = async () => {
    if (!id || !document) return;

    try {
      setGoverning(true);
      setGovernError(null);
      setAlreadyGovernedNotice(false);

      const res = await fetch(`${API_BASE}/api/canonical-documents/${id}/govern`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Check if already governed
      if (data.alreadyGoverned === true) {
        setAlreadyGovernedNotice(true);
      }

      // Update local state
      setDocument((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          governed: true,
          updatedAt: data.updatedAt || prev.updatedAt,
        };
      });
    } catch (err: any) {
      console.error("Error marking document as governed", err);
      setGovernError(err?.message ?? "Failed to mark document as governed");
    } finally {
      setGoverning(false);
    }
  };

  const handleToggleCanonical = async (canonical: boolean) => {
    if (!id || !document) return;

    try {
      setTogglingCanonical(true);
      setCanonicalError(null);

      const res = await fetch(`${API_BASE}/api/documents/${id}/canonical`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ canonical }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Refetch document to get updated state
      const updatedRes = await fetch(`${API_BASE}/api/canonical-documents/${id}`);
      if (updatedRes.ok) {
        const updatedData = (await updatedRes.json()) as CanonicalDocument;
        setDocument(updatedData);
      }
    } catch (err: any) {
      console.error("Error toggling canonical", err);
      setCanonicalError(err?.message ?? "Failed to toggle canonical");
    } finally {
      setTogglingCanonical(false);
    }
  };

  const handleCopyContent = async () => {
    if (!document?.content) return;

    try {
      await navigator.clipboard.writeText(document.content);
      setCopyContentSuccess(true);
      setTimeout(() => setCopyContentSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy content", err);
    }
  };

  const handleCopyKey = async () => {
    if (!document?.key) return;

    try {
      await navigator.clipboard.writeText(document.key);
      setCopyKeySuccess(true);
      setTimeout(() => setCopyKeySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy key", err);
    }
  };

  const handleCreateFixProposal = async () => {
    if (!document || !id) return;

    try {
      setCreatingProposal(true);
      setProposalError(null);

      const proposalTitle = `Fix: ${document.title || document.key}`;
      const proposalContent = `## Explanation

This proposal fixes an empty or invalid canonical document that blocks system readiness.

## Action

\`\`\`json
{
  "actions": [
    {
      "type": "CANONICAL_DOCUMENT_UPDATE",
      "id": "${id}",
      "content": ""
    }
  ]
}
\`\`\`

## Content

Please provide the markdown content for this document below.`;

      // Create proposal via API
      const res = await fetch(`${API_BASE}/api/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: proposalTitle,
          content: proposalContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const newProposal = await res.json();
      setFixProposalModalOpened(false);
      navigate(`/proposals/${newProposal.id}`);
    } catch (err: any) {
      console.error("Error creating fix proposal", err);
      setProposalError(err?.message ?? "Failed to create proposal");
    } finally {
      setCreatingProposal(false);
    }
  };

  const handleCreateCleanupProposal = async () => {
    if (!document || !id) return;

    try {
      setCreatingProposal(true);
      setProposalError(null);

      const auditItem = canonicalById[document.id] || (document.key ? canonicalByKey[document.key.toLowerCase()] : null);
      const reasons = auditItem?.reasons || ["Formatting issues detected"];

      const proposalTitle = `Cleanup: ${document.title || document.key}`;
      const proposalContent = `## Explanation

This proposal addresses formatting issues in the canonical document:
${reasons.map((r: string) => `- ${r}`).join("\n")}

## Action

\`\`\`json
{
  "actions": [
    {
      "type": "CANONICAL_DOCUMENT_UPDATE",
      "id": "${id}",
      "content": ""
    }
  ]
}
\`\`\`

## Content

Please provide cleaned markdown content below.`;

      // Create proposal via API
      const res = await fetch(`${API_BASE}/api/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: proposalTitle,
          content: proposalContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const newProposal = await res.json();
      setCleanupProposalModalOpened(false);
      navigate(`/proposals/${newProposal.id}`);
    } catch (err: any) {
      console.error("Error creating cleanup proposal", err);
      setProposalError(err?.message ?? "Failed to create proposal");
    } finally {
      setCreatingProposal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm" c={palette.text}>
              Loading canonical document…
            </Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  if (error || !document) {
    return (
      <Stack gap="md">
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack gap="xs">
            <Text size="sm" c="red.3">
              {error || "Document not found"}
            </Text>
            <Button
              leftSection={<Icons.ArrowLeft size={16} />}
              onClick={() => navigate("/canonical-documents")}
              size="sm"
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Back to Canonical Documents
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
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
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Button
                leftSection={<Icons.ArrowLeft size={16} />}
                onClick={() => navigate("/canonical-documents")}
                size="sm"
                variant="subtle"
                styles={{
                  root: {
                    color: palette.text,
                  },
                }}
              >
                Back
              </Button>
              {!editing && (
                <Group gap="xs" align="center">
                  <Text fw={700} size="xl" c={palette.text}>
                    {document.title || document.key}
                  </Text>
                  <DocumentHealthIndicator
                    entityType="CANONICAL_DOCUMENT"
                    id={document.id}
                    key={document.key}
                    title={document.title}
                    content={document.content}
                  />
                  {(() => {
                    const auditItem = canonicalById[document.id] || (document.key ? canonicalByKey[document.key.toLowerCase()] : null);
                    return (
                      <ContentQualityBadge
                        severity={auditItem?.severity || null}
                        reasons={auditItem?.reasons || []}
                        compact
                      />
                    );
                  })()}
                </Group>
              )}
            </Group>
            {!editing && (
              <Group gap="xs">
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
                <Button
                  leftSection={<Icons.ContinuumGovernance size={16} />}
                  onClick={handleMarkGoverned}
                  loading={governing}
                  disabled={(() => {
                    const auditItem = canonicalById[document.id] || (document.key ? canonicalByKey[document.key.toLowerCase()] : null);
                    const severity = auditItem?.severity || (document.content && document.content.trim().length > 0 ? "OK" : "FAIL");
                    return document.governed || severity === "FAIL";
                  })()}
                  size="sm"
                  styles={{
                    root: {
                      backgroundColor: document.governed
                        ? palette.surface
                        : palette.accent,
                      color: document.governed
                        ? palette.textSoft
                        : palette.background,
                      cursor: document.governed ? "not-allowed" : "pointer",
                    },
                  }}
                >
                  {document.governed ? "Already governed" : "Mark Governed"}
                </Button>
              </Group>
            )}
          </Group>

          {!editing && (() => {
            const auditItem = canonicalById[document.id] || (document.key ? canonicalByKey[document.key.toLowerCase()] : null);
            const severity = auditItem?.severity || (document.content && document.content.trim().length > 0 ? "OK" : "FAIL");
            
            if (severity === "FAIL") {
              return (
                <Stack gap="md">
                  <Alert
                    color="red"
                    title="Document Health: FAIL"
                    styles={{
                      root: {
                        backgroundColor: palette.surface,
                      },
                    }}
                  >
                    This document is empty or invalid and blocks readiness.
                  </Alert>
                  <Button
                    onClick={handleCreateFixProposal}
                    loading={creatingProposal}
                    size="md"
                    styles={{
                      root: {
                        backgroundColor: palette.accent,
                        color: palette.background,
                      },
                    }}
                  >
                    Create Fix Proposal
                  </Button>
                </Stack>
              );
            }
            
            if (severity === "WARN") {
              return (
                <Stack gap="md">
                  <Text size="sm" c="yellow">
                    Formatting issues detected (tabs, weak markdown)
                  </Text>
                  <Button
                    onClick={handleCreateCleanupProposal}
                    loading={creatingProposal}
                    size="sm"
                    variant="outline"
                    styles={{
                      root: {
                        borderColor: "yellow",
                        color: "yellow",
                      },
                    }}
                  >
                    Propose Cleanup
                  </Button>
                </Stack>
              );
            }
            
            return null;
          })()}

          {!editing && (
            <Group gap="md">
              <Stack gap={4}>
                <Group gap="xs" align="center">
                  <Text size="xs" c={palette.textSoft}>
                    Key
                  </Text>
                  <Button
                    leftSection={<Icons.Copy size={14} />}
                    onClick={handleCopyKey}
                    size="xs"
                    variant="subtle"
                    styles={{
                      root: {
                        color: palette.textSoft,
                        padding: "2px 4px",
                      },
                    }}
                  >
                    {copyKeySuccess ? "Copied!" : "Copy"}
                  </Button>
                </Group>
                <Text size="sm" fw={500} c={palette.text}>
                  {document.key}
                </Text>
              </Stack>

              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Governed
                </Text>
                <Badge
                  color={document.governed ? "yellow" : "blue"}
                  variant="filled"
                  size="sm"
                >
                  {document.governed ? "Governed" : "Standard"}
                </Badge>
              </Stack>

              {document.isCanonical !== undefined && (
                <Stack gap={4}>
                  <Text size="xs" c={palette.textSoft}>
                    Canonical
                  </Text>
                  <Switch
                    checked={document.isCanonical}
                    onChange={(e) =>
                      handleToggleCanonical(e.currentTarget.checked)
                    }
                    disabled={togglingCanonical}
                    label={document.isCanonical ? "Canonical" : "Not Canonical"}
                    styles={{
                      label: {
                        color: palette.text,
                      },
                    }}
                  />
                </Stack>
              )}

              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Updated
                </Text>
                <Text size="sm" c={palette.text}>
                  {formatDate(document.updatedAt)}
                </Text>
              </Stack>
            </Group>
          )}

          {/* Error messages */}
          {governError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {governError}
            </Alert>
          )}

          {canonicalError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {canonicalError}
            </Alert>
          )}

          {alreadyGovernedNotice && (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              This document was already marked as governed.
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Content */}
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
          {!editing && (
            <Group justify="space-between" align="center">
              <Text size="lg" fw={600} c={palette.text}>
                Content
              </Text>
              <Group gap="xs">
                {document.content && (
                  <Button
                    leftSection={<Icons.Copy size={16} />}
                    onClick={handleCopyContent}
                    size="sm"
                    variant="subtle"
                    styles={{
                      root: {
                        color: palette.text,
                      },
                    }}
                  >
                    {copyContentSuccess ? "Copied!" : "Copy content"}
                  </Button>
                )}
                <Button
                  leftSection={<Icons.Code size={16} />}
                  onClick={() => setJsonModalOpened(true)}
                  size="sm"
                  variant="subtle"
                  styles={{
                    root: {
                      color: palette.text,
                    },
                  }}
                >
                  Raw JSON
                </Button>
              </Group>
            </Group>
          )}

          {editing ? (
            <>
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
                title={editTitle}
                content={editContent}
                onTitleChange={setEditTitle}
                onContentChange={setEditContent}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={saving}
                palette={palette}
                showTitle={true}
              />
            </>
          ) : document.content ? (
            <DocumentViewer content={document.content} palette={palette} />
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content available
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Raw JSON Modal */}
      <Modal
        opened={jsonModalOpened}
        onClose={() => setJsonModalOpened(false)}
        title="Raw JSON"
        size="lg"
        styles={{
          content: {
            backgroundColor: palette.surface,
            color: palette.text,
          },
          header: {
            backgroundColor: palette.header,
            color: palette.text,
          },
        }}
      >
        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.background,
            border: `1px solid ${palette.border}`,
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <Text
            component="pre"
            size="sm"
            c={palette.textSoft}
            style={{
              fontFamily: "var(--font-mono)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {JSON.stringify(document, null, 2)}
          </Text>
        </Paper>
      </Modal>
    </Stack>
  );
}
