import React, { useEffect, useState } from "react";
import {
  Badge,
  Drawer,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
} from "@mantine/core";

type Document = {
  id: string;
  title: string;
  type: string;
  source: string;
  updatedAt: string;
  ragReady?: boolean;
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
  useEffect(() => {
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

    fetchDocuments();
  }, [selectedNodeId, API_BASE]);

  const handleRowClick = (document: Document) => {
    setSelectedDocument(document);
    setDrawerOpened(true);
  };

  const nodeOptions = [
    { value: "", label: "All nodes" },
    ...nodes.map((node) => ({
      value: node.id,
      label: node.name,
    })),
  ];

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
        <Stack gap="xs">
          <Text size="lg" fw={600} c={palette.text}>
            Documents
          </Text>
          <Text size="xs" c={palette.textSoft}>
            View and browse documents across all nodes.
          </Text>
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
                  <Table.Th style={{ width: "30%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "20%" }}>Node</Table.Th>
                  <Table.Th style={{ width: "10%", textAlign: "center" }}>RAG</Table.Th>
                  <Table.Th style={{ width: "20%", whiteSpace: "nowrap" }}>Updated</Table.Th>
                  <Table.Th style={{ width: "20%", whiteSpace: "nowrap" }}>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => (
                  <Table.Tr
                    key={doc.id}
                    onClick={() => handleRowClick(doc)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "30%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c="#ffffff">
                        {doc.title}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="sm" lineClamp={1} c="#ffffff">
                        {doc.metadata?.nodeName || doc.source}
                      </Text>
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
                    <Table.Td style={{ width: "20%" }}>
                      <Text size="xs" lineClamp={1} c="#ffffff">
                        {formatDate(doc.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%" }}>
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
                  <Text
                    size="xs"
                    c={palette.textSoft}
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedDocument.content}
                  </Text>
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
    </Stack>
  );
}
