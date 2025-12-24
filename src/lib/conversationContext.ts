/**
 * Conversation Context Preservation
 * 
 * This module defines the architecture for maintaining conversation context
 * across model switches and provider changes. The key design principle is that
 * conversation context MUST be model-agnostic and provider-agnostic.
 * 
 * Architecture Benefits:
 * - Context preservation: Switching models doesn't lose conversation history
 * - Provider flexibility: Conversations can span multiple providers seamlessly
 * - Task-specific routing: Different messages can use different models without
 *   fragmenting the conversation
 * - Future-proof: New providers and models can be integrated without breaking
 *   existing conversations
 * 
 * Design Constraints:
 * 1. ConversationContext is decoupled from any specific LLM provider
 * 2. Messages store model metadata but don't depend on provider-specific formats
 * 3. Tool invocations are abstracted from provider-specific implementations
 * 4. Model invocations track which model was used but preserve full context
 * 
 * Future Use Cases:
 * - Route math questions to Gemini while keeping conversation context
 * - Switch to Claude for prose editing without losing prior context
 * - Use GPT for code generation while maintaining full conversation history
 * - Mix providers within a single conversation based on task requirements
 */

import { type LLMModel } from "./llmModels";

/**
 * A single message in a conversation
 * 
 * Messages are provider-agnostic and store only the essential information
 * needed to reconstruct the conversation context. The actual model used
 * is tracked via ModelInvocation, but the message content itself is
 * independent of any provider-specific format.
 */
export interface Message {
  /** Unique identifier for this message */
  id: string;
  /** Role of the message sender */
  role: "system" | "user" | "assistant" | "tool";
  /** Message content (text, markdown, etc.) */
  content: string;
  /** Timestamp when message was created */
  createdAt: string;
  /** Optional model metadata (which model generated this, if applicable) */
  modelInvocation?: ModelInvocation;
  /** Optional tool invocations associated with this message */
  toolInvocations?: ToolInvocation[];
}

/**
 * Tool invocation within a conversation
 * 
 * Represents a function call or tool use that occurred during the conversation.
 * This abstraction allows Continuum to track tool usage without coupling to
 * provider-specific function calling formats.
 */
export interface ToolInvocation {
  /** Unique identifier for this tool invocation */
  id: string;
  /** Name of the tool/function that was invoked */
  toolName: string;
  /** Arguments passed to the tool (provider-agnostic format) */
  arguments: Record<string, unknown>;
  /** Result returned by the tool */
  result?: unknown;
  /** Timestamp when tool was invoked */
  invokedAt: string;
  /** Timestamp when tool completed (if applicable) */
  completedAt?: string;
  /** Whether the tool invocation was successful */
  success: boolean;
  /** Error message if invocation failed */
  error?: string;
}

/**
 * Model invocation metadata
 * 
 * Tracks which model was used to generate a message, along with any
 * provider-specific metadata. This allows Continuum to:
 * - Track model usage for analytics and optimization
 * - Replay conversations with the same models if needed
 * - Understand which models work best for different tasks
 * - Maintain full audit trail of model selections
 */
export interface ModelInvocation {
  /** Model that was used (reference to LLMModel from registry) */
  model: LLMModel;
  /** Provider-specific model identifier (may differ from registry ID) */
  providerModelId?: string;
  /** Timestamp when model was invoked */
  invokedAt: string;
  /** Optional provider-specific metadata */
  providerMetadata?: Record<string, unknown>;
}

/**
 * Complete conversation context
 * 
 * This is the core abstraction that enables model-agnostic conversation
 * management. The context contains all messages, tool invocations, and
 * model usage history, but is completely decoupled from any specific
 * LLM provider or model implementation.
 * 
 * Key Properties:
 * - Model-agnostic: Can be used with any model from any provider
 * - Provider-agnostic: Conversations can span multiple providers
 * - Complete history: Preserves full context for any model to use
 * - Extensible: New metadata can be added without breaking existing code
 */
export interface ConversationContext {
  /** Unique identifier for this conversation */
  id: string;
  /** Optional title for the conversation */
  title?: string;
  /** All messages in the conversation (chronological order) */
  messages: Message[];
  /** Timestamp when conversation was created */
  createdAt: string;
  /** Timestamp when conversation was last updated */
  updatedAt: string;
  /** Optional metadata about the conversation */
  metadata?: Record<string, unknown>;
}

/**
 * Future Architecture Notes:
 * 
 * 1. Context Serialization:
 *    - ConversationContext can be serialized to JSON for persistence
 *    - This allows conversations to be saved, resumed, and shared
 *    - No provider-specific formats are embedded in serialization
 * 
 * 2. Model Switching:
 *    - When switching models mid-conversation, the full ConversationContext
 *      is provided to the new model
 *    - Models receive context in a standardized format, regardless of which
 *      provider/model generated previous messages
 * 
 * 3. Multi-Provider Conversations:
 *    - A single conversation can use multiple models from different providers
 *    - Each message tracks which model generated it via ModelInvocation
 *    - The conversation context remains unified and coherent
 * 
 * 4. Task-Specific Routing:
 *    - Different messages can be routed to different models based on task
 *    - Example: Math question → Gemini, Prose editing → Claude, Code → GPT
 *    - All messages remain part of the same ConversationContext
 * 
 * 5. Context Compression:
 *    - For very long conversations, context can be summarized or compressed
 *    - Compression maintains semantic meaning while reducing token count
 *    - Compressed context remains model-agnostic
 * 
 * 6. Tool Integration:
 *    - Tool invocations are tracked separately from messages
 *    - This allows tools to be called by any model without format conflicts
 *    - Tool results are stored in a provider-agnostic format
 */










