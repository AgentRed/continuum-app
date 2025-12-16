import { describe, it, expect } from "vitest";
import {
  parseYamlFrontmatter,
  extractGovernanceFromFrontmatter,
} from "./yamlFrontmatter";

describe("parseYamlFrontmatter", () => {
  it("should parse YAML frontmatter with governance field", () => {
    const content = `---
governance: governed
title: Test Document
---
# Content here
This is the body.`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter.governance).toBe("governed");
    expect(result.frontmatter.title).toBe("Test Document");
    expect(result.content).toBe("# Content here\nThis is the body.");
  });

  it("should return empty frontmatter if no frontmatter exists", () => {
    const content = "# No frontmatter\nJust content here.";

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter).toEqual({});
    expect(result.content).toBe(content);
  });

  it("should handle boolean values", () => {
    const content = `---
governance: governed
published: true
draft: false
---
Content`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter.governance).toBe("governed");
    expect(result.frontmatter.published).toBe(true);
    expect(result.frontmatter.draft).toBe(false);
  });

  it("should handle quoted strings", () => {
    const content = `---
governance: "governed"
title: 'Test Title'
---
Content`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter.governance).toBe("governed");
    expect(result.frontmatter.title).toBe("Test Title");
  });
});

describe("extractGovernanceFromFrontmatter", () => {
  it("should return true for governance: governed", () => {
    const content = `---
governance: governed
---
Content`;

    expect(extractGovernanceFromFrontmatter(content)).toBe(true);
  });

  it("should return true for governance: GOVERNED (case-insensitive)", () => {
    const content = `---
governance: GOVERNED
---
Content`;

    expect(extractGovernanceFromFrontmatter(content)).toBe(true);
  });

  it("should return false for governance: draft", () => {
    const content = `---
governance: draft
---
Content`;

    expect(extractGovernanceFromFrontmatter(content)).toBe(false);
  });

  it("should return false when governance field is missing", () => {
    const content = `---
title: Test
---
Content`;

    expect(extractGovernanceFromFrontmatter(content)).toBe(false);
  });

  it("should return false when no frontmatter exists", () => {
    const content = "# Just content\nNo frontmatter here.";

    expect(extractGovernanceFromFrontmatter(content)).toBe(false);
  });

  it("should return true for governance: true (boolean)", () => {
    const content = `---
governance: true
---
Content`;

    expect(extractGovernanceFromFrontmatter(content)).toBe(true);
  });
});
