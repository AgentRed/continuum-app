export type AuditSeverity = "OK" | "WARN" | "FAIL";
export type AuditEntityType = "DOCUMENT" | "CANONICAL_DOCUMENT" | "PROPOSAL" | string;

export type AuditSummary = {
  total: number;
  ok: number;
  warn: number;
  fail: number;
};

export type AuditItem = {
  entityType: AuditEntityType;
  id: string;
  key?: string;
  title?: string;
  contentLength: number;
  isEmpty: boolean;
  markdownScore: number;
  severity: AuditSeverity;
  reasons: string[];
  updatedAt: string;
};

export type AuditResponse = {
  summary: AuditSummary;
  items: AuditItem[];
};

export async function fetchAuditContent(API_BASE: string): Promise<AuditResponse> {
  const res = await fetch(`${API_BASE}/api/audit/content`);
  
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  
  return res.json();
}

// Legacy export for backward compatibility
export type ContentAuditResponse = AuditResponse;
export async function getContentAudit(API_BASE: string): Promise<ContentAuditResponse> {
  return fetchAuditContent(API_BASE);
}

export async function getContentAuditReport(API_BASE: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/audit/content/report.md`);
  
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  
  return res.text();
}

