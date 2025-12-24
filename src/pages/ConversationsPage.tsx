import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import LoadingRow from "../ui/LoadingRow";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { getTableStyles } from "../ui/tableStyles";
import {
  listConversations,
  createConversation,
  type Conversation,
} from "../lib/conversationsApi";

type ConversationsPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ConversationsPage({
  palette,
  API_BASE,
}: ConversationsPageProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newConversationModalOpened, setNewConversationModalOpened] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [API_BASE]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await listConversations(API_BASE);
      setConversations(data);
    } catch (err: any) {
      console.error("Error loading conversations", err);
      setError(err?.message ?? "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setCreating(true);
      setCreateError(null);

      const conversation = await createConversation(API_BASE, {
        title: newConversationTitle || undefined,
      });

      setNewConversationModalOpened(false);
      setNewConversationTitle("");
      navigate(`/conversations/${conversation.id}`);
    } catch (err: any) {
      console.error("Error creating conversation", err);
      setCreateError(err?.message ?? "Failed to create conversation");
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
        title="Conversations"
        subtitle="Persistent conversation threads with Continuum"
        palette={palette}
        right={
          <Group gap="xs">
            <Button
              leftSection={<Icons.Refresh size={16} />}
              onClick={fetchConversations}
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
              onClick={() => setNewConversationModalOpened(true)}
              size="sm"
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              New Conversation
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
        <Stack gap="md">
          {loading && (
            <LoadingRow message="Loading conversations..." palette={palette} />
          )}

          {error && (
            <ErrorState message={error} palette={palette} />
          )}

          {!loading && !error && conversations.length === 0 && (
            <EmptyState message="No conversations found." palette={palette} />
          )}

          {!loading && !error && conversations.length > 0 && (
            <Table
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed", width: "100%" }}
              styles={getTableStyles(palette)}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: "50%" }}>Title</Table.Th>
                  <Table.Th style={{ width: "20%", textAlign: "center" }}>
                    Messages
                  </Table.Th>
                  <Table.Th style={{ width: "30%", whiteSpace: "nowrap" }}>
                    Updated
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {conversations.map((conv) => (
                  <Table.Tr
                    key={conv.id}
                    onClick={() => navigate(`/conversations/${conv.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Table.Td style={{ width: "50%" }}>
                      <Text size="sm" fw={500} lineClamp={1} c={palette.text}>
                        {conv.title || "Untitled"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "20%", textAlign: "center" }}>
                      <Text size="sm" c={palette.text}>
                        {conv.messageCount ?? 0}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ width: "30%" }}>
                      <Text size="xs" lineClamp={1} c={palette.text}>
                        {formatDate(conv.updatedAt)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      <Modal
        opened={newConversationModalOpened}
        onClose={() => {
          setNewConversationModalOpened(false);
          setNewConversationTitle("");
          setCreateError(null);
        }}
        title="New Conversation"
        styles={{
          title: { color: palette.text },
          content: {
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          },
          body: { backgroundColor: palette.surface },
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Title (optional)"
            placeholder="Enter conversation title"
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            styles={{
              label: { color: palette.text },
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            }}
          />
          {createError && (
            <Text size="sm" c="red">
              {createError}
            </Text>
          )}
          <Group justify="flex-end">
            <Button
              onClick={() => {
                setNewConversationModalOpened(false);
                setNewConversationTitle("");
                setCreateError(null);
              }}
              variant="subtle"
              styles={{
                root: { color: palette.text },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
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

