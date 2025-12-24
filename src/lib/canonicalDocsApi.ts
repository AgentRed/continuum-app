/**
 * Canonical Documents API
 * 
 * Utilities for fetching canonical documents from the backend.
 */

export type CanonicalDocument = {
  id: string;
  key: string;
  title?: string;
  governed: boolean;
  createdAt: string;
  updatedAt: string;
  content?: string;
};

/**
 * List all canonical documents
 */
export async function listCanonicalDocuments(
  API_BASE: string
): Promise<CanonicalDocument[]> {
  const res = await fetch(`${API_BASE}/api/canonical-documents`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as CanonicalDocument[];
}

/**
 * Get a canonical document by ID
 */
export async function getCanonicalDocument(
  API_BASE: string,
  id: string
): Promise<CanonicalDocument> {
  const res = await fetch(`${API_BASE}/api/canonical-documents/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Document not found");
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as CanonicalDocument;
}

/**
 * Resolve whitepaper key from version and audience
 */
export function resolveWhitepaperKey(
  version: "A" | "D",
  audience: "General" | "Agent Cru"
): string {
  const audienceSuffix = audience === "Agent Cru" ? "-agent-cru" : "";
  return `continuum-whitepaper-${version.toLowerCase()}${audienceSuffix}.md`;
}

/**
 * Find a canonical document by key with fallback matching
 * 
 * Matching order:
 * 1. Exact match
 * 2. Case-insensitive exact match
 * 3. Key includes the token (case-insensitive)
 */
export function findCanonicalByKey(
  documents: CanonicalDocument[],
  preferredKey: string
): CanonicalDocument | null {
  // 1. Exact match
  const exactMatch = documents.find((doc) => doc.key === preferredKey);
  if (exactMatch) return exactMatch;

  // 2. Case-insensitive exact match
  const lowerPreferred = preferredKey.toLowerCase();
  const caseInsensitiveMatch = documents.find(
    (doc) => doc.key.toLowerCase() === lowerPreferred
  );
  if (caseInsensitiveMatch) return caseInsensitiveMatch;

  // 3. Key includes the token (case-insensitive)
  // Extract the base token (e.g., "continuum-whitepaper-a" from "continuum-whitepaper-a.md")
  const baseToken = preferredKey.replace(/\.md$/i, "").toLowerCase();
  const includesMatch = documents.find((doc) =>
    doc.key.toLowerCase().includes(baseToken)
  );
  if (includesMatch) return includesMatch;

  return null;
}

/**
 * Find a canonical document by key (fetches list, then finds match)
 * 
 * Matching order:
 * 1. Exact match
 * 2. Case-insensitive exact match
 * 3. Key includes the token (case-insensitive)
 * 
 * Returns the document if found, or throws an error with available keys.
 */
export async function findCanonicalDocumentByKey(
  API_BASE: string,
  key: string
): Promise<CanonicalDocument> {
  const documents = await listCanonicalDocuments(API_BASE);
  const matched = findCanonicalByKey(documents, key);
  
  if (!matched) {
    const availableKeys = documents.map((d) => d.key).join(", ");
    console.log("Available canonical document keys:", availableKeys);
    throw new Error(
      `Canonical document not found.\n\nExpected key: ${key}\n\nAvailable keys:\n${documents.map((d) => `- ${d.key}`).join("\n")}`
    );
  }
  
  return matched;
}

