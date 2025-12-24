// Chat API helpers

// ============================================================================
// Types
// ============================================================================

export type LlmProvider = {
  id: string;
  name: string;
  vendor: string;
  enabled: boolean;
  models: LlmModel[];
};

export type LlmModel = {
  id: string;
  name: string;
  label: string;
  enabled: boolean;
};

export type Conversation = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  providerId?: string;
  modelName?: string;
  createdAt: string;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * List all enabled LLM providers
 */
export async function listProviders(API_BASE: string): Promise<LlmProvider[]> {
  const res = await fetch(`${API_BASE}/api/llm/providers`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list providers: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * List all conversations
 */
export async function listConversations(API_BASE: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/chat/conversations`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list conversations: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Create a new conversation
 */
export async function createConversation(
  API_BASE: string,
  data: { title?: string; createdBy?: string }
): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/chat/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create conversation: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Get a conversation by ID with messages
 */
export async function getConversation(API_BASE: string, id: string): Promise<Conversation & { messages: Message[] }> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${id}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get conversation: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  API_BASE: string,
  id: string,
  data: {
    role: "user" | "assistant" | "system";
    content: string;
    providerId?: string;
    modelName?: string;
  }
): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to add message: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Complete a conversation (generate assistant response)
 */
export async function complete(
  API_BASE: string,
  id: string,
  data: {
    providerId: string;
    modelName: string;
    message: string;
    systemPrompt?: string;
  }
): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/chat/conversations/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to complete: ${res.status} ${errorText}`);
  }
  return res.json();
}

// ============================================================================
// Legacy types and functions (kept for backward compatibility)
// ============================================================================

export type ChatProvider = "STUB" | "OPENAI" | "ANTHROPIC" | "GEMINI";
export type ChatMessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  provider?: ChatProvider;
  model?: string;
  createdAt: string;
};
export type ChatSession = {
  id: string;
  tenantId: string;
  title?: string;
  provider: ChatProvider;
  model?: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};
export type CreateChatSessionPayload = {
  tenantId: string;
  title?: string;
  provider: ChatProvider;
  model?: string;
  systemPrompt?: string;
};
export type UpdateChatSessionPayload = {
  title?: string;
  provider?: ChatProvider;
  model?: string;
  systemPrompt?: string;
};
export type SendChatMessagePayload = {
  role: ChatMessageRole;
  content: string;
  provider?: ChatProvider;
  model?: string;
  updateSummary?: boolean;
};
export interface SendChatPayload {
  conversationId?: string;
  provider: "OPENAI" | "ANTHROPIC" | "GOOGLE";
  modelKey: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}
export interface SendChatResponse {
  conversationId: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: string;
  }>;
}
export async function listChatSessions(API_BASE: string, tenantId: string): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/api/chat/sessions?tenantId=${tenantId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to list chat sessions: HTTP ${res.status}`);
  }
  return res.json();
}
export async function createChatSession(API_BASE: string, payload: CreateChatSessionPayload): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create chat session: HTTP ${res.status}`);
  }
  return res.json();
}
export async function getChatSession(API_BASE: string, id: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get chat session: HTTP ${res.status}`);
  }
  return res.json();
}
export async function updateChatSession(API_BASE: string, id: string, payload: UpdateChatSessionPayload): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update chat session: HTTP ${res.status}`);
  }
  return res.json();
}
export async function sendChatMessage(API_BASE: string, sessionId: string, payload: SendChatMessagePayload): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to send chat message: HTTP ${res.status}`);
  }
  return res.json();
}
export async function sendChat(API_BASE: string, payload: SendChatPayload): Promise<SendChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send chat: ${res.status} ${errorText}`);
  }
  return res.json();
}
export interface LLMProvider {
  id: string;
  name: string;
  enabled: boolean;
  defaultModel?: string;
}
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
export async function listConversationsWithWorkspace(API_BASE: string, workspaceId?: string): Promise<Conversation[]> {
  const url = workspaceId ? `${API_BASE}/api/conversations?workspaceId=${workspaceId}` : `${API_BASE}/api/conversations`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list conversations: ${res.status} ${errorText}`);
  }
  return res.json();
}
export async function createConversationWithWorkspace(API_BASE: string, data: { workspaceId?: string; title?: string }): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create conversation: ${res.status} ${errorText}`);
  }
  return res.json();
}
export async function getConversationWithMessages(API_BASE: string, id: string): Promise<ConversationWithMessages> {
  const res = await fetch(`${API_BASE}/api/conversations/${id}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get conversation: ${res.status} ${errorText}`);
  }
  return res.json();
}
export async function postMessage(API_BASE: string, conversationId: string, data: { role: "user"; content: string }): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to post message: ${res.status} ${errorText}`);
  }
  return res.json();
}
export async function generate(API_BASE: string, conversationId: string, options?: { providerId?: string; temperature?: number }): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options || {}),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to generate response: ${res.status} ${errorText}`);
  }
  return res.json();
}
