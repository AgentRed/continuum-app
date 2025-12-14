import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
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
import { IconPlus } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import GlossaryTextWrapper from "../components/GlossaryTextWrapper";

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
            Add Document
          </Button>
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
                  <Table.Th style={{ width: "25%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "18%" }}>Node</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>Governance</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>RAG</Table.Th>
                  <Table.Th style={{ width: "18%", whiteSpace: "nowrap" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "19%", whiteSpace: "nowrap" }}>Created</Table.Th>
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
        title={selectedDocument?.title}
        position="right"
        size="lg"
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
                Title
              </Text>
              <Text size="sm" c={palette.text}>
                {selectedDocument.title}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Node
              </Text>
              <Text size="sm" c={palette.text}>
                {selectedDocument.metadata?.nodeName || selectedDocument.source}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Version
              </Text>
              <Text size="sm" c={palette.text}>
                {selectedDocument.metadata?.version || "—"}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Governance
              </Text>
              <Badge
                color={selectedDocument.isGovernance ? "yellow" : "blue"}
                variant="filled"
                size="sm"
              >
                {selectedDocument.isGovernance ? "Governed" : "Standard"}
              </Badge>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" fw={600} c={palette.text}>
                Content
              </Text>
              <Paper
                p="sm"
                radius="md"
                style={{
                  backgroundColor: palette.background,
                  border: `1px solid ${palette.border}`,
                  maxHeight: "400px",
                  overflowY: "auto",
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


