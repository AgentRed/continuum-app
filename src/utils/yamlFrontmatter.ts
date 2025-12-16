/**
 * Parses YAML frontmatter from markdown content.
 * Returns the frontmatter object and the content without frontmatter.
 */
export function parseYamlFrontmatter(content: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterText = match[1];
  const bodyContent = match[2];

  // Simple YAML parser for basic key-value pairs
  // This handles simple cases like: key: value
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Convert boolean strings
    if (value.toLowerCase() === "true") {
      frontmatter[key] = true;
    } else if (value.toLowerCase() === "false") {
      frontmatter[key] = false;
    } else {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: bodyContent };
}

/**
 * Extracts governance status from YAML frontmatter.
 * Returns true if frontmatter contains `governance: governed` (case-insensitive).
 */
export function extractGovernanceFromFrontmatter(content: string): boolean {
  const { frontmatter } = parseYamlFrontmatter(content);
  const governanceValue = frontmatter.governance;
  
  if (typeof governanceValue === "string") {
    return governanceValue.toLowerCase() === "governed";
  }
  
  return governanceValue === true;
}
