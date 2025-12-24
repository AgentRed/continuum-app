# UI Design Consistency Audit

**Date:** 2024  
**Scope:** All pages in continuum-app  
**Goal:** Identify inconsistencies and establish design system patterns

## Summary

The app uses Mantine components consistently, but there are several areas where styling patterns diverge, particularly around color usage, card layouts, and state patterns (loading/error/empty).

---

## Layout

### Findings

- **Header Card Pattern:**
  - ✅ CanonicalDocumentsPage, ProposalsPage: Consistent header card with title + subtitle in Stack
  - ❌ DocumentsPage: Header card has button on right (inconsistent)
  - ❌ WorkspacesPage: Header card has button on right (inconsistent)
  - ❌ AboutPage, GlossaryPage: No header card pattern, uses different Paper layout

- **Page Width:**
  - ✅ Most pages: Use Container size="xl" via App.tsx routing
  - ❌ AboutPage, GlossaryPage: Use hardcoded `maxWidth: "900px"` and `margin: "0 auto"` inside Paper
  - ❌ OverviewPage: Uses SimpleGrid without Container constraints

- **Padding:**
  - ✅ Most pages: Consistent `p="md"` on Paper cards
  - ❌ AboutPage, GlossaryPage: Use `p="xl"` (inconsistent)

---

## Typography

### Findings

- **Font Families:**
  - ✅ Consistent use of CSS variables (`var(--font-mono)`, `var(--font-serif)`)
  - ✅ DocumentViewer uses palette-based text colors

- **Heading Sizes:**
  - ✅ Most pages: `size="lg"` for page titles, `fw={600}` or `fw={700}`
  - ❌ GlossaryPage: Uses `size="2rem"` (hardcoded) instead of Mantine size prop
  - ❌ AboutPage: Uses `size="xl"` for title (inconsistent with others)

- **Text Colors:**
  - ✅ Most pages: Use `c={palette.text}` and `c={palette.textSoft}`
  - ❌ AboutPage, GlossaryPage: Hardcoded colors (`#0f172a`, `#334155`, `#64748b`)
  - ❌ NodesPage: Hardcoded `c="#ffffff"` in multiple places
  - ❌ Tables: Many use hardcoded `color: "#ffffff"` instead of `palette.text`

---

## Color Usage

### Findings

- **Background Colors:**
  - ✅ Most pages: Use `palette.surface` for Paper cards
  - ❌ AboutPage, GlossaryPage: Use hardcoded `backgroundColor: "#ffffff"` (light theme, breaks dark theme)
  - ❌ AboutPage, GlossaryPage: Use hardcoded `border: "1px solid #e2e8f0"` (light border)

- **Text Colors:**
  - ✅ Most pages: Use palette.text and palette.textSoft
  - ❌ AboutPage, GlossaryPage: Hardcoded text colors throughout
  - ❌ Tables: Hardcoded `#ffffff` in many places instead of palette.text

- **Table Header Colors:**
  - ✅ CanonicalDocumentsPage, ProposalsPage: Use `palette.header` with `color: "#ffffff"` (should use palette.text)
  - ❌ GlossaryPage Governance Matrix: Uses hardcoded `#f8fafc` background and `#0f172a` text (light theme)

---

## Card + Table Styling

### Findings

- **Card Styling:**
  - ✅ Consistent: `shadow="sm"`, `p="md"`, `radius="md"`, `backgroundColor: palette.surface`, `border: 1px solid ${palette.border}`
  - ❌ AboutPage, GlossaryPage: Different padding (`p="xl"`), different background/border colors

- **Table Styling:**
  - ✅ CanonicalDocumentsPage, ProposalsPage, DocumentsPage: Consistent table styles with borders, hover states
  - ❌ WorkspacesPage, NodesPage: Different table styles (no consistent border patterns, different hover)
  - ❌ GlossaryPage Governance Matrix: Completely different light theme table styling
  - ❌ Hardcoded `#ffffff` for table text in many places instead of palette.text

- **Hover States:**
  - ✅ CanonicalDocumentsPage, ProposalsPage: `backgroundColor: "rgba(59, 130, 246, 0.1) !important"`
  - ❌ WorkspacesPage: Uses `highlightOnHover` prop (different pattern)
  - ❌ NodesPage: Uses hardcoded hover color

---

## Empty/Loading/Error Patterns

### Findings

- **Loading States:**
  - ✅ Most pages: `<Group gap="xs"><Loader size="sm" /><Text size="sm" c={palette.textSoft}>Loading...</Text></Group>`
  - ❌ AboutPage, GlossaryPage: Use hardcoded colors in loading state
  - ❌ OverviewPage: Uses different loading pattern in summary cards

- **Error States:**
  - ✅ Most pages: `<Text size="sm" c="red.3">{error}</Text>`
  - ❌ AboutPage, GlossaryPage: Use Alert component with hardcoded styling
  - ⚠️ Inconsistent: Some use Alert, some use Text

- **Empty States:**
  - ✅ Most pages: `<Text size="sm" c={palette.textSoft}>No items found.</Text>`
  - ✅ Consistent pattern across list pages

---

## Controls

### Findings

- **Button Placement:**
  - ✅ Most pages: Buttons in header area, right-aligned
  - ⚠️ Inconsistent: Some pages have buttons in header card, some don't

- **Icon Usage:**
  - ✅ Consistent: All use Tabler icons with `size={16}` or `size={18}`
  - ✅ Consistent: Icons used in `leftSection` prop

- **Spacing:**
  - ✅ Consistent: `gap="md"` for Stack, `gap="xs"` for Groups
  - ✅ Consistent: Button groups use `gap="xs"`

---

## Quick Wins

1. **Replace hardcoded colors with palette:**
   - AboutPage, GlossaryPage: Replace `#ffffff`, `#e2e8f0`, `#0f172a`, etc. with palette values
   - Tables: Replace `#ffffff` with `palette.text`
   - NodesPage: Replace hardcoded `#ffffff` with palette.text

2. **Standardize header cards:**
   - Create reusable `PageHeaderCard` component
   - Update all pages to use it

3. **Standardize table styles:**
   - Create `getTableStyles(palette)` utility
   - Replace ad-hoc table styling with utility

4. **Standardize loading/error/empty states:**
   - Create reusable components: `LoadingRow`, `ErrorState`, `EmptyState`
   - Update all pages to use them

5. **Fix AboutPage and GlossaryPage:**
   - Remove hardcoded white backgrounds
   - Use palette-based colors
   - Remove Container wrapper (handled by App.tsx)

---

## Non-Goals

- ❌ Do NOT redesign the UI (keep existing visual style)
- ❌ Do NOT change routing or data flow
- ❌ Do NOT introduce new dependencies
- ❌ Do NOT change product behavior
- ❌ Do NOT touch backend code
- ❌ Do NOT change document editing workflows

---

## Recommended Design System Components

1. **PageHeaderCard** - Standard header card with title, subtitle, optional right content
2. **ContentCard** - Standard Paper wrapper with consistent styling
3. **StatusBadge** - Centralized badge color mapping
4. **LoadingRow** - Consistent loading state
5. **ErrorState** - Consistent error state
6. **EmptyState** - Consistent empty state
7. **getTableStyles** - Utility function for table styling

---

## Priority

**High Priority:**
- Fix AboutPage and GlossaryPage hardcoded colors (breaks dark theme)
- Standardize table text colors (remove `#ffffff` hardcoding)
- Create reusable components for consistency

**Medium Priority:**
- Standardize header card pattern
- Standardize loading/error/empty states

**Low Priority:**
- Minor typography inconsistencies
- Button placement variations (if functional)


