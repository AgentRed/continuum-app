import { describe, it, expect } from "vitest";
import {
  validateCanonIntegrity,
  generateIntegrityReport,
  REQUIRED_CANON_DOCS,
  OPTIONAL_SCAFFOLD_DOC,
  type Document,
} from "./canonIntegrityValidator";

describe("validateCanonIntegrity", () => {
  it("should pass when all required documents are present, governed, and RAG-ready", () => {
    const documents: Document[] = REQUIRED_CANON_DOCS.map((title) => ({
      id: `doc-${title}`,
      title,
      isGovernance: true,
      ragReady: true,
    }));

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(true);
    expect(result.missingDocs).toEqual([]);
    expect(result.wrongGovernance).toEqual([]);
    expect(result.notReadyForRag).toEqual([]);
  });

  it("should fail when a required document is missing", () => {
    const documents: Document[] = REQUIRED_CANON_DOCS.slice(0, 3).map((title) => ({
      id: `doc-${title}`,
      title,
      isGovernance: true,
      ragReady: true,
    }));

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(false);
    expect(result.missingDocs).toContain(REQUIRED_CANON_DOCS[3]);
    expect(result.missingDocs.length).toBe(1);
  });

  it("should fail when a required document is not governed", () => {
    const documents: Document[] = REQUIRED_CANON_DOCS.map((title, index) => ({
      id: `doc-${title}`,
      title,
      isGovernance: index !== 0, // First doc is not governed
      ragReady: true,
    }));

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(false);
    expect(result.wrongGovernance).toHaveLength(1);
    expect(result.wrongGovernance[0].filename).toBe(REQUIRED_CANON_DOCS[0]);
    expect(result.wrongGovernance[0].expected).toBe("GOVERNED");
    expect(result.wrongGovernance[0].actual).toBe("UNGOVERNED");
  });

  it("should fail when a required document is not RAG-ready", () => {
    const documents: Document[] = REQUIRED_CANON_DOCS.map((title, index) => ({
      id: `doc-${title}`,
      title,
      isGovernance: true,
      ragReady: index !== 0, // First doc is not RAG-ready
    }));

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(false);
    expect(result.notReadyForRag).toContain(REQUIRED_CANON_DOCS[0]);
    expect(result.notReadyForRag.length).toBe(1);
  });

  it("should fail when optional scaffold document is governed", () => {
    const documents: Document[] = [
      ...REQUIRED_CANON_DOCS.map((title) => ({
        id: `doc-${title}`,
        title,
        isGovernance: true,
        ragReady: true,
      })),
      {
        id: "doc-scaffold",
        title: OPTIONAL_SCAFFOLD_DOC,
        isGovernance: true, // Should be UNGOVERNED
        ragReady: false,
      },
    ];

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(false);
    expect(result.wrongGovernance).toHaveLength(1);
    expect(result.wrongGovernance[0].filename).toBe(OPTIONAL_SCAFFOLD_DOC);
    expect(result.wrongGovernance[0].expected).toBe("UNGOVERNED");
    expect(result.wrongGovernance[0].actual).toBe("GOVERNED");
  });

  it("should pass when optional scaffold document is ungoverned", () => {
    const documents: Document[] = [
      ...REQUIRED_CANON_DOCS.map((title) => ({
        id: `doc-${title}`,
        title,
        isGovernance: true,
        ragReady: true,
      })),
      {
        id: "doc-scaffold",
        title: OPTIONAL_SCAFFOLD_DOC,
        isGovernance: false, // Correctly ungoverned
        ragReady: false,
      },
    ];

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(true);
    expect(result.wrongGovernance).toEqual([]);
  });

  it("should handle multiple failures", () => {
    const documents: Document[] = [
      {
        id: "doc-1",
        title: REQUIRED_CANON_DOCS[0],
        isGovernance: false, // Wrong governance
        ragReady: false, // Not RAG-ready
      },
      {
        id: "doc-2",
        title: REQUIRED_CANON_DOCS[1],
        isGovernance: true,
        ragReady: true,
      },
      // Missing other required docs
    ];

    const result = validateCanonIntegrity(documents);

    expect(result.passed).toBe(false);
    expect(result.missingDocs.length).toBe(2); // Missing 2 docs
    expect(result.wrongGovernance.length).toBe(1);
    expect(result.notReadyForRag.length).toBe(1);
  });

  it("should handle empty documents array", () => {
    const result = validateCanonIntegrity([]);

    expect(result.passed).toBe(false);
    expect(result.missingDocs.length).toBe(REQUIRED_CANON_DOCS.length);
    expect(result.wrongGovernance).toEqual([]);
    expect(result.notReadyForRag).toEqual([]);
  });
});

describe("generateIntegrityReport", () => {
  it("should generate a report with node name and timestamp", () => {
    const result = {
      passed: true,
      missingDocs: [],
      wrongGovernance: [],
      notReadyForRag: [],
    };

    const timestamp = new Date("2024-01-15T10:30:00Z");
    const report = generateIntegrityReport(result, "Test Node", timestamp);

    expect(report).toContain("CANON INTEGRITY CHECK REPORT");
    expect(report).toContain("Node: Test Node");
    expect(report).toContain("Timestamp: 2024-01-15T10:30:00.000Z");
    expect(report).toContain("Status: PASS");
    expect(report).toContain(
      "All canonical documents are present, properly governed, and ready for RAG."
    );
  });

  it("should include missing documents in report", () => {
    const result = {
      passed: false,
      missingDocs: ["continuum-canon-index.md", "continuum-workspace-initialization-contract.md"],
      wrongGovernance: [],
      notReadyForRag: [],
    };

    const report = generateIntegrityReport(result, "Test Node");

    expect(report).toContain("Status: FAIL");
    expect(report).toContain("MISSING DOCUMENTS:");
    expect(report).toContain("continuum-canon-index.md");
    expect(report).toContain("continuum-workspace-initialization-contract.md");
  });

  it("should include wrong governance status in report", () => {
    const result = {
      passed: false,
      missingDocs: [],
      wrongGovernance: [
        {
          filename: "continuum-canon-index.md",
          expected: "GOVERNED",
          actual: "UNGOVERNED",
        },
      ],
      notReadyForRag: [],
    };

    const report = generateIntegrityReport(result, "Test Node");

    expect(report).toContain("WRONG GOVERNANCE STATUS:");
    expect(report).toContain("continuum-canon-index.md");
    expect(report).toContain("Expected GOVERNED, but is UNGOVERNED");
  });

  it("should include not-ready-for-rag documents in report", () => {
    const result = {
      passed: false,
      missingDocs: [],
      wrongGovernance: [],
      notReadyForRag: ["continuum-analysis-engine-architecture_v1_0.md"],
    };

    const report = generateIntegrityReport(result, "Test Node");

    expect(report).toContain("NOT READY FOR RAG:");
    expect(report).toContain("continuum-analysis-engine-architecture_v1_0.md");
  });

  it("should include all sections when all checks fail", () => {
    const result = {
      passed: false,
      missingDocs: ["doc1.md"],
      wrongGovernance: [
        {
          filename: "doc2.md",
          expected: "GOVERNED",
          actual: "UNGOVERNED",
        },
      ],
      notReadyForRag: ["doc3.md"],
    };

    const report = generateIntegrityReport(result, "Test Node");

    expect(report).toContain("MISSING DOCUMENTS:");
    expect(report).toContain("WRONG GOVERNANCE STATUS:");
    expect(report).toContain("NOT READY FOR RAG:");
    expect(report).not.toContain(
      "All canonical documents are present"
    );
  });
});
