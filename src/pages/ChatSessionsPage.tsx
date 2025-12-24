import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Badge,
  Button,
  Group,
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
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import {
  listChatSessions,
  createChatSession,
  type ChatSession,
  type ChatProvider,
} from "../lib/chatApi";

type ChatSessionsPageProps = {
  palette: any;
  API_BASE: string;
};

const TENANT_ID = "tenant_continuum";

const PROVIDER_OPTIONS: { value: ChatProvider; label: string }[] = [
  { value: "STUB", label: "STUB" },
  { value: "OPENAI", label: "OpenAI" },
  { value: "ANTHROPIC", label: "Anthropic" },
  { value: "GEMINI", label: "Gemini" },
];

export default function ChatSessionsPage({
  palette,
  API_BASE,
}: ChatSessionsPageProps) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSessionModalOpened, setNewSessionModalOpened] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newProvider, setNewProvider] = useState<ChatProvider>("STUB");
  const [newModel, setNewModel] = useState("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listChatSessions(API_BASE, TENANT_ID);
      setSessions(data);
    } catch (err: any) {
      console.error("Error loading chat sessions", err);
      setError(err?.message ?? "Failed to load chat sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [API_BASE]);

  const handleCreateSession = async () => {
    try {
      setCreating(true);
      setCreateError(null);
      const payload = {
        tenantId: TENANT_ID,
        title: newTitle || undefined,
        provider: newProvider,
        model: newModel || undefined,
        systemPrompt: newSystemPrompt || undefined,
      };
      const session = await createChatSession(API_BASE, payload);
      setNewSessionModalOpened(false);
      setNewTitle("");
      setNewModel("");
      setNewSystemPrompt("");
      setNewProvider("STUB");
      navigate(`/chat/${session.id}`);
    } catch (err: any) {
      console.error("Error creating chat session", err);
      setCreateError(err?.message ?? "Failed to create chat session");
    } finally {
      setCreating(false);
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

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Chat"
        subtitle="Provider-agnostic chat sessions persisted in core"
        palette={palette}
        right={
          <Group gap="xs">
            <Button
              leftSection={<Icons.Refresh size={16} />}
              onClick={fetchSessions}
              size="sm"
              loading={loading}
              variant="subtle"
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Refresh
            </Button>
            <Button
              leftSection={<Icons.Add size={16} />}
              onClick={() => setNewSessionModalOpened(true)}
              size="sm"
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              New Session
            </Button>
          </Group>
        }
      />

      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        {error ? (
          <ErrorState message={error} onRetry={fetchSessions} palette={palette} />
        ) : loading && sessions.length === 0 ? (
          <LoadingRow palette={palette} />
        ) : sessions.length === 0 ? (
          <EmptyState
            message="No chat sessions found. Create a new session to get started."
            palette={palette}
          />
        ) : (
          <Table styles={getTableStyles(palette)}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Provider</Table.Th>
                <Table.Th>Model</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sessions.map((session) => (
                <Table.Tr key={session.id}>
                  <Table.Td>
                    <Text
                      component={Link}
                      to={`/chat/${session.id}`}
                      style={{
                        color: palette.accent,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {session.title || `Session ${session.id.slice(0, 8)}`}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {session.provider}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={palette.textSoft}>
                      {session.model || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={palette.textSoft}>
                      {formatDate(session.updatedAt)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={newSessionModalOpened}
        onClose={() => {
          setNewSessionModalOpened(false);
          setCreateError(null);
        }}
        title="New Chat Session"
        styles={{
          content: {
            backgroundColor: palette.surface,
          },
          header: {
            backgroundColor: palette.surface,
            borderBottom: `1px solid ${palette.border}`,
          },
        }}
      >
        <Stack gap="md">
          {createError && (
            <Text size="sm" c="red">
              {createError}
            </Text>
          )}
          <TextInput
            label="Title (optional)"
            placeholder="My chat session"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <Select
            label="Provider"
            data={PROVIDER_OPTIONS}
            value={newProvider}
            onChange={(value) => setNewProvider(value as ChatProvider)}
            required
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <TextInput
            label="Model (optional)"
            placeholder="gpt-4, claude-3-opus, etc."
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <Textarea
            label="System Prompt (optional)"
            placeholder="You are a helpful assistant..."
            value={newSystemPrompt}
            onChange={(e) => setNewSystemPrompt(e.target.value)}
            minRows={3}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => {
                setNewSessionModalOpened(false);
                setCreateError(null);
              }}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              loading={creating}
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


