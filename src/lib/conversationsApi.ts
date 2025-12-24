/**
 * Conversations API
 * 
 * Handles communication with continuum-core /api/conversations endpoints
 */

export interface Conversation {
  id: string;
  title?: string;
  provider?: string;
  modelKey?: string;
  activeProvider?: string;
  activeModelKey?: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface CreateConversationRequest {
  title?: string;
  provider: "OPENAI" | "ANTHROPIC" | "GOOGLE";
  modelKey: string;
}

export interface UpdateConversationRequest {
  title?: string;
  activeProvider?: string;
  activeModelKey?: string;
}

/**
 * List all conversations
 */
export async function listConversations(API_BASE: string): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/api/conversations`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list conversations: ${response.status} ${errorText}`);
  }
  return response.json();
}

/**
 * Create a new conversation
 */
export async function createConversation(
  API_BASE: string,
  data: CreateConversationRequest
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create conversation: ${response.status} ${errorText}`);
  }
  return response.json();
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(
  API_BASE: string,
  id: string
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/api/conversations/${id}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get conversation: ${response.status} ${errorText}`);
  }
  return response.json();
}

/**
 * Update a conversation (partial update)
 */
export async function updateConversation(
  API_BASE: string,
  id: string,
  patch: UpdateConversationRequest
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/api/conversations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update conversation: ${response.status} ${errorText}`);
  }
  return response.json();
}
