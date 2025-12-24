import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
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
} from "@mantine/core";
import { Icons } from "../ui/icons";
import ContentQualityBadge from "../components/ContentQualityBadge";
import DocumentHealthIndicator from "../components/DocumentHealthIndicator";
import { useContentQuality } from "../context/ContentQualityContext";
import { API_BASE } from "../config";

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
  const navigate = useNavigate();
  const { refresh: refreshQuality, loading: qualityLoading, documentById, documentByKey } = useContentQuality();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodesError, setNodesError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Create Document modal state
  const [createDocumentOpened, setCreateDocumentOpened] = useState(false);
  const [createNodeId, setCreateNodeId] = useState<string | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createIsGovernance, setCreateIsGovernance] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [documentCreateError, setDocumentCreateError] = useState<string | null>(null);

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
    navigate(`/documents/${document.id}`);
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
              Add Document
            </Button>
          </Group>
        </Group>
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
                  <Table.Th style={{ width: "16%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "14%" }}>Node</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Health</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Quality</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Governance</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>RAG</Table.Th>
                  <Table.Th style={{ width: "15%", whiteSpace: "nowrap" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "15%", whiteSpace: "nowrap" }}>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr
                    key={doc.id}
                    onClick={() => handleRowClick(doc)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "16%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                        {doc.title}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "14%" }}>
                      <Text size="sm" lineClamp={1} c={palette.text}>
                        {doc.metadata?.nodeName || doc.source}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <DocumentHealthIndicator
                        entityType="DOCUMENT"
                        id={doc.id}
                        title={doc.title}
                        content={doc.content}
                        compact
                      />
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      {(() => {
                        const auditItem = documentById[doc.id] || (doc.title ? documentByKey[doc.title.toLowerCase()] : null);
                        return (
                          <ContentQualityBadge
                            severity={auditItem?.severity || null}
                            reasons={auditItem?.reasons || []}
                            compact
                          />
                        );
                      })()}
                    </Table.Td>
                    <Table.Td style={{ width: "10%", textAlign: "center" }}>
                      <Badge
                        color={doc.isGovernance ? "yellow" : "blue"}
                        variant="filled"
                        size="sm"
                      >
                        {doc.isGovernance ? "Governed" : "Standard"}
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
                    <Table.Td style={{ width: "15%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {formatDate(doc.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "15%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {doc.metadata?.createdAt
                          ? formatDate(doc.metadata.createdAt)
                          : "—"}
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
                fontFamily: "var(--font-mono)",
              },
            }}
          />

          <Checkbox
            label="Governance document (governed change required)"
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
    </Stack>
  );
}






