import React, { useEffect, useState, useRef } from "react";
import { Stack, Paper, Textarea, Button, Group, Text } from "@mantine/core";
import { Icons } from "../ui/icons";
import PageHeaderCard from "../ui/PageHeaderCard";
import ChatThread from "../components/Chat/ChatThread";
import ProviderSelector from "../components/Chat/ProviderSelector";
import {
  listConversations,
  createConversation,
  getConversation,
  postMessage,
  generate,
  type Message,
  type ConversationWithMessages,
} from "../lib/chatApi";

type SystemChatPageProps = {
  palette: any;
  API_BASE: string;
};

export default function SystemChatPage({ palette, API_BASE }: SystemChatPageProps) {
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load conversation if we have one
    if (conversation?.id) {
      loadConversation(conversation.id);
    }
  }, [conversation?.id]);

  const loadConversation = async (id: string) => {
    try {
      const conv = await getConversation(API_BASE, id);
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (err: any) {
      console.error("Error loading conversation", err);
      setError(err?.message || "Failed to load conversation");
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userContent = inputValue.trim();
    setInputValue("");
    setError(null);

    try {
      setSending(true);

      // Create conversation if needed
      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await createConversation(API_BASE, {});
        setConversation(currentConversation);
      }

      // Post user message
      const userMessage = await postMessage(API_BASE, currentConversation.id, {
        role: "user",
        content: userContent,
      });

      // Update messages optimistically
      setMessages((prev) => [...prev, userMessage]);

      // Generate assistant response
      const assistantMessage = await generate(API_BASE, currentConversation.id, {
        providerId: selectedProviderId || undefined,
      });

      // Add assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      // Reload conversation to get latest state
      await loadConversation(currentConversation.id);
    } catch (err: any) {
      console.error("Error sending message", err);
      setError(err?.message || "Failed to send message");
      // Restore input on error
      setInputValue(userContent);
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

  return (
    <Stack gap="md">
      <PageHeaderCard
        title="Continuum Chat"
        subtitle="Chat with Continuum"
        palette={palette}
        right={
          <ProviderSelector
            API_BASE={API_BASE}
            palette={palette}
            selectedProviderId={selectedProviderId || undefined}
            onProviderChange={setSelectedProviderId}
            conversationId={conversation?.id}
          />
        }
      />

      <Paper
        shadow="sm"
        p="md"
        radius="md"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          minHeight: "400px",
          maxHeight: "calc(100vh - 300px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="md" style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChatThread messages={messages} palette={palette} />
          </div>

          {error && (
            <Text size="sm" c="red" style={{ padding: "0.5rem" }}>
              {error}
            </Text>
          )}

          <Group gap="md" align="flex-end">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              minRows={2}
              autosize
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
              leftSection={<Icons.Send size={16} />}
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
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
      </Paper>
    </Stack>
  );
}


