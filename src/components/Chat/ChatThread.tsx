import React, { useEffect, useRef, useState } from "react";
import { Stack, Paper, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../lib/chatApi";
import { getChatTheme } from "../../ui/chatTheme";
import { Icons } from "../../ui/icons";

type ChatThreadProps = {
  messages: Message[];
  palette: any;
};

export default function ChatThread({ messages, palette }: ChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const theme = getChatTheme(palette);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Filter out system messages
  const visibleMessages = messages.filter((m) => m.role !== "system");

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
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

  return (
    <Stack gap="md" style={{ width: "100%", maxWidth: "100%", padding: "1rem" }}>
      {visibleMessages.length === 0 ? (
        <Text size="sm" c={theme.textSoft} style={{ fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
          No messages yet. Start a conversation!
        </Text>
      ) : (
        visibleMessages.map((message, index) => {
          const isUser = message.role === "user";
          const isAssistant = message.role === "assistant";
          const showDivider = index > 0;
          
          return (
            <React.Fragment key={message.id}>
              {showDivider && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: theme.divider,
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
                  backgroundColor: isUser ? theme.userBubbleBg : theme.assistantBubbleBg,
                  border: `1px solid ${theme.border}`,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "900px",
                  minWidth: "200px",
                  width: "fit-content",
                  padding: "16px",
                  lineHeight: 1.6,
                  color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
                  position: "relative",
                }}
              >
                <Stack gap="xs">
                  {/* Header with role, timestamp, and copy button */}
                  <Group gap="xs" align="center" justify="space-between" wrap="nowrap">
                    <Group gap="xs" align="center" style={{ flex: 1 }}>
                      <Text size="xs" c={theme.textSoft} fw={500}>
                        {isUser ? "You" : "Assistant"}
                      </Text>
                      {message.createdAt && (
                        <Text size="xs" c={theme.textSoft}>
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
                            color: theme.textSoft,
                          }}
                        >
                          <Icons.Copy size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>

                  {/* Message content */}
                  <div
                    style={{
                      color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Headings
                        h1: ({ children, ...props }) => (
                          <h1
                            {...props}
                            style={{
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
                        // Paragraphs
                        p: ({ children, ...props }) => (
                          <p
                            {...props}
                            style={{
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
                              marginTop: "0.5rem",
                              marginBottom: "0.5rem",
                              lineHeight: 1.6,
                            }}
                          >
                            {children}
                          </p>
                        ),
                        // Links
                        a: ({ children, ...props }) => (
                          <a
                            {...props}
                            style={{
                              color: palette.accent || theme.text,
                              textDecoration: "underline",
                            }}
                          >
                            {children}
                          </a>
                        ),
                        // Lists
                        ul: ({ children, ...props }) => (
                          <ul
                            {...props}
                            style={{
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
                              marginTop: "0.25rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {children}
                          </li>
                        ),
                        // Blockquotes
                        blockquote: ({ children, ...props }) => (
                          <blockquote
                            {...props}
                            style={{
                              color: theme.textSoft,
                              borderLeft: `3px solid ${theme.border}`,
                              paddingLeft: "1rem",
                              marginTop: "0.5rem",
                              marginBottom: "0.5rem",
                              fontStyle: "italic",
                            }}
                          >
                            {children}
                          </blockquote>
                        ),
                        // Inline code
                        code: ({ children, className, ...props }) => {
                          const isInline = !className;
                          if (isInline) {
                            return (
                              <code
                                {...props}
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  backgroundColor: theme.codeBg,
                                  color: theme.codeText,
                                  border: `1px solid ${theme.border}`,
                                  padding: "2px 6px",
                                  borderRadius: "3px",
                                  fontSize: "0.875em",
                                }}
                              >
                                {children}
                              </code>
                            );
                          }
                          // Code block
                          return (
                            <code
                              {...props}
                              className={className}
                              style={{
                                fontFamily: "var(--font-mono)",
                                backgroundColor: theme.codeBg,
                                border: `1px solid ${theme.border}`,
                                color: theme.codeText,
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
                        // Code blocks (pre wrapper)
                        pre: ({ children, ...props }) => (
                          <pre
                            {...props}
                            style={{
                              fontFamily: "var(--font-mono)",
                              backgroundColor: theme.codeBg,
                              border: `1px solid ${theme.border}`,
                              color: theme.codeText,
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
                        // Strong/Bold
                        strong: ({ children, ...props }) => (
                          <strong
                            {...props}
                            style={{
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
                              fontWeight: 700,
                            }}
                          >
                            {children}
                          </strong>
                        ),
                        // Emphasis/Italic
                        em: ({ children, ...props }) => (
                          <em
                            {...props}
                            style={{
                              color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
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
  );
}
