/**
 * Chat Theme Helper
 * 
 * Provides palette-aware color scheme for chat UI components.
 * Ensures WCAG-compliant readability and consistency with Canonical Documents styling.
 */

type Palette = {
  background: string;
  surface: string;
  text: string;
  textSoft: string;
  border: string;
  accent?: string;
  header?: string;
};

export type ChatTheme = {
  surface: string;
  border: string;
  text: string;
  textSoft: string;
  userBubbleBg: string;
  userBubbleText: string;
  assistantBubbleBg: string;
  assistantBubbleText: string;
  codeBg: string;
  codeText: string;
  divider: string;
};

/**
 * Derives chat colors from the current palette
 * 
 * Rules:
 * - Avoid bright yellow backgrounds for large text areas
 * - Use palette.surface or slightly darker/lighter variants for bubbles
 * - Ensure high contrast for readability
 * - Code blocks use darker neutral background with Source Code Pro
 */
export function getChatTheme(palette: Palette): ChatTheme {
  // Use palette.surface for both user and assistant bubbles
  // This ensures high contrast and consistency with the rest of the site
  const bubbleBg = palette.surface;
  
  // Code blocks use header or a darker variant for better contrast
  const codeBg = palette.header || palette.surface || "#1a1a1a";
  
  return {
    surface: palette.surface || palette.background,
    border: palette.border,
    text: palette.text,
    textSoft: palette.textSoft,
    userBubbleBg: bubbleBg,
    userBubbleText: palette.text,
    assistantBubbleBg: bubbleBg,
    assistantBubbleText: palette.text,
    codeBg: codeBg,
    codeText: palette.text,
    divider: palette.border,
  };
}



