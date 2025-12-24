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
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import {
  getChatSession,
  updateChatSession,
  sendChatMessage,
  type ChatSession,
  type ChatProvider,
} from "../lib/chatApi";
import {
  getEnabledModels,
  getEnabledProviders,
  loadRegistry,
} from "../lib/modelRegistryStore";
import type { ProviderId } from "../config/modelRegistry";

type ChatSessionPageProps = {
  palette: any;
  API_BASE: string;
};

// LocalStorage keys for persisting provider/model selection
const STORAGE_KEY_PROVIDER = "continuum_chat_provider";
const STORAGE_KEY_MODEL = "continuum_chat_model";

export default function ChatSessionPage({
  palette,
  API_BASE,
}: ChatSessionPageProps) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  // Provider and model selection with localStorage persistence
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PROVIDER);
    return (stored as ProviderId) || null;
  });
  const [selectedModelId, setSelectedModelId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_MODEL);
    return stored || null;
  });
  
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Initialize provider/model from localStorage or defaults
  useEffect(() => {
    const enabledModels = getEnabledModels();
    if (enabledModels.length === 0) return;

    if (!selectedProvider) {
      // Use first enabled model as default
      const defaultModel = enabledModels[0];
      setSelectedProvider(defaultModel.provider);
      setSelectedModelId(defaultModel.id);
      localStorage.setItem(STORAGE_KEY_PROVIDER, defaultModel.provider);
      localStorage.setItem(STORAGE_KEY_MODEL, defaultModel.id);
    } else if (!selectedModelId) {
      // Find first enabled model for selected provider
      const providerModels = getEnabledModels(selectedProvider);
      if (providerModels.length > 0) {
        setSelectedModelId(providerModels[0].id);
        localStorage.setItem(STORAGE_KEY_MODEL, providerModels[0].id);
      }
    }
  }, [selectedProvider, selectedModelId]);

  // Get available models for selected provider (only enabled)
  const availableModels = selectedProvider
    ? getEnabledModels(selectedProvider)
    : [];

  // Provider options for select (only providers with enabled models)
  const providerOptions = getEnabledProviders().map((provider) => ({
    value: provider,
    label: provider.charAt(0).toUpperCase() + provider.slice(1),
  }));

  // Model options for select
  const modelOptions = availableModels.map((model) => ({
    value: model.id,
    label: model.label,
  }));

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getChatSession(API_BASE, sessionId);
      setSession(data);
      setEditTitle(data.title || "");
    } catch (err: any) {
      console.error("Error loading chat session", err);
      setError(err?.message ?? "Failed to load chat session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [API_BASE, sessionId]);

  const handleProviderChange = (provider: ProviderId | null) => {
    setSelectedProvider(provider);
    if (provider) {
      localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
      const providerModels = getEnabledModels(provider);
      if (providerModels.length > 0) {
        setSelectedModelId(providerModels[0].id);
        localStorage.setItem(STORAGE_KEY_MODEL, providerModels[0].id);
      }
    }
  };

  const handleModelChange = (modelId: string | null) => {
    setSelectedModelId(modelId);
    if (modelId) {
      localStorage.setItem(STORAGE_KEY_MODEL, modelId);
    }
  };

  const handleSendMessage = async () => {
    if (!sessionId || !messageContent.trim()) return;
    try {
      setSending(true);
      setSendError(null);
      
      // Map provider IDs to ChatProvider format if needed
      const providerMap: Record<ProviderId, ChatProvider> = {
        openai: "OPENAI",
        anthropic: "ANTHROPIC",
        google: "GEMINI",
      };
      
      const payload = {
        role: "USER" as const,
        content: messageContent.trim(),
        provider: selectedProvider ? providerMap[selectedProvider] : undefined,
        model: selectedModelId || undefined,
        updateSummary: true,
      };
      const updatedSession = await sendChatMessage(API_BASE, sessionId, payload);
      setSession(updatedSession);
      setMessageContent("");
      // Don't clear provider/model selection - preserve for next message
    } catch (err: any) {
      console.error("Error sending message", err);
      setSendError(err?.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!sessionId) return;
    try {
      setUpdating(true);
      setUpdateError(null);
      const updatedSession = await updateChatSession(API_BASE, sessionId, {
        title: editTitle || undefined,
      });
      setSession(updatedSession);
      setEditModalOpened(false);
    } catch (err: any) {
      console.error("Error updating session", err);
      setUpdateError(err?.message ?? "Failed to update session");
    } finally {
      setUpdating(false);
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

  if (loading && !session) {
    return (
      <Stack gap="md" align="center" style={{ paddingTop: "2rem" }}>
        <Loader size="lg" />
        <Text c={palette.textSoft}>Loading chat session...</Text>
      </Stack>
    );
  }

  if (error && !session) {
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
          <Stack gap="md">
            <Text c="red">{error}</Text>
            <Button
              onClick={fetchSession}
              leftSection={<Icons.Refresh size={16} />}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Retry
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  if (!session) {
    return null;
  }

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
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="xs">
                <Text fw={600} size="lg" c={palette.text}>
                  {session.title || `Session ${session.id.slice(0, 8)}`}
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<Icons.Edit size={14} />}
                  onClick={() => setEditModalOpened(true)}
                  styles={{
                    root: {
                      color: palette.textSoft,
                    },
                  }}
                >
                  Edit
                </Button>
              </Group>
              <Group gap="xs">
                <Badge variant="light" size="sm">
                  {session.provider}
                </Badge>
                {session.model && (
                  <Text size="sm" c={palette.textSoft}>
                    {session.model}
                  </Text>
                )}
              </Group>
              <Text size="xs" c={palette.textSoft}>
                Updated: {formatDate(session.updatedAt)}
              </Text>
              <Text size="xs" c={palette.textSoft} style={{ fontFamily: "monospace" }}>
                ID: {session.id}
              </Text>
            </Stack>
            <Button
              variant="subtle"
              leftSection={<Icons.ArrowLeft size={16} />}
              onClick={() => navigate("/chat")}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Back
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Messages Card */}
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
          <Group justify="space-between">
            <Text fw={600} size="md" c={palette.text}>
              Messages
            </Text>
            <Button
              size="xs"
              variant="subtle"
              leftSection={<Icons.Refresh size={14} />}
              onClick={fetchSession}
              loading={loading}
              styles={{
                root: {
                  color: palette.text,
                },
              }}
            >
              Refresh
            </Button>
          </Group>
          {session.messages.length === 0 ? (
            <Text size="sm" c={palette.textSoft} style={{ fontStyle: "italic" }}>
              No messages yet. Send a message to start the conversation.
            </Text>
          ) : (
            <Stack gap="md">
              {session.messages.map((message) => (
                <Paper
                  key={message.id}
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: palette.surface,
                    border: `1px solid ${palette.border}`,
                    alignSelf: message.role === "USER" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    lineHeight: 1.5,
                  }}
                >
                  <Stack gap="xs">
                    <Group gap="xs" justify="space-between">
                      <Badge
                        size="xs"
                        variant="light"
                        color={message.role === "USER" ? "blue" : "gray"}
                      >
                        {message.role}
                      </Badge>
                      {message.provider && (
                        <Text size="xs" c={palette.textSoft}>
                          {message.provider}
                        </Text>
                      )}
                    </Group>
                    <Text
                      size="sm"
                      c={palette.text}
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontFamily: message.content.includes("```") ? "var(--font-mono)" : undefined,
                      }}
                    >
                      {message.content}
                    </Text>
                    <Text size="xs" c={palette.textSoft}>
                      {formatDate(message.createdAt)}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Composer Card */}
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
          <Text fw={600} size="md" c={palette.text}>
            Send Message
          </Text>
          {sendError && (
            <Text size="sm" c="red">
              {sendError}
            </Text>
          )}
          <Textarea
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            minRows={3}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            styles={{
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
                fontFamily: "monospace",
              },
            }}
          />
          <Group gap="xs" align="flex-end">
            <Select
              label="Provider"
              placeholder="Select provider"
              data={providerOptions}
              value={selectedProvider || ""}
              onChange={(value) => handleProviderChange(value as ProviderId | null)}
              disabled={sending}
              style={{ width: "150px" }}
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
              label="Model"
              placeholder="Select model"
              data={modelOptions}
              value={selectedModelId || ""}
              onChange={(value) => handleModelChange(value || null)}
              disabled={sending || !selectedProvider}
              style={{ flex: 1 }}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
            <Button
              leftSection={<Icons.Send size={16} />}
              onClick={handleSendMessage}
              loading={sending}
              disabled={!messageContent.trim()}
              styles={{
                root: {
                  backgroundColor: palette.accent,
                  color: palette.background,
                },
              }}
            >
              Send
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Edit Title Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setUpdateError(null);
        }}
        title="Edit Session Title"
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
          {updateError && (
            <Text size="sm" c="red">
              {updateError}
            </Text>
          )}
          <TextInput
            label="Title"
            placeholder="My chat session"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
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
                setEditModalOpened(false);
                setUpdateError(null);
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
              onClick={handleUpdateTitle}
              loading={updating}
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
      </Modal>
    </Stack>
  );
}


