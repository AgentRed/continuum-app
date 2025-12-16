export type Document = {
  id: string;
  title: string;
  isGovernance?: boolean;
  ragReady?: boolean;
};

export type IntegrityCheckResult = {
  passed: boolean;
  missingDocs: string[];
  wrongGovernance: Array<{ filename: string; expected: string; actual: string }>;
  notReadyForRag: string[];
};

export const REQUIRED_CANON_DOCS = [
  "continuum-canon-index.md",
  "continuum-workspace-initialization-contract.md",
  "continuum-workspace-initialization-protocol_v1_0.md",
  "continuum-analysis-engine-architecture_v1_0.md",
];

export const OPTIONAL_SCAFFOLD_DOC = "Workspace-Canon-Template.md";

export function validateCanonIntegrity(
  documents: Document[]
): IntegrityCheckResult {
  const docMap = new Map<string, Document>();
  documents.forEach((doc) => {
    docMap.set(doc.title, doc);
  });

  const missingDocs: string[] = [];
  const wrongGovernance: Array<{ filename: string; expected: string; actual: string }> = [];
  const notReadyForRag: string[] = [];

  for (const requiredDoc of REQUIRED_CANON_DOCS) {
    const doc = docMap.get(requiredDoc);
    if (!doc) {
      missingDocs.push(requiredDoc);
      continue;
    }

    if (!doc.isGovernance) {
      wrongGovernance.push({
        filename: requiredDoc,
        expected: "GOVERNED",
        actual: "UNGOVERNED",
      });
    }

    if (!doc.ragReady) {
      notReadyForRag.push(requiredDoc);
    }
  }

  const scaffoldDoc = docMap.get(OPTIONAL_SCAFFOLD_DOC);
  if (scaffoldDoc) {
    if (scaffoldDoc.isGovernance) {
      wrongGovernance.push({
        filename: OPTIONAL_SCAFFOLD_DOC,
        expected: "UNGOVERNED",
        actual: "GOVERNED",
      });
    }
  }

  const passed =
    missingDocs.length === 0 &&
    wrongGovernance.length === 0 &&
    notReadyForRag.length === 0;

  return {
    passed,
    missingDocs,
    wrongGovernance,
    notReadyForRag,
  };
}

export function generateIntegrityReport(
  result: IntegrityCheckResult,
  nodeName: string,
  timestamp: Date = new Date()
): string {
  const lines: string[] = [];
  lines.push("CANON INTEGRITY CHECK REPORT");
  lines.push("=".repeat(50));
  lines.push("");
  lines.push(`Node: ${nodeName}`);
  lines.push(`Timestamp: ${timestamp.toISOString()}`);
  lines.push(`Status: ${result.passed ? "PASS" : "FAIL"}`);
  lines.push("");

  if (result.missingDocs.length > 0) {
    lines.push("MISSING DOCUMENTS:");
    result.missingDocs.forEach((doc) => {
      lines.push(`  - ${doc}`);
    });
    lines.push("");
  }

  if (result.wrongGovernance.length > 0) {
    lines.push("WRONG GOVERNANCE STATUS:");
    result.wrongGovernance.forEach((item) => {
      lines.push(`  - ${item.filename}: Expected ${item.expected}, but is ${item.actual}`);
    });
    lines.push("");
  }

  if (result.notReadyForRag.length > 0) {
    lines.push("NOT READY FOR RAG:");
    result.notReadyForRag.forEach((doc) => {
      lines.push(`  - ${doc}`);
    });
    lines.push("");
  }

  if (result.passed) {
    lines.push("All canonical documents are present, properly governed, and ready for RAG.");
  }

  return lines.join("\n");
}
