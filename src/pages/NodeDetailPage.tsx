import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  TypographyStylesProvider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconPlus, IconUpload, IconTrash, IconCopy, IconChevronDown, IconChevronUp, IconAlertTriangle } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import GlossaryTextWrapper from "../components/GlossaryTextWrapper";
import { extractGovernanceFromFrontmatter } from "../utils/yamlFrontmatter";


type Node = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
    readiness?: "READY" | "NOT_READY";
    aiMode?: "GUARDED" | "ADVISORY" | "OPERATIONAL";
    reasons?: string[] | null;
    warnings?: string[];
    tenant?: {
      id: string;
      name: string;
    };
  };
  _count: {
    programs: number;
    modules: number;
    documents: number;
    integrations: number;
  };
};

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

type NodeDetailPageProps = {
  palette: any;
  API_BASE: string;
};

/**
 * Component to display expandable readiness details (reasons and warnings)
 */
function ReadinessDetails({
  readiness,
  reasons,
  warnings,
  palette,
}: {
  readiness?: "READY" | "NOT_READY";
  reasons: string[];
  warnings: string[];
  palette: any;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hasContent = reasons.length > 0 || warnings.length > 0;

  if (!hasContent) return null;

  return (
    <Stack gap="xs" style={{ marginTop: "4px" }}>
      <Group
        gap="xs"
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <IconChevronUp size={14} color={palette.textSoft} />
        ) : (
          <IconChevronDown size={14} color={palette.textSoft} />
        )}
        <Text
          size="xs"
          c={palette.textSoft}
          style={{ fontStyle: "italic", textDecoration: "underline" }}
        >
          Why {readiness === "NOT_READY" ? "NOT READY" : "warnings"}
        </Text>
      </Group>
      <Collapse in={expanded}>
        <Stack gap="xs" style={{ paddingLeft: "18px" }}>
          {reasons.length > 0 && (
            <Stack gap={4}>
              <Text size="xs" fw={600} c={palette.text}>
                Blockers:
              </Text>
              {reasons.map((reason, idx) => (
                <Text key={idx} size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                  • {reason}
                </Text>
              ))}
            </Stack>
          )}
          {warnings.length > 0 && (
            <Stack gap={4}>
              <Group gap={4}>
                <IconAlertTriangle size={14} color={palette.accent} />
                <Text size="xs" fw={600} c={palette.accent}>
                  Warnings:
                </Text>
              </Group>
              {warnings.map((warning, idx) => (
                <Text key={idx} size="xs" c={palette.textSoft} style={{ fontStyle: "italic" }}>
                  • {warning}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default function NodeDetailPage({
  palette,
  API_BASE,
}: NodeDetailPageProps) {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Canon Library state
  const [canonLinks, setCanonLinks] = useState<any[]>([]);
  const [canonLinksLoading, setCanonLinksLoading] = useState(false);
  const [canonLinksError, setCanonLinksError] = useState<string | null>(null);
  const [canonDocs, setCanonDocs] = useState<any[]>([]);
  const [linkModalOpened, setLinkModalOpened] = useState(false);
  const [selectedCanonDocId, setSelectedCanonDocId] = useState<string>("");
  const [linking, setLinking] = useState(false);
  
  // Create Document modal state
  const [createDocumentOpened, setCreateDocumentOpened] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createIsGovernance, setCreateIsGovernance] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState<string | null>(null);

  // Upload Document modal state
  const [uploadDocumentOpened, setUploadDocumentOpened] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsGovernance, setUploadIsGovernance] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [governingDocument, setGoverningDocument] = useState(false);

  // Node Health status
  const [healthStatus, setHealthStatus] = useState<{
    status: "PASS" | "WARN" | "FAIL";
    message: string;
  } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);


  useEffect(() => {
    const fetchNode = async () => {
      if (!nodeId) {
        setError("No node ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch by ID first, if that fails, fetch all and filter
        let res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
        
        if (!res.ok && res.status === 404) {
          // If endpoint doesn't exist, fetch all nodes and find the one we need
          res = await fetch(`${API_BASE}/api/nodes`);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const allNodes = (await res.json()) as Node[];
          const foundNode = allNodes.find((n) => n.id === nodeId);
          if (!foundNode) {
            throw new Error("Node not found");
          }
          setNode(foundNode);
        } else if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        } else {
          const data = (await res.json()) as Node;
          setNode(data);
        }
      } catch (err: any) {
        console.error("Error loading node", err);
        setError(err?.message ?? "Failed to load node");
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [nodeId, API_BASE]);

  // Check node health
  useEffect(() => {
    const checkHealth = async () => {
      if (!node || !API_BASE) return;

      try {
        setCheckingHealth(true);

        // Check API health - try /health first, then fallback to /
        let healthOk = false;
        let healthError = "";

        // Create timeout controller
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 5000);

        try {
          const healthRes = await fetch(`${API_BASE}/health`, {
            method: "GET",
            signal: healthController.signal,
          });
          clearTimeout(healthTimeout);
          healthOk = healthRes.ok;
          if (!healthOk) {
            healthError = `Health endpoint returned ${healthRes.status}`;
          }
        } catch (err: any) {
          clearTimeout(healthTimeout);
          // If /health doesn't exist, try root endpoint
          const rootController = new AbortController();
          const rootTimeout = setTimeout(() => rootController.abort(), 5000);
          try {
            const rootRes = await fetch(`${API_BASE}/`, {
              method: "GET",
              signal: rootController.signal,
            });
            clearTimeout(rootTimeout);
            healthOk = rootRes.ok;
            if (!healthOk) {
              healthError = `Root endpoint returned ${rootRes.status}`;
            }
          } catch (rootErr: any) {
            clearTimeout(rootTimeout);
            healthOk = false;
            healthError = rootErr?.message || "API unreachable";
          }
        }

        // Check node fetch
        const nodeController = new AbortController();
        const nodeTimeout = setTimeout(() => nodeController.abort(), 5000);
        const nodeRes = await fetch(`${API_BASE}/api/nodes/${nodeId}`, {
          signal: nodeController.signal,
        });
        clearTimeout(nodeTimeout);
        const nodeOk = nodeRes.ok;
        const nodeData = nodeOk ? await nodeRes.json() : null;
        const nodeValid = nodeOk && nodeData && Object.keys(nodeData).length > 0;

        if (healthOk && nodeValid) {
          setHealthStatus({
            status: "PASS",
            message: "API reachable and node valid",
          });
        } else if (!healthOk) {
          setHealthStatus({
            status: "FAIL",
            message: `API unreachable: ${healthError}`,
          });
        } else {
          setHealthStatus({
            status: "WARN",
            message: "Node fetch failed or invalid",
          });
        }
      } catch (err: any) {
        setHealthStatus({
          status: "FAIL",
          message: err?.message || "Health check failed",
        });
      } finally {
        setCheckingHealth(false);
      }
    };

    if (node && nodeId) {
      checkHealth();
    }
  }, [node, nodeId, API_BASE]);


  // Fetch canonical document links for the current node
  const fetchCanonLinks = async () => {
    if (!nodeId) return;
    
    try {
      setCanonLinksLoading(true);
      setCanonLinksError(null);
      const res = await fetch(`${API_BASE}/api/nodes/${nodeId}/document-links`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setCanonLinks(data);
    } catch (err: any) {
      console.error("Error fetching canonical links", err);
      setCanonLinksError(err?.message || "Failed to fetch canonical links");
    } finally {
      setCanonLinksLoading(false);
    }
  };

  // Fetch all canonical documents (for link picker)
  const fetchCanonDocs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/canonical-documents`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setCanonDocs(data);
    } catch (err: any) {
      console.error("Error fetching canonical documents", err);
    }
  };

  // Fetch documents for the current node
  const fetchDocuments = async () => {
    if (!nodeId) return;
    
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const res = await fetch(`${API_BASE}/api/documents?nodeId=${nodeId}`);
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
    if (nodeId) {
      fetchDocuments();
    }
  }, [nodeId, API_BASE]);

  const handleCreateDocument = async () => {
    if (!nodeId || !createTitle.trim()) {
      setDocumentCreateError("Title is required");
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
          nodeId: nodeId,
          title: createTitle.trim(),
          content: createContent.trim() || null,
          isGovernance: createIsGovernance,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Success: close modal, clear form, refresh documents
      setCreateDocumentOpened(false);
      setCreateTitle("");
      setCreateContent("");
      setCreateIsGovernance(false);
      setDocumentCreateError(null);

      // Refresh documents list
      await fetchDocuments();
      
      // Optionally refresh node to update document count
      if (nodeId) {
        const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
        if (res.ok) {
          const updatedNode = (await res.json()) as Node;
          setNode(updatedNode);
        }
      }
    } catch (err: any) {
      console.error("Error creating document", err);
      setDocumentCreateError(err?.message ?? "Failed to create document");
    } finally {
      setCreatingDocument(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
            <Text size="sm">Loading node…</Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  if (error || !node) {
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
              {error || "Node not found"}
            </Text>
            <Button
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/nodes")}
              size="sm"
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Back to Nodes
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Banner */}
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
          <Text size="sm" c={palette.textSoft}>
            This is the first Continuum Surface. Select a palette, click a
            workspace, and Continuum will fetch its nodes from Continuum Core.
          </Text>
          <Text size="xs" c={palette.textSoft}>
            API Base: {API_BASE}
          </Text>
        </Stack>
      </Paper>

      {/* Node Header */}
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
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate("/nodes")}
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
              <Text fw={700} size="xl" c={palette.text}>
                {node.name}
              </Text>
              {healthStatus && (
                <Badge
                  color={
                    healthStatus.status === "PASS"
                      ? "green"
                      : healthStatus.status === "WARN"
                      ? "yellow"
                      : "red"
                  }
                  variant="filled"
                  size="lg"
                  title={healthStatus.message}
                >
                  {healthStatus.status}
                </Badge>
              )}
            </Group>
          </Group>

          <Group gap="md">
            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Workspace
              </Text>
              <Group gap="xs" align="center">
                <Text size="sm" fw={500} c={palette.text}>
                  {node.workspace.name}
                </Text>
                {node.workspace.readiness && (
                  <Badge
                    color={node.workspace.readiness === "READY" ? "green" : "yellow"}
                    variant="filled"
                    size="sm"
                  >
                    {node.workspace.readiness === "READY" ? "READY" : "NOT READY"}
                  </Badge>
                )}
                {node.workspace.aiMode && (
                  <Badge
                    color={
                      node.workspace.aiMode === "OPERATIONAL"
                        ? "blue"
                        : node.workspace.aiMode === "ADVISORY"
                        ? "cyan"
                        : "orange"
                    }
                    variant="filled"
                    size="sm"
                  >
                    AI: {node.workspace.aiMode}
                  </Badge>
                )}
              </Group>
              {(node.workspace.readiness === "NOT_READY" ||
                (node.workspace.warnings && node.workspace.warnings.length > 0)) && (
                <ReadinessDetails
                  readiness={node.workspace.readiness}
                  reasons={node.workspace.reasons || []}
                  warnings={node.workspace.warnings || []}
                  palette={palette}
                />
              )}
            </Stack>

            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Created
              </Text>
              <Text size="sm" c={palette.text}>
                {new Date(node.createdAt).toLocaleString()}
              </Text>
            </Stack>
          </Group>

          <Group gap="md">
            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Programs
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.programs}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Modules
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.modules}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Documents
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.documents}
                </Text>
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              style={{
                backgroundColor: palette.header,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Stack gap={4}>
                <Text size="xs" c={palette.textSoft}>
                  Integrations
                </Text>
                <Text fw={700} size="lg" c={palette.text}>
                  {node._count.integrations}
                </Text>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      {/* Programs Section */}
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
          <Text fw={600} size="lg">
            Programs
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No programs yet. Programs will appear here when created.
          </Text>
        </Stack>
      </Paper>

      {/* Canon Library Section */}
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
            <Text fw={600} size="lg" c={palette.text}>
              Canon Library
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setLinkModalOpened(true)}
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
              Link Canon Doc
            </Button>
          </Group>

          {canonLinksLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading canonical links...
              </Text>
            </Group>
          )}

          {canonLinksError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {canonLinksError}
            </Alert>
          )}

          {!canonLinksLoading && !canonLinksError && canonLinks.length === 0 && (
            <Text size="sm" c={palette.textSoft}>
              No canonical documents linked. Link a canonical document to satisfy required document requirements.
            </Text>
          )}

          {!canonLinksLoading && !canonLinksError && canonLinks.length > 0 && (
            <Table
              striped
              highlightOnHover
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
                thead: {
                  backgroundColor: palette.header,
                },
                th: {
                  color: palette.text,
                  fontWeight: 600,
                },
                td: {
                  color: palette.text,
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Key</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {canonLinks.map((link) => (
                  <Table.Tr key={link.id}>
                    <Table.Td>
                      <Text size="sm" fw={500} c={palette.text}>
                        {link.canonicalDocument.key}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={palette.textSoft}>
                        {link.canonicalDocument.title || "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={link.canonicalDocument.governed ? "yellow" : "gray"}
                        variant="filled"
                        size="sm"
                      >
                        {link.canonicalDocument.governed ? "Governed" : "Draft"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        size="xs"
                        color="red"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await fetch(
                              `${API_BASE}/api/nodes/${nodeId}/document-links/${link.id}`,
                              { method: "DELETE" }
                            );
                            if (!res.ok) {
                              throw new Error(`HTTP ${res.status}`);
                            }
                            notifications.show({
                              title: "Unlinked",
                              message: `Canonical document "${link.canonicalDocument.key}" unlinked`,
                              color: "green",
                            });
                            await fetchCanonLinks();
                            // Refresh node to update readiness
                            if (nodeId) {
                              const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                              if (res.ok) {
                                const updatedNode = (await res.json()) as Node;
                                setNode(updatedNode);
                              }
                            }
                          } catch (err: any) {
                            console.error("Error unlinking canonical document", err);
                            notifications.show({
                              title: "Unlink failed",
                              message: err?.message || "Failed to unlink canonical document",
                              color: "red",
                            });
                          }
                        }}
                      >
                        Unlink
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Documents Section */}
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
            <Text fw={600} size="lg" c={palette.text}>
              Documents
            </Text>
            <Group gap="xs">
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => setUploadDocumentOpened(true)}
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

          {documentsLoading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c={palette.textSoft}>
                Loading documents...
              </Text>
            </Group>
          )}

          {documentsError && (
            <Alert
              color="red"
              title="Error"
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
              }}
            >
              {documentsError}
            </Alert>
          )}

          {!documentsLoading && !documentsError && documents.length === 0 && (
            <Text size="sm" c={palette.textSoft}>
              No documents yet. Create your first document to get started.
            </Text>
          )}

          {!documentsLoading && !documentsError && documents.length > 0 && (
            <Table
              striped
              highlightOnHover
              styles={{
                root: {
                  backgroundColor: palette.surface,
                },
                thead: {
                  backgroundColor: palette.header,
                },
                th: {
                  color: palette.text,
                  fontWeight: 600,
                },
                td: {
                  color: palette.text,
                },
                tr: {
                  "&:hover": {
                    backgroundColor: palette.header,
                  },
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Governance</Table.Th>
                  <Table.Th>Updated</Table.Th>
                  <Table.Th style={{ width: "50px" }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/documents/${doc.id}`);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View document ${doc.title}`}
                  >
                    <Table.Td>
                      <Text size="sm" fw={500} c={palette.text}>
                        {doc.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={palette.textSoft}>
                        {doc.type || "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={doc.isGovernance ? "yellow" : "gray"}
                        variant="filled"
                        size="sm"
                      >
                        {doc.isGovernance ? "Governed" : "Draft"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={palette.textSoft}>
                        {formatDate(doc.updatedAt)}
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
                                
                                // Refresh node to update workspace readiness/aiMode
                                if (nodeId) {
                                  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                                  if (res.ok) {
                                    const updatedNode = (await res.json()) as Node;
                                    setNode(updatedNode);
                                  }
                                }
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
                                color: palette.text,
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
                                
                                // Refresh node to update workspace readiness/aiMode
                                if (nodeId) {
                                  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                                  if (res.ok) {
                                    const updatedNode = (await res.json()) as Node;
                                    setNode(updatedNode);
                                  }
                                }
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
                                color: palette.text,
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
                                
                                // Optionally refresh node to update document count
                                if (nodeId) {
                                  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                                  if (res.ok) {
                                    const updatedNode = (await res.json()) as Node;
                                    setNode(updatedNode);
                                  }
                                }

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
                              color: palette.textSoft,
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

      {/* Create Document Modal */}
      <Modal
        opened={createDocumentOpened}
        onClose={() => {
          setCreateDocumentOpened(false);
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
            placeholder="Markdown supported"
            value={createContent}
            onChange={(e) => setCreateContent(e.target.value)}
            minRows={8}
            autosize
            disabled={creatingDocument}
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
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
              disabled={!createTitle.trim() || creatingDocument}
              loading={creatingDocument}
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
        </Stack>
      </Modal>

      {/* Integrations Section */}
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
          <Text fw={600} size="lg">
            Integrations
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No integrations yet. Integrations will appear here when configured.
          </Text>
        </Stack>
      </Paper>

      {/* MCP Servers Section */}
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
          <Text fw={600} size="lg">
            MCP Servers
          </Text>
          <Text size="sm" c={palette.textSoft}>
            No MCP servers yet. MCP servers will appear here when created.
          </Text>
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
                {selectedDocument.metadata?.nodeName || selectedDocument.source || node?.name || "—"}
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

                      if (nodeId) {
                        const resNode = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                        if (resNode.ok) {
                          const updatedNode = (await resNode.json()) as Node;
                          setNode(updatedNode);
                        }
                      }

                      await fetchDocuments();

                      // Refresh node to get updated workspace readiness and AI mode
                      if (nodeId) {
                        const resNode = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                        if (resNode.ok) {
                          const updatedNode = (await resNode.json()) as Node;
                          setNode(updatedNode);
                        }
                      }

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
                                  if (child.type === "code" || child.type === "pre") {
                                    return child;
                                  }
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


      {/* Upload Document Modal */}
      <Modal
        opened={uploadDocumentOpened}
        onClose={() => {
          setUploadDocumentOpened(false);
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
                    // Note: File object is still usable after .text() call
                  } catch (err) {
                    console.error("Error reading file for frontmatter", err);
                    // Continue with default (false) if parsing fails
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
                if (!nodeId) {
                  setDocumentUploadError("Unable to determine node for upload.");
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
                  // Otherwise, use checkbox value
                  let finalIsGovernance = uploadIsGovernance;
                  try {
                    // Read file content to check frontmatter
                    const fileText = await uploadFile.text();
                    const frontmatterHasGovernance = extractGovernanceFromFrontmatter(fileText);
                    // Frontmatter overrides checkbox if it explicitly sets governance
                    if (frontmatterHasGovernance) {
                      finalIsGovernance = true;
                    }
                    // If frontmatter doesn't have governance: governed, use checkbox value
                  } catch (err) {
                    console.warn("Could not parse frontmatter, using checkbox value", err);
                    // On error, fall back to checkbox value
                  }

                  const formData = new FormData();
                  // Recreate File object to ensure it's usable after text() call
                  const fileBlob = await uploadFile.arrayBuffer();
                  const recreatedFile = new File([fileBlob], uploadFile.name, { type: uploadFile.type });
                  formData.append("file", recreatedFile);
                  formData.append("nodeId", nodeId);
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
                  setUploadFile(null);
                  setUploadIsGovernance(false);
                  setDocumentUploadError(null);

                  // Refresh documents list
                  await fetchDocuments();

                  // Refresh node to update document count
                  const resNode = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                  if (resNode.ok) {
                    const updatedNode = (await resNode.json()) as Node;
                    setNode(updatedNode);
                  }

                  // Show success notification
                  const nodeName =
                    node?.name ||
                    createdDocument.metadata?.nodeName ||
                    "this Node";
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
              disabled={!uploadFile || uploadingDocument}
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

      {/* Link Canon Document Modal */}
      <Modal
        opened={linkModalOpened}
        onClose={() => {
          setLinkModalOpened(false);
          setSelectedCanonDocId("");
        }}
        title="Link Canonical Document"
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
          <Select
            label="Canonical Document"
            placeholder="Select a canonical document to link"
            data={canonDocs.map((doc) => ({
              value: doc.id,
              label: `${doc.key}${doc.title ? ` - ${doc.title}` : ""}`,
            }))}
            value={selectedCanonDocId}
            onChange={(value) => setSelectedCanonDocId(value || "")}
            searchable
            styles={{
              input: {
                backgroundColor: palette.header,
                borderColor: palette.border,
                color: palette.text,
              },
              dropdown: {
                backgroundColor: palette.surface,
              },
            }}
          />
          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => {
                setLinkModalOpened(false);
                setSelectedCanonDocId("");
              }}
              disabled={linking}
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
                if (!selectedCanonDocId || !nodeId) return;
                try {
                  setLinking(true);
                  const res = await fetch(
                    `${API_BASE}/api/nodes/${nodeId}/document-links`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        canonicalDocumentId: selectedCanonDocId,
                      }),
                    }
                  );
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${res.status}`);
                  }
                  notifications.show({
                    title: "Linked",
                    message: "Canonical document linked successfully",
                    color: "green",
                  });
                  setLinkModalOpened(false);
                  setSelectedCanonDocId("");
                  await fetchCanonLinks();
                  // Refresh node to update readiness
                  if (nodeId) {
                    const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
                    if (res.ok) {
                      const updatedNode = (await res.json()) as Node;
                      setNode(updatedNode);
                    }
                  }
                } catch (err: any) {
                  console.error("Error linking canonical document", err);
                  notifications.show({
                    title: "Link failed",
                    message: err?.message || "Failed to link canonical document",
                    color: "red",
                  });
                } finally {
                  setLinking(false);
                }
              }}
              disabled={!selectedCanonDocId || linking}
              loading={linking}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Link
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}















