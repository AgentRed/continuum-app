import React, { useMemo } from "react";
import GlossaryTerm from "./GlossaryTerm";
import { GLOSSARY_DEFINITIONS } from "../content/glossary";

type GlossaryTextWrapperProps = {
  text: string;
  palette?: any;
};

/**
 * Wraps glossary terms in text with GlossaryTerm components.
 * Uses whole-word matching, case-insensitive, preserves original casing.
 * Matches longest terms first to handle overlapping terms.
 */
export default function GlossaryTextWrapper({
  text,
  palette,
}: GlossaryTextWrapperProps) {
  // Memoize the regex pattern for all glossary terms, sorted by length (longest first)
  const termPattern = useMemo(() => {
    const terms = Object.keys(GLOSSARY_DEFINITIONS);
    // Sort by length descending to match longest terms first
    const sortedTerms = terms.sort((a, b) => b.length - a.length);
    // Escape special regex characters and create word boundary pattern
    const escapedTerms = sortedTerms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    // Create regex with word boundaries, case-insensitive
    return new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");
  }, []);

  // Split text and wrap matches
  const parts = useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    // Reset regex (global flag requires reset)
    termPattern.lastIndex = 0;

    while ((match = termPattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore) {
          result.push(
            <React.Fragment key={`text-${keyCounter++}`}>{textBefore}</React.Fragment>
          );
        }
      }

      // Find the original term key (case-insensitive)
      const matchedText = match[0];
      const termKey = Object.keys(GLOSSARY_DEFINITIONS).find(
        (key) => key.toLowerCase() === matchedText.toLowerCase()
      ) as keyof typeof GLOSSARY_DEFINITIONS | undefined;

      if (termKey) {
        // Wrap with GlossaryTerm, preserving original casing
        result.push(
          <GlossaryTerm key={`term-${keyCounter++}`} term={termKey} palette={palette}>
            {matchedText}
          </GlossaryTerm>
        );
      } else {
        // Fallback if key not found
        result.push(
          <React.Fragment key={`fallback-${keyCounter++}`}>{matchedText}</React.Fragment>
        );
      }

      lastIndex = termPattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        result.push(
          <React.Fragment key={`text-${keyCounter++}`}>{remainingText}</React.Fragment>
        );
      }
    }

    return result.length > 0 ? result : [text];
  }, [text, termPattern, palette]);

  return <>{parts}</>;
}
