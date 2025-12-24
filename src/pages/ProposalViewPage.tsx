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
  Text,
  Textarea,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import DocumentEditor from "../components/DocumentEditor";

type Proposal = {
  id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "APPLIED";
  content?: string;
  updatedAt: string;
};

type ApplyAction = {
  type: "CANONICAL_DOCUMENT_UPDATE";
  id: string;
  content: string;
};

type ApplyPreview = {
  actions: ApplyAction[];
};

type ProposalViewPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ProposalViewPage({
  palette,
  API_BASE,
}: ProposalViewPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [patchAvailable, setPatchAvailable] = useState<boolean | null>(null);
  const [applyPreview, setApplyPreview] = useState<ApplyPreview | null>(null);
  const [applyPreviewError, setApplyPreviewError] = useState<string | null>(null);

  // Reset state when id changes
  useEffect(() => {
    setProposal(null);
    setLoading(true);
    setError(null);
    setEditing(false);
    setEditTitle("");
    setEditContent("");
    setSaving(false);
    setSaveError(null);
    setApproving(false);
    setRejecting(false);
    setApplying(false);
    setActionError(null);
    setSuccessMessage(null);
    setRejectModalOpened(false);
    setRejectReason("");
    setApplyPreview(null);
    setApplyPreviewError(null);
  }, [id]);

  // Check if PATCH endpoint exists
  useEffect(() => {
    const checkPatchEndpoint = async () => {
      if (!id) return;
      
      try {
        // Try a PATCH request to see if endpoint exists
        const res = await fetch(`${API_BASE}/api/proposals/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        
        // If we get 400/422, endpoint exists but validation failed (expected)
        // If we get 404, endpoint doesn't exist
        // If we get 405, method not allowed
        if (res.status === 404 || res.status === 405) {
          setPatchAvailable(false);
        } else {
          setPatchAvailable(true);
        }
      } catch (err) {
        // On error, assume it exists (optimistic)
        setPatchAvailable(true);
      }
    };

    if (id) {
      checkPatchEndpoint();
    }
  }, [id, API_BASE]);

  // Parse apply preview from content
  useEffect(() => {
    if (!proposal?.content || proposal.status !== "APPROVED") {
      setApplyPreview(null);
      setApplyPreviewError(null);
      return;
    }

    try {
      // Find first fenced ```json code block
      const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
      const match = proposal.content.match(jsonBlockRegex);
      
      if (!match || !match[1]) {
        setApplyPreviewError("No JSON code block found in proposal content");
        setApplyPreview(null);
        return;
      }

      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent) as ApplyPreview;
      
      if (!parsed.actions || !Array.isArray(parsed.actions)) {
        setApplyPreviewError("Invalid JSON structure: missing 'actions' array");
        setApplyPreview(null);
        return;
      }

      // Find CANONICAL_DOCUMENT_UPDATE action
      const canonicalAction = parsed.actions.find(
        (a) => a.type === "CANONICAL_DOCUMENT_UPDATE"
      );

      if (!canonicalAction) {
        setApplyPreviewError("No CANONICAL_DOCUMENT_UPDATE action found");
        setApplyPreview(null);
        return;
      }

      if (!canonicalAction.id) {
        setApplyPreviewError("CANONICAL_DOCUMENT_UPDATE action missing 'id'");
        setApplyPreview(null);
        return;
      }

      setApplyPreview({ actions: [canonicalAction] });
      setApplyPreviewError(null);
    } catch (err: any) {
      setApplyPreviewError(`Failed to parse JSON: ${err.message}`);
      setApplyPreview(null);
    }
  }, [proposal?.content, proposal?.status]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) {
        setError("No proposal ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/proposals/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Proposal not found");
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Proposal;
        setProposal(data);
        setEditTitle(data.title || "");
        setEditContent(data.content || "");
      } catch (err: any) {
        console.error("Error loading proposal", err);
        setError(err?.message ?? "Failed to load proposal");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, API_BASE]);

  const refreshProposal = async () => {
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/api/proposals/${id}`);
      if (res.ok) {
        const data = (await res.json()) as Proposal;
        setProposal(data);
        setEditTitle(data.title || "");
        setEditContent(data.content || "");
      }
    } catch (err) {
      console.error("Error refreshing proposal", err);
    }
  };

  const handleEdit = () => {
    if (proposal) {
      setEditTitle(proposal.title || "");
      setEditContent(proposal.content || "");
      setEditing(true);
      setSaveError(null);
    }
  };

  const handleCancel = () => {
    if (proposal) {
      setEditTitle(proposal.title || "");
      setEditContent(proposal.content || "");
      setEditing(false);
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    if (!id || !proposal || !patchAvailable) return;

    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(`${API_BASE}/api/proposals/${id}`, {
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

      await refreshProposal();
      setEditing(false);
      setSuccessMessage("Proposal updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error saving proposal", err);
      setSaveError(err?.message ?? "Failed to save proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;

    try {
      setApproving(true);
      setActionError(null);

      const res = await fetch(`${API_BASE}/api/proposals/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approvedBy: "user-1" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      await refreshProposal();
      setSuccessMessage("Proposal approved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error approving proposal", err);
      setActionError(err?.message ?? "Failed to approve proposal");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    try {
      setRejecting(true);
      setActionError(null);

      const res = await fetch(`${API_BASE}/api/proposals/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectedBy: "user-1",
          reason: rejectReason.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setRejectModalOpened(false);
      setRejectReason("");
      await refreshProposal();
      setSuccessMessage("Proposal rejected successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error rejecting proposal", err);
      setActionError(err?.message ?? "Failed to reject proposal");
    } finally {
      setRejecting(false);
    }
  };

  const handleApply = async () => {
    if (!id) return;

    try {
      setApplying(true);
      setActionError(null);

      const res = await fetch(`${API_BASE}/api/proposals/${id}/apply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appliedBy: "user-1" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      await refreshProposal();
      setSuccessMessage("Proposal applied successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error applying proposal", err);
      setActionError(err?.message ?? "Failed to apply proposal");
    } finally {
      setApplying(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "gray";
      case "SUBMITTED":
        return "blue";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      case "APPLIED":
        return "teal";
      default:
        return "gray";
    }
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
              Loading proposal…
            </Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  if (error || !proposal) {
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
              {error || "Proposal not found"}
            </Text>
            <Button
              leftSection={<Icons.ArrowLeft size={16} />}
              onClick={() => navigate("/proposals")}
              size="sm"
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Back to Proposals
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  const showStatusActions = proposal.status === "SUBMITTED" || proposal.status === "APPROVED";
  const canEdit = patchAvailable === true;

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
                onClick={() => navigate("/proposals")}
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
                <Text fw={700} size="xl" c={palette.text}>
                  {proposal.title}
                </Text>
              )}
            </Group>
            {!editing && (
              <Group gap="xs">
                {canEdit && (
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
                )}
                {proposal.status === "SUBMITTED" && (
                  <>
                    <Button
                      leftSection={<Icons.Approve size={16} />}
                      onClick={handleApprove}
                      loading={approving}
                      disabled={approving || rejecting}
                      size="sm"
                      styles={{
                        root: {
                          backgroundColor: "green",
                          color: "#ffffff",
                        },
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      leftSection={<Icons.Reject size={16} />}
                      onClick={() => setRejectModalOpened(true)}
                      loading={rejecting}
                      disabled={approving || rejecting}
                      size="sm"
                      styles={{
                        root: {
                          backgroundColor: "red",
                          color: "#ffffff",
                        },
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {proposal.status === "APPROVED" && (
                  <Button
                    leftSection={<Icons.Apply size={16} />}
                    onClick={handleApply}
                    loading={applying}
                    disabled={applying || !applyPreview}
                    size="sm"
                    styles={{
                      root: {
                        backgroundColor: palette.accent,
                        color: palette.background,
                      },
                    }}
                  >
                    Apply
                  </Button>
                )}
              </Group>
            )}
          </Group>

          {!editing && (
            <Group gap="md">
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Status
                </Text>
                <Badge
                  color={getStatusColor(proposal.status)}
                  variant="filled"
                  size="sm"
                >
                  {proposal.status}
                </Badge>
              </Stack>

              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Updated
                </Text>
                <Text size="sm" c={palette.text}>
                  {formatDate(proposal.updatedAt)}
                </Text>
              </Stack>
            </Group>
          )}

          {/* Success message */}
          {successMessage && (
            <Text size="sm" c="green.3">
              {successMessage}
            </Text>
          )}

          {/* Error messages */}
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

          {actionError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {actionError}
            </Alert>
          )}

          {/* Edit helper text */}
          {!canEdit && patchAvailable === false && (
            <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              Editing requires core PATCH /api/proposals/:id
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Apply Preview (only when APPROVED) */}
      {proposal.status === "APPROVED" && (
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
            <Text size="lg" fw={600} c={palette.text}>
              Apply Preview
            </Text>
            {applyPreviewError ? (
              <Alert
                color="yellow"
                title="Warning"
                styles={{
                  root: {
                    backgroundColor: palette.surface,
                  },
                }}
              >
                {applyPreviewError}
              </Alert>
            ) : applyPreview ? (
              <Stack gap="xs">
                <Group gap="md">
                  <Stack gap={4}>
                    <Text size="xs" c={palette.textSoft}>
                      Canonical Document ID
                    </Text>
                    <Text size="sm" c={palette.text} fw={500}>
                      {applyPreview.actions[0].id}
                    </Text>
                  </Stack>
                </Group>
                <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                  This will overwrite the canonical document content with the provided markdown.
                </Text>
              </Stack>
            ) : (
              <Text size="sm" c={palette.textSoft}>
                Parsing apply preview...
              </Text>
            )}
          </Stack>
        </Paper>
      )}

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
            <Text size="lg" fw={600} c={palette.text}>
              Content
            </Text>
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
          ) : proposal.content ? (
            <DocumentViewer content={proposal.content} palette={palette} />
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content available
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpened}
        onClose={() => {
          setRejectModalOpened(false);
          setRejectReason("");
        }}
        title="Reject Proposal"
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
        <Stack gap="md">
          <Textarea
            label="Reason (optional)"
            placeholder="Enter rejection reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            autosize
            minRows={4}
            disabled={rejecting}
            styles={{
              label: {
                color: palette.text,
              },
              input: {
                backgroundColor: palette.background,
                borderColor: palette.border,
                color: palette.text,
              },
            }}
          />
          <Group justify="flex-end" gap="xs">
            <Button
              onClick={() => {
                setRejectModalOpened(false);
                setRejectReason("");
              }}
              variant="subtle"
              disabled={rejecting}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              loading={rejecting}
              disabled={rejecting}
              styles={{
                root: {
                  backgroundColor: "red",
                  color: "#ffffff",
                },
              }}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
