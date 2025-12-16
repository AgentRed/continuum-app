import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Drawer,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconUpload, IconTrash, IconCopy, IconCheck, IconX, IconChevronDown } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import GlossaryTextWrapper from "../components/GlossaryTextWrapper";
import { validateCanonIntegrity, generateIntegrityReport, type IntegrityCheckResult } from "../utils/canonIntegrityValidator";
import { extractGovernanceFromFrontmatter } from "../utils/yamlFrontmatter";

type Document = {
  id: string;
  title: string;
  type: string;
  source: string;
  updatedAt: string;
  ragReady?: boolean;
  isGovernance?: boolean;
  content?: string;
  metadata?: {
    version: string;
    nodeId: string;
    nodeName: string;
    createdAt: string;
  };
};

type Node = {
  id: string;
  name: string;
  workspaceId: string;
};

type DocumentsPageProps = {
  palette: any;
};

export default function DocumentsPage({ palette }: DocumentsPageProps) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [governingDocument, setGoverningDocument] = useState(false);

  // Canon Integrity Check state
  const [integrityCheckResults, setIntegrityCheckResults] = useState<IntegrityCheckResult | null>(null);
  const [checkingIntegrity, setCheckingIntegrity] = useState(false);
  const [missingDocsExpanded, setMissingDocsExpanded] = useState(true);
  const [wrongGovExpanded, setWrongGovExpanded] = useState(true);
  const [notReadyRagExpanded, setNotReadyRagExpanded] = useState(true);

  // Create Document modal state
  const [createDocumentOpened, setCreateDocumentOpened] = useState(false);
  const [createNodeId, setCreateNodeId] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createIsGovernance, setCreateIsGovernance] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState<string | null>(null);

  // Upload Document modal state
  const [uploadDocumentOpened, setUploadDocumentOpened] = useState(false);
  const [uploadNodeId, setUploadNodeId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsGovernance, setUploadIsGovernance] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);

  // Fetch all nodes on mount
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setNodesLoading(true);
        setNodesError(null);
        const res = await fetch(`${API_BASE}/api/nodes`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Node[];
        setNodes(data);
      } catch (err: any) {
        console.error("Error loading nodes", err);
        setNodesError(err?.message ?? "Failed to load nodes");
      } finally {
        setNodesLoading(false);
      }
    };

    fetchNodes();
  }, [API_BASE]);

  // Fetch documents when node filter changes
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const url = selectedNodeId
        ? `${API_BASE}/api/documents?nodeId=${encodeURIComponent(selectedNodeId)}`
        : `${API_BASE}/api/documents`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as Document[];
      setDocuments(data);
    } catch (err: any) {
      console.error("Error loading documents", err);
      setDocumentsError(err?.message ?? "Failed to load documents");
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedNodeId, API_BASE]);

  const handleRowClick = (document: Document) => {
    setSelectedDocument(document);
    setDrawerOpened(true);
  };

  const handleCreateDocument = async () => {
    if (!createNodeId || !createTitle.trim()) {
      setDocumentCreateError("Node and title are required");
      return;
    }

    try {
      setCreatingDocument(true);
      setDocumentCreateError(null);

      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodeId: createNodeId,
          title: createTitle.trim(),
          content: createContent.trim() || null,
          isGovernance: createIsGovernance,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Success: close modal, clear form, refresh documents
      setCreateDocumentOpened(false);
      setCreateNodeId(null);
      setCreateTitle("");
      setCreateContent("");
      setCreateIsGovernance(false);
      setDocumentCreateError(null);

      // Refresh documents list (preserves current filter)
      await fetchDocuments();
    } catch (err: any) {
      console.error("Error creating document", err);
      setDocumentCreateError(err?.message ?? "Failed to create document");
    } finally {
      setCreatingDocument(false);
    }
  };

  const nodeOptions = [
    { value: "", label: "All nodes" },
    ...nodes.map((node) => ({
      value: node.id,
      label: node.name,
    })),
  ];

  const createNodeOptions = nodes.map((node) => ({
    value: node.id,
    label: node.name,
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const runCanonIntegrityCheck = async () => {
    if (!selectedNodeId) {
      notifications.show({
        title: "Select a Node",
        message: "Please select a node to check canonical documents.",
        color: "red",
      });
      return;
    }

    try {
      setCheckingIntegrity(true);
      
      // Fetch all documents for the selected node
      const res = await fetch(
        `${API_BASE}/api/documents?nodeId=${encodeURIComponent(selectedNodeId)}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const nodeDocuments = (await res.json()) as Document[];

      const result = validateCanonIntegrity(nodeDocuments);
      setIntegrityCheckResults(result);
      
      // Reset collapse states
      setMissingDocsExpanded(result.missingDocs.length > 0);
      setWrongGovExpanded(result.wrongGovernance.length > 0);
      setNotReadyRagExpanded(result.notReadyForRag.length > 0);
    } catch (err: any) {
      console.error("Error running integrity check", err);
      notifications.show({
        title: "Check failed",
        message: err?.message ?? "Failed to run integrity check. Please try again.",
        color: "red",
      });
    } finally {
      setCheckingIntegrity(false);
    }
  };

  const copyIntegrityReport = async () => {
    if (!integrityCheckResults || !selectedNodeId) return;

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const nodeName = selectedNode?.name || selectedNodeId;
    const report = generateIntegrityReport(integrityCheckResults, nodeName);

    try {
      await navigator.clipboard.writeText(report);
      notifications.show({
        title: "Report copied",
        message: "Integrity check report copied to clipboard",
        color: "green",
      });
    } catch (err) {
      console.error("Failed to copy report", err);
      notifications.show({
        title: "Copy failed",
        message: "Failed to copy report to clipboard",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Canon Integrity Check Panel */}
      {selectedNodeId && (
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
              <Text size="md" fw={600} c={palette.text}>
                Canon Integrity Check
              </Text>
              <Group gap="xs">
                <Button
                  onClick={runCanonIntegrityCheck}
                  disabled={checkingIntegrity}
                  loading={checkingIntegrity}
                  size="sm"
                  styles={{
                    root: {
                      backgroundColor: palette.accent,
                      color: palette.background,
                    },
                  }}
                >
                  Run Check
                </Button>
                {integrityCheckResults && (
                  <Button
                    leftSection={<IconCopy size={16} />}
                    onClick={copyIntegrityReport}
                    size="sm"
                    variant="outline"
                    styles={{
                      root: {
                        borderColor: palette.border,
                        color: palette.text,
                      },
                    }}
                  >
                    Copy Report
                  </Button>
                )}
              </Group>
            </Group>

            {integrityCheckResults && (
              <Stack gap="sm">
                <Group gap="xs" align="center">
                  {integrityCheckResults.passed ? (
                    <>
                      <IconCheck size={20} color="green" />
                      <Text size="sm" fw={600} c="green">
                        All checks passed
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconX size={20} color="red" />
                      <Text size="sm" fw={600} c="red">
                        Integrity check failed
                      </Text>
                    </>
                  )}
                </Group>

                {integrityCheckResults.missingDocs.length > 0 && (
                  <Stack gap="xs" style={{ marginTop: "8px" }}>
                    <Group
                      gap="xs"
                      style={{ cursor: "pointer" }}
                      onClick={() => setMissingDocsExpanded(!missingDocsExpanded)}
                    >
                      <IconChevronDown
                        size={16}
                        style={{
                          transform: missingDocsExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s",
                        }}
                        color={palette.textSoft}
                      />
                      <Text size="sm" fw={600} c={palette.text}>
                        Missing Documents ({integrityCheckResults.missingDocs.length}):
                      </Text>
                    </Group>
                    <Collapse in={missingDocsExpanded}>
                      <Stack gap="xs" style={{ paddingLeft: "24px" }}>
                        {integrityCheckResults.missingDocs.map((doc) => (
                          <Text key={doc} size="xs" c={palette.textSoft} style={{ fontFamily: "monospace" }}>
                            • {doc}
                          </Text>
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                )}

                {integrityCheckResults.wrongGovernance.length > 0 && (
                  <Stack gap="xs" style={{ marginTop: "8px" }}>
                    <Group
                      gap="xs"
                      style={{ cursor: "pointer" }}
                      onClick={() => setWrongGovExpanded(!wrongGovExpanded)}
                    >
                      <IconChevronDown
                        size={16}
                        style={{
                          transform: wrongGovExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s",
                        }}
                        color={palette.textSoft}
                      />
                      <Text size="sm" fw={600} c={palette.text}>
                        Wrong Governance Status ({integrityCheckResults.wrongGovernance.length}):
                      </Text>
                    </Group>
                    <Collapse in={wrongGovExpanded}>
                      <Stack gap="xs" style={{ paddingLeft: "24px" }}>
                        {integrityCheckResults.wrongGovernance.map((item, idx) => (
                          <Text key={idx} size="xs" c={palette.textSoft}>
                            • <span style={{ fontFamily: "monospace" }}>{item.filename}</span>: Expected {item.expected}, but is {item.actual}
                          </Text>
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                )}

                {integrityCheckResults.notReadyForRag.length > 0 && (
                  <Stack gap="xs" style={{ marginTop: "8px" }}>
                    <Group
                      gap="xs"
                      style={{ cursor: "pointer" }}
                      onClick={() => setNotReadyRagExpanded(!notReadyRagExpanded)}
                    >
                      <IconChevronDown
                        size={16}
                        style={{
                          transform: notReadyRagExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          transition: "transform 0.2s",
                        }}
                        color={palette.textSoft}
                      />
                      <Text size="sm" fw={600} c={palette.text}>
                        Not Ready for RAG ({integrityCheckResults.notReadyForRag.length}):
                      </Text>
                    </Group>
                    <Collapse in={notReadyRagExpanded}>
                      <Stack gap="xs" style={{ paddingLeft: "24px" }}>
                        {integrityCheckResults.notReadyForRag.map((doc) => (
                          <Text key={doc} size="xs" c={palette.textSoft} style={{ fontFamily: "monospace" }}>
                            • {doc}
                          </Text>
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

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
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="lg" fw={600} c={palette.text}>
                Documents
              </Text>
              <Text size="xs" c={palette.textSoft}>
                View and browse documents across all nodes.
              </Text>
            </Stack>
            <Group gap="xs">
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => {
                  // Check if node is selected in filter
                  if (!selectedNodeId) {
                    notifications.show({
                      title: "Select a Node",
                      message: "Choose a Node to upload into. Documents always live inside a Node.",
                      color: "red",
                    });
                    return;
                  }
                  setUploadDocumentOpened(true);
                }}
                size="sm"
                variant="outline"
                styles={{
                  root: {
                    borderColor: palette.border,
                    color: palette.text,
                    "&:hover": {
                      backgroundColor: palette.header,
                    },
                  },
                }}
              >
                Upload
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateDocumentOpened(true)}
                size="sm"
                styles={{
                  root: {
                    backgroundColor: palette.accent,
                    color: palette.background,
                  },
                }}
              >
                Create Document
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

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
          <Select
            label="Node"
            placeholder="Select a node to filter"
            value={selectedNodeId || ""}
            onChange={(value) => setSelectedNodeId(value || null)}
            data={nodeOptions}
            disabled={nodesLoading}
            styles={{
              input: {
                backgroundColor: palette.background,
                borderColor: palette.border,
                color: palette.text,
              },
              dropdown: {
                backgroundColor: palette.surface,
              },
              option: {
                color: palette.text,
              },
            }}
          />

          {nodesLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading nodes...
              </Text>
            </Group>
          )}

          {nodesError && (
            <Text size="sm" c="red.3">
              {nodesError}
            </Text>
          )}

          {documentsLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading documents...
              </Text>
            </Group>
          )}

          {documentsError && (
            <Text size="sm" c="red.3">
              {documentsError}
            </Text>
          )}

          {!documentsLoading && !documentsError && documents.length === 0 && (
            <Text size="sm" c={palette.textSoft}>
              No documents found.
            </Text>
          )}

          {!documentsLoading && !documentsError && documents.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={{
                table: {
                  backgroundColor: "transparent",
                  tableLayout: "fixed",
                  width: "100%",
                },
                thead: {
                  "& tr th": {
                    borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                  },
                },
                tbody: {
                  "& tr td": {
                    borderRight: `1px solid ${palette.border}`,
                    borderBottom: `1px solid ${palette.border}`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "& tr:hover": {
                    backgroundColor: "rgba(59, 130, 246, 0.1) !important",
                    cursor: "pointer",
                  },
                },
                th: {
                  backgroundColor: palette.header,
                  color: "#ffffff",
                  borderColor: palette.border,
                  fontWeight: 700,
                  overflow: "hidden",
                },
                td: {
                  borderColor: palette.border,
                  color: "#ffffff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "25%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "18%" }}>Node</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Governance</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>RAG</Table.Th>
                  <Table.Th style={{ width: "18%", whiteSpace: "nowrap" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "19%", whiteSpace: "nowrap" }}>Created</Table.Th>
                  <Table.Th style={{ width: "50px" }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr
                    key={doc.id}
                    onClick={() => handleRowClick(doc)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "25%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c="#ffffff">
                        {doc.title}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "18%" }}>
                      <Text size="sm" lineClamp={1} c="#ffffff">
                        {doc.metadata?.nodeName || doc.source}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Badge
                        color={doc.isGovernance ? "yellow" : "gray"}
                        variant="filled"
                        size="sm"
                      >
                        {doc.isGovernance ? "Governed" : "Draft"}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Badge
                        color={doc.ragReady ? "green" : "gray"}
                        variant="filled"
                        size="sm"
                      >
                        {doc.ragReady ? "Ready" : "No"}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: "18%" }}>
                      <Text size="xs" lineClamp={1} c="#ffffff">
                        {formatDate(doc.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "19%" }}>
                      <Text size="xs" lineClamp={1} c="#ffffff">
                        {doc.metadata?.createdAt
                          ? formatDate(doc.metadata.createdAt)
                          : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {!doc.isGovernance && (
                          <Button
                            variant="subtle"
                            size="xs"
                            color="yellow"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                setGoverningDocument(true);
                                const res = await fetch(`${API_BASE}/api/documents/${doc.id}/govern`, {
                                  method: "PATCH",
                                });

                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.error || `HTTP ${res.status}`);
                                }

                                const responseData = await res.json();
                                if (responseData.alreadyGoverned) {
                                  notifications.show({
                                    title: "Already governed",
                                    message: `"${doc.title}" is already governed.`,
                                    color: "blue",
                                  });
                                } else {
                                  notifications.show({
                                    title: "Document governed",
                                    message: `"${doc.title}" has been marked as governed.`,
                                    color: "green",
                                  });
                                }

                                // Refresh documents list
                                await fetchDocuments();
                              } catch (err: any) {
                                console.error("Error marking document as governed", err);
                                notifications.show({
                                  title: "Failed to mark as governed",
                                  message: err?.message ?? "Failed to mark document as governed. Please try again.",
                                  color: "red",
                                });
                              } finally {
                                setGoverningDocument(false);
                              }
                            }}
                            disabled={governingDocument}
                            loading={governingDocument}
                            styles={{
                              root: {
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: palette.header,
                                  color: "yellow",
                                },
                              },
                            }}
                          >
                            Mark Governed
                          </Button>
                        )}
                        {doc.isGovernance && (
                          <Button
                            variant="subtle"
                            size="xs"
                            color="orange"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                setGoverningDocument(true);
                                const res = await fetch(`${API_BASE}/api/documents/${doc.id}/governance`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isGovernance: false }),
                                });

                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
                                }

                                notifications.show({
                                  title: "Document ungoverned",
                                  message: `"${doc.title}" has been ungoverned.`,
                                  color: "green",
                                });

                                // Refresh documents list
                                await fetchDocuments();
                              } catch (err: any) {
                                console.error("Error ungoverning document", err);
                                notifications.show({
                                  title: "Failed to ungovern",
                                  message: err?.message ?? "Failed to ungovern document. Please try again.",
                                  color: "red",
                                });
                              } finally {
                                setGoverningDocument(false);
                              }
                            }}
                            disabled={governingDocument}
                            loading={governingDocument}
                            styles={{
                              root: {
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: palette.header,
                                  color: "orange",
                                },
                              },
                            }}
                          >
                            Ungovern
                          </Button>
                        )}
                        <Button
                          variant="subtle"
                          size="xs"
                          color="red"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${doc.title}"? This action cannot be undone.`)) {
                              try {
                                setDeletingDocumentId(doc.id);
                                const res = await fetch(`${API_BASE}/api/documents/${doc.id}`, {
                                  method: "DELETE",
                                });

                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.error || `HTTP ${res.status}`);
                                }

                                // Refresh documents list
                                await fetchDocuments();

                                // Show success toast
                                notifications.show({
                                  title: "Document deleted",
                                  message: `"${doc.title}" has been deleted.`,
                                  color: "green",
                                });
                              } catch (err: any) {
                                console.error("Error deleting document", err);
                                notifications.show({
                                  title: "Delete failed",
                                  message: err?.message ?? "Failed to delete document. Please try again.",
                                  color: "red",
                                });
                              } finally {
                                setDeletingDocumentId(null);
                              }
                            }
                          }}
                          disabled={deletingDocumentId === doc.id}
                          loading={deletingDocumentId === doc.id}
                          styles={{
                            root: {
                              color: "#ffffff",
                              "&:hover": {
                                backgroundColor: palette.header,
                                color: "red",
                              },
                            },
                          }}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Document Detail Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title={
          selectedDocument ? (
            <Group gap="md" align="center">
              <Text size="lg" fw={600} c={palette.text}>
                {selectedDocument.title}
              </Text>
              <Badge
                color={selectedDocument.isGovernance ? "yellow" : "gray"}
                variant="filled"
                size="sm"
              >
                {selectedDocument.isGovernance ? "Governed" : "Draft"}
              </Badge>
            </Group>
          ) : undefined
        }
        position="right"
        size="xl"
        styles={{
          content: {
            backgroundColor: palette.surface,
            color: palette.text,
          },
          header: {
            backgroundColor: palette.surface,
            borderBottom: `1px solid ${palette.border}`,
          },
          body: {
            backgroundColor: palette.background,
          },
        }}
      >
        {selectedDocument && (
          <Stack gap="md">
            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Document ID
              </Text>
              <Group gap="xs" align="center">
                <Text size="sm" c={palette.textSoft} style={{ fontFamily: "monospace" }}>
                  {selectedDocument.id}
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconCopy size={14} />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedDocument.id);
                      notifications.show({
                        title: "Copied",
                        message: "Document ID copied to clipboard",
                        color: "green",
                      });
                    } catch (err) {
                      console.error("Failed to copy", err);
                    }
                  }}
                  styles={{
                    root: {
                      color: palette.textSoft,
                    },
                  }}
                >
                  Copy
                </Button>
              </Group>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Node
              </Text>
              <Text size="sm" c={palette.text}>
                {selectedDocument.metadata?.nodeName || selectedDocument.source}
              </Text>
              {selectedDocument.metadata?.nodeId && (
                <Text size="xs" c={palette.textSoft} style={{ fontFamily: "monospace" }}>
                  {selectedDocument.metadata.nodeId}
                </Text>
              )}
            </Stack>

            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Text size="sm" fw={600} c={palette.text}>
                  Status
                </Text>
                <Badge
                  color={selectedDocument.isGovernance ? "yellow" : "gray"}
                  variant="filled"
                  size="sm"
                >
                  {selectedDocument.isGovernance ? "Governed" : "Draft"}
                </Badge>
              </Stack>
              {!selectedDocument.isGovernance && (
                <Button
                  onClick={async () => {
                    if (!selectedDocument) return;

                    try {
                      setGoverningDocument(true);
                      const res = await fetch(
                        `${API_BASE}/api/documents/${selectedDocument.id}/govern`,
                        {
                          method: "PATCH",
                        }
                      );

                      const responseData = await res.json();
                      
                      if (!res.ok) {
                        if (responseData.alreadyGoverned) {
                          notifications.show({
                            title: "Already governed",
                            message: "This document is already governed.",
                            color: "blue",
                          });
                          if (responseData.id) {
                            setSelectedDocument(responseData);
                          }
                          await fetchDocuments();
                          return;
                        }
                        throw new Error(responseData.error || `HTTP ${res.status}`);
                      }

                      const updatedDocument = responseData;
                      setSelectedDocument(updatedDocument);
                      setDocuments((prev) =>
                        prev.map((doc) =>
                          doc.id === updatedDocument.id ? updatedDocument : doc
                        )
                      );

                      await fetchDocuments();

                      notifications.show({
                        title: "Document governed",
                        message: `"${updatedDocument.title}" is now governed.`,
                        color: "green",
                      });
                    } catch (err: any) {
                      console.error("Error governing document", err);
                      notifications.show({
                        title: "Failed to govern",
                        message: err?.message ?? "Failed to mark document as governed. Please try again.",
                        color: "red",
                      });
                    } finally {
                      setGoverningDocument(false);
                    }
                  }}
                  disabled={governingDocument}
                  loading={governingDocument}
                  styles={{
                    root: {
                      backgroundColor: palette.accent,
                      color: palette.background,
                    },
                  }}
                >
                  Mark as Governed
                </Button>
              )}
            </Group>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Content
              </Text>
              <Paper
                p="md"
                radius="md"
                style={{
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                  maxHeight: "600px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {selectedDocument.content ? (
                  <TypographyStylesProvider>
                    <div
                      style={{
                        color: palette.textSoft,
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          // Process text nodes in paragraphs
                          p: ({ children, ...props }) => {
                            const processChildren = (nodes: React.ReactNode): React.ReactNode => {
                              return React.Children.map(nodes, (child, index) => {
                                if (typeof child === "string") {
                                  return (
                                    <GlossaryTextWrapper
                                      key={`p-text-${index}`}
                                      text={child}
                                      palette={palette}
                                    />
                                  );
                                }
                                if (React.isValidElement(child)) {
                                  // Don't process code blocks
                                  if (child.type === "code" || child.type === "pre") {
                                    return child;
                                  }
                                  // Recursively process nested children
                                  const childProps = child.props as { children?: React.ReactNode };
                                  if (childProps?.children) {
                                    return React.cloneElement(
                                      child,
                                      { key: child.key || `p-child-${index}` },
                                      processChildren(childProps.children)
                                    );
                                  }
                                }
                                return child;
                              });
                            };
                            return <p {...props}>{processChildren(children)}</p>;
                          },
                          // Process text nodes in list items
                          li: ({ children, ...props }) => {
                            const processChildren = (nodes: React.ReactNode): React.ReactNode => {
                              return React.Children.map(nodes, (child, index) => {
                                if (typeof child === "string") {
                                  return (
                                    <GlossaryTextWrapper
                                      key={`li-text-${index}`}
                                      text={child}
                                      palette={palette}
                                    />
                                  );
                                }
                                if (React.isValidElement(child)) {
                                  if (child.type === "code" || child.type === "pre") {
                                    return child;
                                  }
                                  const childProps = child.props as { children?: React.ReactNode };
                                  if (childProps?.children) {
                                    return React.cloneElement(
                                      child,
                                      { key: child.key || `li-child-${index}` },
                                      processChildren(childProps.children)
                                    );
                                  }
                                }
                                return child;
                              });
                            };
                            return <li {...props}>{processChildren(children)}</li>;
                          },
                          // Style inline code (don't process glossary terms)
                          code: ({ children, ...props }) => (
                            <code
                              {...props}
                              style={{
                                fontFamily: "monospace",
                                backgroundColor: palette.surface,
                                padding: "2px 4px",
                                borderRadius: "3px",
                                fontSize: "0.875em",
                              }}
                            >
                              {children}
                            </code>
                          ),
                          // Style code blocks (don't process glossary terms)
                          pre: ({ children, ...props }) => (
                            <pre
                              {...props}
                              style={{
                                fontFamily: "monospace",
                                backgroundColor: palette.surface,
                                padding: "12px",
                                borderRadius: "4px",
                                overflowX: "auto",
                                fontSize: "0.875em",
                                lineHeight: 1.5,
                              }}
                            >
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {selectedDocument.content}
                      </ReactMarkdown>
                    </div>
                  </TypographyStylesProvider>
                ) : (
                  <Text size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                    No content
                  </Text>
                )}
              </Paper>
            </Stack>
          </Stack>
        )}
      </Drawer>


      {/* Create Document Modal */}
      <Modal
        opened={createDocumentOpened}
        onClose={() => {
          setCreateDocumentOpened(false);
          setCreateNodeId(null);
          setCreateTitle("");
          setCreateContent("");
          setCreateIsGovernance(false);
          setDocumentCreateError(null);
        }}
        title="Create Document"
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
          {documentCreateError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {documentCreateError}
            </Alert>
          )}

          <Select
            label="Node"
            placeholder="Select a node"
            value={createNodeId || ""}
            onChange={(value) => setCreateNodeId(value || null)}
            data={createNodeOptions}
            required
            disabled={creatingDocument || nodesLoading}
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
              dropdown: {
                backgroundColor: palette.surface,
              },
              option: {
                color: palette.text,
              },
            }}
          />

          <TextInput
            label="Title"
            placeholder="Enter document title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            required
            disabled={creatingDocument}
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
            }}
          />

          <Textarea
            label="Content"
            placeholder="Enter document content (optional)"
            value={createContent}
            onChange={(e) => setCreateContent(e.target.value)}
            minRows={8}
            disabled={creatingDocument}
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
                fontFamily: "monospace",
              },
            }}
          />

          <Checkbox
            label="Governed (Canonical)"
            checked={createIsGovernance}
            onChange={(e) => setCreateIsGovernance(e.currentTarget.checked)}
            disabled={creatingDocument}
            styles={{
              label: {
                color: palette.text,
              },
            }}
          />

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateDocumentOpened(false);
                setCreateNodeId(null);
                setCreateTitle("");
                setCreateContent("");
                setCreateIsGovernance(false);
                setDocumentCreateError(null);
              }}
              disabled={creatingDocument}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDocument}
              disabled={!createNodeId || !createTitle.trim() || creatingDocument}
              loading={creatingDocument}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        opened={uploadDocumentOpened}
        onClose={() => {
          setUploadDocumentOpened(false);
          setUploadNodeId(null);
          setUploadFile(null);
          setUploadIsGovernance(false);
          setDocumentUploadError(null);
        }}
        title="Upload Document"
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
          {documentUploadError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {documentUploadError}
            </Alert>
          )}

          <Select
            label="Node"
            placeholder="Select a node"
            value={uploadNodeId || ""}
            onChange={(value) => setUploadNodeId(value || null)}
            data={createNodeOptions}
            required
            disabled={uploadingDocument || nodesLoading}
            error={
              !uploadNodeId && documentUploadError
                ? "Select a node to upload into. This document will be stored under that node."
                : undefined
            }
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
              dropdown: {
                backgroundColor: palette.surface,
              },
              option: {
                color: palette.text,
              },
            }}
          />

          <div>
            <Text size="sm" fw={500} mb="xs" c={palette.text}>
              File
            </Text>
            <input
              type="file"
              accept=".md"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                setUploadFile(file || null);
                setDocumentUploadError(null);
                
                // Parse YAML frontmatter if file is selected
                if (file) {
                  try {
                    const text = await file.text();
                    const hasGovernance = extractGovernanceFromFrontmatter(text);
                    setUploadIsGovernance(hasGovernance);
                  } catch (err) {
                    console.error("Error reading file for frontmatter", err);
                    setUploadIsGovernance(false);
                  }
                } else {
                  setUploadIsGovernance(false);
                }
              }}
              disabled={uploadingDocument}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
                borderRadius: "4px",
                color: palette.text,
              }}
            />
            {!uploadFile && documentUploadError && (
              <Text size="xs" c="red" mt="xs">
                Select a .md file to upload.
              </Text>
            )}
          </div>

          <Checkbox
            label="Governed (canonical)"
            checked={uploadIsGovernance}
            onChange={(e) => setUploadIsGovernance(e.currentTarget.checked)}
            disabled={uploadingDocument}
            styles={{
              label: {
                color: palette.text,
              },
            }}
          />

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setUploadDocumentOpened(false);
                setUploadNodeId(null);
                setUploadFile(null);
                setUploadIsGovernance(false);
                setDocumentUploadError(null);
              }}
              disabled={uploadingDocument}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!uploadNodeId) {
                  notifications.show({
                    title: "Select a Node",
                    message: "Choose a Node to upload into. Documents always live inside a Node.",
                    color: "red",
                  });
                  setDocumentUploadError(
                    "Select a node to upload into. This document will be stored under that node."
                  );
                  return;
                }
                if (!uploadFile) {
                  setDocumentUploadError("Select a .md file to upload.");
                  return;
                }

                try {
                  setUploadingDocument(true);
                  setDocumentUploadError(null);

                  // Parse frontmatter from file to get governance status
                  // Frontmatter takes precedence: if it has `governance: governed`, use that
                  let finalIsGovernance = uploadIsGovernance;
                  try {
                    const fileText = await uploadFile.text();
                    const frontmatterHasGovernance = extractGovernanceFromFrontmatter(fileText);
                    if (frontmatterHasGovernance) {
                      finalIsGovernance = true;
                    }
                  } catch (err) {
                    console.warn("Could not parse frontmatter, using checkbox value", err);
                  }

                  const formData = new FormData();
                  // Recreate File object to ensure it's usable after text() call
                  const fileBlob = await uploadFile.arrayBuffer();
                  const recreatedFile = new File([fileBlob], uploadFile.name, { type: uploadFile.type });
                  formData.append("file", recreatedFile);
                  formData.append("nodeId", uploadNodeId);
                  formData.append("isGovernance", finalIsGovernance.toString());

                  const res = await fetch(`${API_BASE}/api/documents/upload`, {
                    method: "POST",
                    body: formData,
                  });

                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    const errorMessage = errorData.error || `HTTP ${res.status}: Failed to upload document`;
                    notifications.show({
                      title: "Upload failed",
                      message: errorMessage,
                      color: "red",
                    });
                    throw new Error(errorMessage);
                  }

                  const createdDocument = await res.json();

                  // Success: close modal, clear form, refresh documents
                  setUploadDocumentOpened(false);
                  setUploadNodeId(null);
                  setUploadFile(null);
                  setUploadIsGovernance(false);
                  setDocumentUploadError(null);

                  // Refresh documents list
                  await fetchDocuments();

                  // Show success notification
                  const selectedNode = nodes.find((n) => n.id === uploadNodeId);
                  const nodeName =
                    selectedNode?.name ||
                    createdDocument.metadata?.nodeName ||
                    "the selected Node";
                  notifications.show({
                    title: "Upload successful",
                    message: `Document "${createdDocument.title}" has been uploaded to ${nodeName}.`,
                    color: "green",
                  });
                } catch (err: any) {
                  console.error("Error uploading document", err);
                  setDocumentUploadError(
                    err?.message ?? "Failed to upload document"
                  );
                } finally {
                  setUploadingDocument(false);
                }
              }}
              disabled={!uploadNodeId || !uploadFile || uploadingDocument}
              loading={uploadingDocument}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}








