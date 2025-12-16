import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
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
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";

type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  content: string;
  governed: boolean;
  createdAt: string;
  updatedAt: string;
};

type CanonicalDocumentsPageProps = {
  palette: any;
};

export default function CanonicalDocumentsPage({
  palette,
}: CanonicalDocumentsPageProps) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<CanonicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [createKey, setCreateKey] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<CanonicalDocument | null>(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/canonical-documents`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setDocuments(data);
    } catch (err: any) {
      console.error("Error fetching canonical documents", err);
      setError(err?.message || "Failed to fetch canonical documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreate = async () => {
    if (!createKey.trim() || !createContent.trim()) {
      notifications.show({
        title: "Validation error",
        message: "Key and content are required",
        color: "red",
      });
      return;
    }

    try {
      setCreating(true);
      const res = await fetch(`${API_BASE}/api/canonical-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: createKey.trim(),
          title: createTitle.trim() || undefined,
          content: createContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      notifications.show({
        title: "Created",
        message: `Canonical document "${createKey}" created`,
        color: "green",
      });

      setCreateModalOpened(false);
      setCreateKey("");
      setCreateTitle("");
      setCreateContent("");
      await fetchDocuments();
    } catch (err: any) {
      console.error("Error creating canonical document", err);
      notifications.show({
        title: "Create failed",
        message: err?.message || "Failed to create canonical document",
        color: "red",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleMarkGoverned = async (doc: CanonicalDocument) => {
    try {
      const res = await fetch(`${API_BASE}/api/canonical-documents/${doc.id}/govern`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      notifications.show({
        title: "Document governed",
        message: `"${doc.key}" has been marked as governed`,
        color: "green",
      });

      await fetchDocuments();
    } catch (err: any) {
      console.error("Error marking document as governed", err);
      notifications.show({
        title: "Failed",
        message: err?.message || "Failed to mark document as governed",
        color: "red",
      });
    }
  };

  if (loading) {
    return (
      <Stack align="center" style={{ padding: "2rem" }}>
        <Loader size="lg" />
        <Text c={palette.textSoft}>Loading canonical documents...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack align="center" style={{ padding: "2rem" }}>
        <Text c="red">{error}</Text>
        <Button onClick={fetchDocuments}>Retry</Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md" style={{ padding: "1rem" }}>
      <Group justify="space-between">
        <Text size="xl" fw={600} c={palette.text}>
          Canonical Documents
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpened(true)}
        >
          Create Canonical Document
        </Button>
      </Group>

      <Paper withBorder p="md" style={{ backgroundColor: palette.surface }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Updated</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((doc) => (
              <Table.Tr key={doc.id}>
                <Table.Td>
                  <Text
                    size="sm"
                    fw={500}
                    c={palette.text}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedDocument(doc);
                      setViewModalOpened(true);
                    }}
                  >
                    {doc.key}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={palette.textSoft}>
                    {doc.title || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={doc.governed ? "yellow" : "gray"}
                    variant="filled"
                    size="sm"
                  >
                    {doc.governed ? "Governed" : "Draft"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={palette.textSoft}>
                    {new Date(doc.updatedAt).toLocaleString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {!doc.governed && (
                      <Button
                        variant="subtle"
                        size="xs"
                        color="yellow"
                        onClick={() => handleMarkGoverned(doc)}
                      >
                        Mark Governed
                      </Button>
                    )}
                    <Button
                      variant="subtle"
                      size="xs"
                      color="blue"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setViewModalOpened(true);
                      }}
                    >
                      View
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Create Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Create Canonical Document"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Key"
            placeholder="e.g., continuum-canon-index.md"
            value={createKey}
            onChange={(e) => setCreateKey(e.target.value)}
            required
          />
          <TextInput
            label="Title (optional)"
            placeholder="Document title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
          />
          <Textarea
            label="Content"
            placeholder="Document content (Markdown)"
            value={createContent}
            onChange={(e) => setCreateContent(e.target.value)}
            minRows={10}
            required
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setCreateModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title={selectedDocument?.key || "Document"}
        size="xl"
      >
        {selectedDocument && (
          <Stack gap="md">
            <Group>
              <Badge
                color={selectedDocument.governed ? "yellow" : "gray"}
                variant="filled"
              >
                {selectedDocument.governed ? "Governed" : "Draft"}
              </Badge>
              {selectedDocument.title && (
                <Text size="sm" c={palette.textSoft}>
                  {selectedDocument.title}
                </Text>
              )}
            </Group>
            <Paper p="md" withBorder style={{ backgroundColor: palette.surface }}>
              <ReactMarkdown>{selectedDocument.content}</ReactMarkdown>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
