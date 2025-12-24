/**
 * Whitepapers Registry
 * 
 * Central registry for whitepapers available in the system.
 * Each whitepaper is loaded statically from the content directory.
 */

import continuumWhitepaper from "../content/whitepapers/continuum-whitepaper.md?raw";

export type Whitepaper = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  markdown: string;
};

export const whitepapers: Whitepaper[] = [
  {
    slug: "continuum",
    title: "Continuum Whitepaper",
    description: "A System for Aligned, In-Context Intelligence",
    updatedAt: "2024-12-19T00:00:00Z",
    markdown: continuumWhitepaper,
  },
];

/**
 * Get a whitepaper by slug
 */
export function getWhitepaperBySlug(slug: string): Whitepaper | undefined {
  return whitepapers.find((wp) => wp.slug === slug);
}

/**
 * Get all whitepapers
 */
export function getAllWhitepapers(): Whitepaper[] {
  return whitepapers;
}







