import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import DocumentViewer from "../components/DocumentViewer";
import {
  getConversation,
  updateConversation,
  type Conversation,
  type Message,
} from "../lib/conversationsApi";
import { getModels, type ModelDef } from "../lib/modelsApi";

type ConversationDetailPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ConversationDetailPage({
  palette,
  API_BASE,
}: ConversationDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<
    (Conversation & { messages?: Message[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelDef[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Edit title state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // Composer state
  const [messageRole, setMessageRole] = useState<"SYSTEM" | "USER" | "ASSISTANT" | "TOOL">("USER");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchConversation();
      fetchModels();
    }
  }, [id, API_BASE]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getConversation(API_BASE, id);
      setConversation(data);
      if (data.title) {
        setEditTitle(data.title);
      }
    } catch (err: any) {
      console.error("Error loading conversation", err);
      setError(err?.message ?? "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setModelsLoading(true);
      const data = await getModels(API_BASE);
      setModels(data);
    } catch (err: any) {
      console.error("Error loading models", err);
      // Don't show error, just log it - models are optional
    } finally {
      setModelsLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!id) return;

    try {
      setSavingTitle(true);
      const updated = await updateConversation(API_BASE, id, {
        title: editTitle || undefined,
      });
      setConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      setEditingTitle(false);
    } catch (err: any) {
      console.error("Error updating title", err);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleSendMessage = async () => {
    if (!id || !messageContent.trim()) return;

    try {
      setSending(true);
      setSendError(null);

      await addMessage(API_BASE, id, {
        role: messageRole,
        content: messageContent,
        provider: selectedProvider || undefined,
        model: selectedModel || undefined,
      });

      setMessageContent("");
      setSelectedProvider(null);
      setSelectedModel(null);
      await fetchConversation();
    } catch (err: any) {
      console.error("Error sending message", err);
      setSendError(err?.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleQuickAddAssistant = () => {
    if (!messageContent.trim()) return;
    // This is a manual add, so we just send it as ASSISTANT role
    setMessageRole("ASSISTANT");
    handleSendMessage();
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

  const isMarkdown = (content: string): boolean => {
    // Simple heuristic: check for markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s/m, // Headers
      /\*\*.*\*\*/, // Bold
      /\*.*\*/, // Italic
      /\[.*\]\(.*\)/, // Links
      /^[-*+]\s/m, // Lists
      /^\d+\.\s/m, // Numbered lists
      /^```/m, // Code blocks
      /^>/m, // Blockquotes
    ];
    return markdownPatterns.some((pattern) => pattern.test(content));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SYSTEM":
        return "blue";
      case "USER":
        return "green";
      case "ASSISTANT":
        return "purple";
      case "TOOL":
        return "orange";
      default:
        return "gray";
    }
  };

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelDef[]>);

  const availableModels = selectedProvider
    ? modelsByProvider[selectedProvider] || []
    : [];

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
          <Text c={palette.text}>Loading conversation...</Text>
        </Paper>
      </Stack>
    );
  }

  if (error || !conversation) {
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
          <Text c="red">{error || "Conversation not found"}</Text>
          <Button
            leftSection={<Icons.ArrowLeft size={16} />}
            onClick={() => navigate("/conversations")}
            mt="md"
            styles={{
              root: {
                backgroundColor: palette.accent,
                color: palette.background,
              },
            }}
          >
            Back to Conversations
          </Button>
        </Paper>
      </Stack>
    );
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
              {editingTitle ? (
                <Group gap="xs" align="flex-start">
                  <TextInput
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Conversation title"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        backgroundColor: palette.background,
                        color: palette.text,
                        borderColor: palette.border,
                      },
                    }}
                  />
                  <Button
                    size="xs"
                    onClick={handleSaveTitle}
                    loading={savingTitle}
                    styles={{
                      root: {
                        backgroundColor: palette.accent,
                        color: palette.background,
                      },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      setEditingTitle(false);
                      setEditTitle(conversation.title || "");
                    }}
                    variant="subtle"
                    styles={{
                      root: { color: palette.text },
                    }}
                  >
                    Cancel
                  </Button>
                </Group>
              ) : (
                <Group gap="xs" align="center">
                  <Text size="lg" fw={600} c={palette.text}>
                    {conversation.title || "Untitled Conversation"}
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<Icons.Edit size={14} />}
                    onClick={() => {
                      setEditingTitle(true);
                      setEditTitle(conversation.title || "");
                    }}
                    styles={{
                      root: { color: palette.text },
                    }}
                  >
                    Edit
                  </Button>
                </Group>
              )}
              <Text size="xs" c={palette.textSoft}>
                ID: {conversation.id}
              </Text>
              <Text size="xs" c={palette.textSoft}>
                Updated: {formatDate(conversation.updatedAt)}
              </Text>
            </Stack>
            <Group gap="xs">
              <Button
                leftSection={<Icons.Refresh size={16} />}
                onClick={fetchConversation}
                size="sm"
                variant="subtle"
                styles={{
                  root: { color: palette.text },
                }}
              >
                Refresh
              </Button>
              <Button
                leftSection={<Icons.ArrowLeft size={16} />}
                onClick={() => navigate("/conversations")}
                size="sm"
                variant="subtle"
                styles={{
                  root: { color: palette.text },
                }}
              >
                Back
              </Button>
            </Group>
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
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <Stack gap="md">
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((message) => (
              <Paper
                key={message.id}
                p="md"
                radius="md"
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  alignSelf:
                    message.role === "USER" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  lineHeight: 1.5,
                }}
              >
                <Stack gap="xs">
                  <Group gap="xs" align="center">
                    <Badge
                      color={getRoleBadgeColor(message.role)}
                      variant="filled"
                      size="sm"
                    >
                      {message.role}
                    </Badge>
                    {message.provider && message.model && (
                      <Text size="xs" c={palette.textSoft}>
                        {message.provider} / {message.model}
                      </Text>
                    )}
                    <Text size="xs" c={palette.textSoft}>
                      {formatDate(message.createdAt)}
                    </Text>
                  </Group>
                  {isMarkdown(message.content) ? (
                    <DocumentViewer
                      content={message.content}
                      palette={palette}
                      maxHeight="none"
                    />
                  ) : (
                    <Text
                      size="sm"
                      c={palette.text}
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {message.content}
                    </Text>
                  )}
                </Stack>
              </Paper>
            ))
          ) : (
            <Text size="sm" c={palette.textSoft} ta="center" py="xl">
              No messages yet. Start the conversation below.
            </Text>
          )}
          <div ref={messagesEndRef} />
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
          <Group gap="md" align="flex-start">
            <Select
              label="Role"
              value={messageRole}
              onChange={(value) =>
                setMessageRole(
                  (value as "SYSTEM" | "USER" | "ASSISTANT" | "TOOL") || "USER"
                )
              }
              data={[
                { value: "SYSTEM", label: "SYSTEM" },
                { value: "USER", label: "USER" },
                { value: "ASSISTANT", label: "ASSISTANT" },
                { value: "TOOL", label: "TOOL" },
              ]}
              style={{ width: "120px" }}
              styles={{
                label: { color: palette.text },
                input: {
                  backgroundColor: palette.background,
                  color: palette.text,
                  borderColor: palette.border,
                },
              }}
            />
            {models.length > 0 && (
              <>
                <Select
                  label="Provider"
                  value={selectedProvider}
                  onChange={(value) => {
                    setSelectedProvider(value);
                    setSelectedModel(null);
                  }}
                  data={[
                    { value: "", label: "Use session provider" },
                    ...Object.keys(modelsByProvider).map((provider) => ({
                      value: provider,
                      label: provider,
                    })),
                  ]}
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
                {selectedProvider && availableModels.length > 0 && (
                  <Select
                    label="Model"
                    value={selectedModel}
                    onChange={(value) => setSelectedModel(value)}
                    data={availableModels.map((model) => ({
                      value: model.model,
                      label: model.displayName || model.model,
                    }))}
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
                )}
              </>
            )}
          </Group>
          <Textarea
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            minRows={5}
            styles={{
              input: {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
                fontFamily: "var(--font-mono)",
              },
            }}
          />
          {sendError && (
            <Text size="sm" c="red">
              {sendError}
            </Text>
          )}
          <Group justify="flex-end">
            {messageRole === "USER" && (
              <Button
                onClick={handleQuickAddAssistant}
                disabled={!messageContent.trim() || sending}
                variant="subtle"
                styles={{
                  root: { color: palette.text },
                }}
              >
                Quick Add Assistant Reply
              </Button>
            )}
            <Button
              leftSection={<IconSend size={16} />}
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
    </Stack>
  );
}

