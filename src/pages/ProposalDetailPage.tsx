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
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import ContentQualityBadge from "../components/ContentQualityBadge";
import DocumentHealthIndicator from "../components/DocumentHealthIndicator";
import { useContentQuality } from "../context/ContentQualityContext";
import {
  getProposal,
  updateProposal,
  submitProposal,
  approveProposal,
  rejectProposal,
  applyProposal,
  type Proposal,
} from "../lib/proposalsApi";

type ProposalDetailPageProps = {
  palette: any;
  API_BASE: string;
};

type ApplyAction = {
  type: string;
  id: string;
  content: string;
};

type ApplyPreview = {
  actions: ApplyAction[];
};

export default function ProposalDetailPage({
  palette,
  API_BASE,
}: ProposalDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canonicalById, refresh: refreshQuality, loading: qualityLoading } = useContentQuality();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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
    setSubmitting(false);
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

  // Fetch proposal
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
        const data = await getProposal(API_BASE, id);
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

  // Parse apply preview from content
  useEffect(() => {
    if (!proposal || !proposal.content || proposal.status !== "APPROVED") {
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

      if (!parsed.actions || !Array.isArray(parsed.actions) || parsed.actions.length === 0) {
        setApplyPreviewError("Invalid JSON structure: missing or empty 'actions' array");
        setApplyPreview(null);
        return;
      }

      const action = parsed.actions[0];
      if (action.type !== "CANONICAL_DOCUMENT_UPDATE") {
        setApplyPreviewError(`Unsupported action type: ${action.type}`);
        setApplyPreview(null);
        return;
      }

      if (!action.id || !action.content) {
        setApplyPreviewError("CANONICAL_DOCUMENT_UPDATE action missing 'id' or 'content'");
        setApplyPreview(null);
        return;
      }

      setApplyPreview({ actions: [action] });
      setApplyPreviewError(null);
    } catch (err: any) {
      setApplyPreviewError(`Failed to parse JSON: ${err.message}`);
      setApplyPreview(null);
    }
  }, [proposal?.content, proposal?.status]);

  const refreshProposal = async () => {
    if (!id) return;
    try {
      const data = await getProposal(API_BASE, id);
      setProposal(data);
      setEditTitle(data.title || "");
      setEditContent(data.content || "");
    } catch (err) {
      console.error("Error refreshing proposal", err);
    }
  };

  const handleEdit = () => {
    if (proposal) {
      setEditTitle(proposal.title || "");
      setEditContent(proposal.content || "");
      setEditing(true);
      setActionError(null);
    }
  };

  const handleCancel = () => {
    if (proposal) {
      setEditTitle(proposal.title || "");
      setEditContent(proposal.content || "");
      setEditing(false);
      setActionError(null);
    }
  };

  const handleSave = async () => {
    if (!id || !proposal) return;

    try {
      setSaving(true);
      setActionError(null);

      await updateProposal(API_BASE, id, {
        title: editTitle.trim() || undefined,
        content: editContent.trim() || undefined,
        updatedBy: "user-1",
      });

      await refreshProposal();
      setEditing(false);
      setSuccessMessage("Proposal updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error saving proposal", err);
      setActionError(err?.message ?? "Failed to save proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    try {
      setSubmitting(true);
      setActionError(null);

      await submitProposal(API_BASE, id, { submittedBy: "user-1" });
      await refreshProposal();
      setSuccessMessage("Proposal submitted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error submitting proposal", err);
      setActionError(err?.message ?? "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;

    try {
      setApproving(true);
      setActionError(null);

      await approveProposal(API_BASE, id, { approvedBy: "user-1" });
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

      await rejectProposal(API_BASE, id, {
        reason: rejectReason.trim() || undefined,
        rejectedBy: "user-1",
      });

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

      await applyProposal(API_BASE, id, { appliedBy: "user-1" });
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

  const canEdit = proposal.status === "DRAFT" || proposal.status === "SUBMITTED";

  return (
    <Stack gap="md">
      {/* Header Card */}
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
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
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
                  <Stack gap={4}>
                    <Text size="xs" c={palette.textSoft}>
                      ID
                    </Text>
                    <Text size="xs" c={palette.textSoft} style={{ fontFamily: "var(--font-mono)" }}>
                      {proposal.id}
                    </Text>
                  </Stack>
                </Group>
              )}
            </Stack>
            {!editing && canEdit && (
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
          </Group>

          {/* Success message */}
          {successMessage && (
            <Text size="sm" c="green.3">
              {successMessage}
            </Text>
          )}

          {/* Error messages */}
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
        </Stack>
      </Paper>

      {/* Content Card */}
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
            <Stack gap="md">
              <TextInput
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.currentTarget.value)}
                disabled={saving}
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
              <Textarea
                label="Content (Markdown)"
                value={editContent}
                onChange={(e) => setEditContent(e.currentTarget.value)}
                autosize
                minRows={18}
                disabled={saving}
                style={{
                  width: "100%",
                  minHeight: "420px",
                }}
                styles={{
                  label: {
                    color: palette.text,
                  },
                  input: {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.text,
                    fontFamily: '"Source Code Pro", monospace',
                    fontSize: "0.875rem",
                  },
                  wrapper: {
                    width: "100%",
                  },
                }}
              />
              <Group justify="flex-end" gap="xs">
                <Button
                  onClick={handleCancel}
                  variant="subtle"
                  disabled={saving}
                  styles={{
                    root: {
                      color: palette.text,
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={saving}
                  styles={{
                    root: {
                      backgroundColor: palette.accent,
                      color: palette.background,
                    },
                  }}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          ) : proposal.content ? (
            <DocumentViewer content={proposal.content} palette={palette} />
          ) : (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No content available
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Workflow Actions Card */}
      {(proposal.status === "DRAFT" ||
        proposal.status === "SUBMITTED" ||
        proposal.status === "APPROVED") && (
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
              Workflow Actions
            </Text>
            {proposal.status === "DRAFT" && (
              <Button
                leftSection={<Icons.Send size={16} />}
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting}
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background,
                  },
                }}
              >
                Submit
              </Button>
            )}
            {proposal.status === "SUBMITTED" && (
              <Group gap="xs">
                <Button
                  leftSection={<Icons.Approve size={16} />}
                  onClick={handleApprove}
                  loading={approving}
                  disabled={approving || rejecting}
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
            )}
            {proposal.status === "APPROVED" && (() => {
              const canonicalDocId = applyPreview?.actions[0]?.id;
              const auditItem = canonicalDocId 
                ? canonicalById[canonicalDocId]
                : null;
              const isFail = auditItem?.severity === "FAIL";
              
              return (
                <Button
                  leftSection={<Icons.Apply size={16} />}
                  onClick={handleApply}
                  loading={applying}
                  disabled={applying || !applyPreview || isFail}
                  styles={{
                    root: {
                      backgroundColor: palette.accent,
                      color: palette.background,
                    },
                  }}
                >
                  Apply
                </Button>
              );
            })()}
          </Stack>
        </Paper>
      )}

      {/* Status message for REJECTED or APPLIED */}
      {(proposal.status === "REJECTED" || proposal.status === "APPLIED") && (
        <Paper
          shadow="sm"
          p="md"
          radius="md"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
            {proposal.status === "REJECTED"
              ? "This proposal has been rejected and no further actions are available."
              : "This proposal has been applied and no further actions are available."}
          </Text>
        </Paper>
      )}

      {/* Apply Preview Card (only when APPROVED) */}
      {proposal.status === "APPROVED" && (() => {
        const canonicalDocId = applyPreview?.actions[0]?.id;
        const auditItem = canonicalDocId 
          ? canonicalById[canonicalDocId]
          : null;
        const isFail = auditItem?.severity === "FAIL";
        const isWarn = auditItem?.severity === "WARN";
        
        return (
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
                <Text size="lg" fw={600} c={palette.text}>
                  Apply Preview
                </Text>
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
              </Group>
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
                      <Group gap="xs" align="center">
                        <Text size="sm" c={palette.text} fw={500} style={{ fontFamily: "var(--font-mono)" }}>
                          {applyPreview.actions[0].id}
                        </Text>
                        {canonicalDocId && (
                          <>
                            <DocumentHealthIndicator
                              entityType="CANONICAL_DOCUMENT"
                              id={canonicalDocId}
                              compact
                            />
                            <ContentQualityBadge
                              severity={auditItem?.severity || null}
                              reasons={auditItem?.reasons || []}
                              compact
                            />
                          </>
                        )}
                      </Group>
                      {canonicalDocId && auditItem && auditItem.severity === "FAIL" && (
                        <Alert
                          color="red"
                          title="Warning"
                          styles={{
                            root: {
                              backgroundColor: palette.surface,
                            },
                          }}
                        >
                          Target canonical document has FAIL status and blocks readiness.
                        </Alert>
                      )}
                    </Stack>
                    <Stack gap={4}>
                      <Text size="xs" c={palette.textSoft}>
                        Action Type
                      </Text>
                      <Text size="sm" c={palette.text} fw={500}>
                        {applyPreview.actions[0].type}
                      </Text>
                    </Stack>
                  </Group>
                  {isFail && (
                    <Alert
                      color="red"
                      title="Content Audit: FAIL"
                      styles={{
                        root: {
                          backgroundColor: palette.surface,
                        },
                      }}
                    >
                      Cannot apply: Target canonical document has FAIL status. {auditItem?.reasons.length > 0 ? auditItem.reasons.join(", ") : "Content quality issues detected"}
                    </Alert>
                  )}
                  {isWarn && !isFail && (
                    <Alert
                      color="yellow"
                      title="Content Audit: WARN"
                      styles={{
                        root: {
                          backgroundColor: palette.surface,
                        },
                      }}
                    >
                      Warning: Target canonical document has WARN status. {auditItem?.reasons.length > 0 ? auditItem.reasons.join(", ") : "Content quality issues detected"}
                    </Alert>
                  )}
                  <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                    Apply will overwrite the canonical document content with the provided markdown.
                  </Text>
                </Stack>
              ) : (
                <Text size="sm" c={palette.textSoft}>
                  Parsing apply preview...
                </Text>
              )}
            </Stack>
          </Paper>
        );
      })()}

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


