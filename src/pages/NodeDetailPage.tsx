import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";

// Local helper to display owner name with transformation
const displayOwnerName = (name: string | null | undefined): string => {
  if (!name) return "Owner";
  return name === "Continuum Systems" ? "Continuum" : name;
};

type Node = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
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
  
  // Create Document modal state
  const [createDocumentOpened, setCreateDocumentOpened] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createIsGovernance, setCreateIsGovernance] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState<string | null>(null);

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
              leftSection={<Icons.ArrowLeft size={16} />}
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
                leftSection={<Icons.ArrowLeft size={16} />}
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
            </Group>
          </Group>

          <Group gap="md">
            <Stack gap={4}>
              <Text size="xs" c={palette.textSoft}>
                Workspace
              </Text>
              <Text size="sm" fw={500} c={palette.text}>
                {node.workspace.tenant
                  ? `${displayOwnerName(node.workspace.tenant.name)} / ${node.workspace.name}`
                  : node.workspace.name}
              </Text>
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
            <Button
              leftSection={<Icons.Add size={16} />}
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
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr key={doc.id}>
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
                      {doc.isGovernance ? (
                        <Badge color="yellow" variant="light" size="sm">
                          Governance
                        </Badge>
                      ) : (
                        <Text size="xs" c={palette.textSoft}>
                          Standard
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={palette.textSoft}>
                        {formatDate(doc.updatedAt)}
                      </Text>
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

          <Stack gap="xs">
            <Checkbox
              label="Governance document"
              checked={createIsGovernance}
              onChange={(e) => setCreateIsGovernance(e.currentTarget.checked)}
              disabled={creatingDocument}
              styles={{
                label: {
                  color: palette.text,
                },
              }}
            />
            <Text size="xs" c={palette.textSoft} style={{ marginTop: "-8px", paddingLeft: "28px" }}>
              Meaning-impacting canon, requires explicit approval. When enabled, treat edits as governed.
            </Text>
          </Stack>

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
    </Stack>
  );
}





























