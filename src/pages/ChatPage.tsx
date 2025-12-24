import React, { useEffect, useState, useRef } from "react";
import {
  Accordion,
  ActionIcon,
  Button,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getChatTheme } from "../ui/chatTheme";
import {
  listProviders,
  listConversations,
  createConversation,
  getConversation,
  addMessage,
  complete,
  type LlmProvider,
  type Conversation,
  type Message,
} from "../lib/chatApi";

type ChatPageProps = {
  palette: any;
  API_BASE: string;
};

export default function ChatPage({ palette, API_BASE }: ChatPageProps) {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Composer state
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatTheme = getChatTheme(palette);

  // Load providers and conversations on mount
  useEffect(() => {
    fetchProviders();
    fetchConversations();
  }, [API_BASE]);

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesScrollRef.current) {
      messagesScrollRef.current.scrollTo({
        top: messagesScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Set default provider/model when providers load
  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      const enabledProvider = providers.find((p) => p.enabled);
      if (enabledProvider) {
        setSelectedProviderId(enabledProvider.id);
        const enabledModel = enabledProvider.models.find((m) => m.enabled);
        if (enabledModel) {
          setSelectedModelId(enabledModel.id);
        }
      }
    }
  }, [providers]);

  // Update model options when provider changes
  useEffect(() => {
    if (selectedProviderId) {
      const provider = providers.find((p) => p.id === selectedProviderId);
      if (provider) {
        const enabledModel = provider.models.find((m) => m.enabled);
        if (enabledModel) {
          setSelectedModelId(enabledModel.id);
        } else {
          setSelectedModelId(null);
        }
      }
    }
  }, [selectedProviderId, providers]);

  const fetchProviders = async () => {
    try {
      const data = await listProviders(API_BASE);
      setProviders(data);
    } catch (err: any) {
      console.error("Error loading providers", err);
      setError(err?.message || "Failed to load providers");
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listConversations(API_BASE);
      setConversations(data);
    } catch (err: any) {
      console.error("Error loading conversations", err);
      setError(err?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (id: string) => {
    try {
      const conv = await getConversation(API_BASE, id);
      setMessages(conv.messages || []);
    } catch (err: any) {
      console.error("Error loading conversation messages", err);
      setError(err?.message || "Failed to load messages");
    }
  };

  const handleNewConversation = async () => {
    try {
      setError(null);
      const conv = await createConversation(API_BASE, {});
      setConversations([conv, ...conversations]);
      setSelectedConversation(conv);
      setMessages([]);
      setSuccessMessage("Conversation created");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error creating conversation", err);
      setError(err?.message || "Failed to create conversation");
    }
  };

  const handleSend = async () => {
    if (!messageContent.trim() || !selectedProviderId || !selectedModelId) return;

    try {
      setSending(true);
      setError(null);

      // Create conversation if needed
      let currentConversation = selectedConversation;
      if (!currentConversation) {
        currentConversation = await createConversation(API_BASE, {});
        setConversations([currentConversation, ...conversations]);
        setSelectedConversation(currentConversation);
        setSuccessMessage("Conversation created");
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      // Add user message
      const userMessage = await addMessage(API_BASE, currentConversation.id, {
        role: "user",
        content: messageContent.trim(),
        providerId: selectedProviderId,
        modelName: selectedModelId,
      });

      // Update messages optimistically
      setMessages((prev) => [...prev, userMessage]);

      // Generate assistant response
      const assistantMessage = await complete(API_BASE, currentConversation.id, {
        providerId: selectedProviderId,
        modelName: selectedModelId,
        message: messageContent.trim(),
        systemPrompt: systemPrompt.trim() || undefined,
      });

      // Add assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      // Clear input
      setMessageContent("");
      setSuccessMessage("Message sent");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh conversation to get latest state
      await fetchConversationMessages(currentConversation.id);
      await fetchConversations();
    } catch (err: any) {
      console.error("Error sending message", err);
      setError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  // Get available models for selected provider
  const availableModels = selectedProviderId
    ? providers.find((p) => p.id === selectedProviderId)?.models.filter((m) => m.enabled) || []
    : [];

  const providerOptions = providers
    .filter((p) => p.enabled)
    .map((p) => ({
      value: p.id,
      label: p.name,
    }));

  const modelOptions = availableModels.map((m) => ({
    value: m.id,
    label: m.label || m.name,
  }));

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Chat"
        subtitle="Switch models without losing context"
        palette={palette}
      />

      {successMessage && (
        <Text size="sm" c="green" style={{ padding: "0.5rem" }}>
          {successMessage}
        </Text>
      )}

      {error && (
        <Text size="sm" c="red" style={{ padding: "0.5rem" }}>
          {error}
        </Text>
      )}

      <Grid gutter="md">
        {/* Left Column: Conversations */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              height: "calc(100vh - 250px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack gap="md" style={{ flex: 1, overflow: "hidden" }}>
              <Group justify="space-between">
                <Text fw={600} size="md" c={palette.text}>
                  Conversations
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<Icons.Refresh size={14} />}
                    onClick={fetchConversations}
                    styles={{
                      root: { color: palette.text },
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    size="xs"
                    leftSection={<Icons.Add size={14} />}
                    onClick={handleNewConversation}
                    styles={{
                      root: {
                        backgroundColor: palette.accent,
                        color: palette.background,
                      },
                    }}
                  >
                    New
                  </Button>
                </Group>
              </Group>

              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="xs">
                  {loading ? (
                    <Text size="sm" c={palette.textMuted || palette.textSoft}>
                      Loading...
                    </Text>
                  ) : conversations.length === 0 ? (
                    <Text size="sm" c={palette.textMuted || palette.textSoft} style={{ fontStyle: "italic" }}>
                      No conversations yet
                    </Text>
                  ) : (
                    conversations.map((conv) => (
                      <Paper
                        key={conv.id}
                        p="sm"
                        radius="md"
                        style={{
                          backgroundColor:
                            selectedConversation?.id === conv.id
                              ? palette.accentSoft || palette.surface
                              : palette.background,
                          border: `1px solid ${palette.border}`,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <Text size="sm" fw={500} c={palette.text} lineClamp={1}>
                          {conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                        </Text>
                        <Text size="xs" c={palette.textMuted || palette.textSoft}>
                          {formatDate(conv.updatedAt)}
                        </Text>
                      </Paper>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Right Column: Chat */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              height: "calc(100vh - 250px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!selectedConversation ? (
              <Stack align="center" justify="center" style={{ flex: 1 }}>
                <Text size="sm" c={palette.textMuted || palette.textSoft} style={{ fontStyle: "italic" }}>
                  Select or create a conversation to begin.
                </Text>
              </Stack>
            ) : (
              <Stack gap="md" style={{ flex: 1, overflow: "hidden" }}>
                {/* Messages Area */}
                <ScrollArea
                  ref={messagesScrollRef}
                  style={{ flex: 1, minHeight: "420px" }}
                >
                  <Stack gap="md" p="xs">
                    {messages.length === 0 ? (
                      <Text size="sm" c={chatTheme.textSoft} style={{ fontStyle: "italic" }}>
                        No messages yet. Send a message to start the conversation.
                      </Text>
                    ) : (
                      messages.map((message, index) => {
                        const isUser = message.role === "user";
                        const isSystem = message.role === "system";
                        const isAssistant = message.role === "assistant";
                        const showDivider = index > 0;
                        
                        return (
                          <React.Fragment key={message.id}>
                            {showDivider && (
                              <div
                                style={{
                                  height: "1px",
                                  backgroundColor: chatTheme.divider,
                                  opacity: 0.3,
                                  margin: "0.5rem 0",
                                }}
                              />
                            )}
                            <Paper
                              p="md"
                              radius="md"
                              shadow="xs"
                              style={{
                                backgroundColor: isUser
                                  ? chatTheme.userBubbleBg
                                  : isSystem
                                  ? "transparent"
                                  : chatTheme.assistantBubbleBg,
                                border: isSystem
                                  ? `1px dashed ${chatTheme.border}`
                                  : `1px solid ${chatTheme.border}`,
                                alignSelf: isUser ? "flex-end" : "flex-start",
                                maxWidth: "900px",
                                minWidth: "200px",
                                width: "fit-content",
                                padding: "16px",
                                lineHeight: 1.6,
                                color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                              }}
                            >
                              <Stack gap="xs">
                                <Group gap="xs" align="center" justify="space-between" wrap="nowrap">
                                  <Group gap="xs" align="center" style={{ flex: 1 }}>
                                    <Text size="xs" c={chatTheme.textSoft} fw={500}>
                                      {isUser ? "You" : isAssistant ? "Assistant" : message.role}
                                    </Text>
                                    {message.providerId && message.modelName && (
                                      <Text size="xs" c={chatTheme.textSoft}>
                                        {message.providerId}:{message.modelName}
                                      </Text>
                                    )}
                                    {message.createdAt && (
                                      <Text size="xs" c={chatTheme.textSoft}>
                                        {formatDate(message.createdAt)}
                                      </Text>
                                    )}
                                  </Group>
                                  {isAssistant && (
                                    <Tooltip label={copiedId === message.id ? "Copied!" : "Copy message"}>
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        onClick={() => handleCopy(message.content, message.id)}
                                        style={{
                                          color: chatTheme.textSoft,
                                        }}
                                      >
                                        <Icons.Copy size={14} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                </Group>
                                <div
                                  style={{
                                    color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                    fontSize: "0.9375rem",
                                    lineHeight: 1.6,
                                    fontFamily: "var(--font-sans)",
                                  }}
                                >
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children, ...props }) => (
                                      <p
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          marginTop: "0.5rem",
                                          marginBottom: "0.5rem",
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {children}
                                      </p>
                                    ),
                                    h1: ({ children, ...props }) => (
                                      <h1
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          fontSize: "1.5rem",
                                          fontWeight: 700,
                                          marginTop: "1rem",
                                          marginBottom: "0.75rem",
                                          lineHeight: 1.3,
                                        }}
                                      >
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children, ...props }) => (
                                      <h2
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          fontSize: "1.25rem",
                                          fontWeight: 600,
                                          marginTop: "0.875rem",
                                          marginBottom: "0.625rem",
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children, ...props }) => (
                                      <h3
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          fontSize: "1.125rem",
                                          fontWeight: 600,
                                          marginTop: "0.75rem",
                                          marginBottom: "0.5rem",
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {children}
                                      </h3>
                                    ),
                                    code: ({ children, className, ...props }) => {
                                      const isInline = !className;
                                      if (isInline) {
                                        return (
                                          <code
                                            {...props}
                                            style={{
                                              fontFamily: "var(--font-mono)",
                                              backgroundColor: chatTheme.codeBg,
                                              color: chatTheme.codeText,
                                              border: `1px solid ${chatTheme.border}`,
                                              padding: "2px 6px",
                                              borderRadius: "3px",
                                              fontSize: "0.875em",
                                            }}
                                          >
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <code
                                          {...props}
                                          className={className}
                                          style={{
                                            fontFamily: "var(--font-mono)",
                                            backgroundColor: chatTheme.codeBg,
                                            border: `1px solid ${chatTheme.border}`,
                                            color: chatTheme.codeText,
                                            padding: "12px",
                                            borderRadius: "4px",
                                            display: "block",
                                            overflowX: "auto",
                                            fontSize: "0.875em",
                                            lineHeight: 1.5,
                                            marginTop: "0.75rem",
                                            marginBottom: "0.75rem",
                                          }}
                                        >
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children, ...props }) => (
                                      <pre
                                        {...props}
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                          backgroundColor: chatTheme.codeBg,
                                          border: `1px solid ${chatTheme.border}`,
                                          color: chatTheme.codeText,
                                          padding: "12px",
                                          borderRadius: "4px",
                                          overflowX: "auto",
                                          fontSize: "0.875em",
                                          lineHeight: 1.5,
                                          marginTop: "0.75rem",
                                          marginBottom: "0.75rem",
                                        }}
                                      >
                                        {children}
                                      </pre>
                                    ),
                                    ul: ({ children, ...props }) => (
                                      <ul
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          marginTop: "0.5rem",
                                          marginBottom: "0.5rem",
                                          paddingLeft: "1.5rem",
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children, ...props }) => (
                                      <ol
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          marginTop: "0.5rem",
                                          marginBottom: "0.5rem",
                                          paddingLeft: "1.5rem",
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children, ...props }) => (
                                      <li
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          marginTop: "0.25rem",
                                          marginBottom: "0.25rem",
                                        }}
                                      >
                                        {children}
                                      </li>
                                    ),
                                    a: ({ children, ...props }) => (
                                      <a
                                        {...props}
                                        style={{
                                          color: palette.accent || chatTheme.text,
                                          textDecoration: "underline",
                                        }}
                                      >
                                        {children}
                                      </a>
                                    ),
                                    blockquote: ({ children, ...props }) => (
                                      <blockquote
                                        {...props}
                                        style={{
                                          color: chatTheme.textSoft,
                                          borderLeft: `3px solid ${chatTheme.border}`,
                                          paddingLeft: "1rem",
                                          marginTop: "0.5rem",
                                          marginBottom: "0.5rem",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {children}
                                      </blockquote>
                                    ),
                                    strong: ({ children, ...props }) => (
                                      <strong
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children, ...props }) => (
                                      <em
                                        {...props}
                                        style={{
                                          color: isUser ? chatTheme.userBubbleText : chatTheme.assistantBubbleText,
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {children}
                                      </em>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </Stack>
                          </Paper>
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                </ScrollArea>

                {/* Composer Area */}
                <Stack gap="md">
                  <Group gap="md" align="flex-end">
                    <Select
                      label="Provider"
                      placeholder="Select provider"
                      value={selectedProviderId}
                      onChange={setSelectedProviderId}
                      data={providerOptions}
                      style={{ flex: 1 }}
                      disabled={sending}
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
                      value={selectedModelId}
                      onChange={setSelectedModelId}
                      data={modelOptions}
                      disabled={!selectedProviderId || sending}
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
                  </Group>

                  <Accordion
                    styles={{
                      label: { color: palette.text },
                      content: { backgroundColor: palette.background },
                    }}
                  >
                    <Accordion.Item value="system-prompt">
                      <Accordion.Control>
                        <Text size="sm" c={palette.text}>
                          System Prompt (optional)
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Textarea
                          placeholder="Enter system prompt..."
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          minRows={2}
                          disabled={sending}
                          styles={{
                            input: {
                              backgroundColor: palette.background,
                              color: palette.text,
                              borderColor: palette.border,
                              fontFamily: "var(--font-mono)",
                            },
                          }}
                        />
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>

                  <Group gap="md" align="flex-end">
                    <Textarea
                      placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={sending || !selectedProviderId || !selectedModelId}
                      minRows={3}
                      autosize
                      style={{ flex: 1 }}
                      styles={{
                        input: {
                          backgroundColor: palette.background,
                          color: palette.text,
                          borderColor: palette.border,
                          fontFamily: "var(--font-mono)",
                          minHeight: "120px",
                        },
                      }}
                    />
                    <Button
                      leftSection={<Icons.Send size={16} />}
                      onClick={handleSend}
                      disabled={
                        !messageContent.trim() ||
                        !selectedProviderId ||
                        !selectedModelId ||
                        sending
                      }
                      loading={sending}
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
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
