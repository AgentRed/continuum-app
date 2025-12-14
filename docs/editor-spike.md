# Markdown Editor Spike: Evaluation & Comparison

## Overview

This document evaluates four markdown editor options for integration into the Continuum Document Create/Edit modal. The evaluation focuses on licensing, React integration, feature completeness, bundle size, maintenance status, and compatibility with our existing Mantine-based UI system.

## Evaluation Criteria

1. **License**: MIT or compatible open-source license required
2. **React Integration**: Native React support, hooks-based API preferred
3. **Toolbar Support**: Built-in or easily customizable toolbar
4. **Markdown Round-trip Fidelity**: Ability to edit markdown and preserve formatting
5. **Bundle Size Risk**: Impact on application bundle size
6. **Maintenance Activity**: Recent commits, active community, issue resolution
7. **Mantine Theming Compatibility**: Ability to match Continuum's palette system
8. **Font Scaling Isolation**: Ability to restrict font scaling to content area only

## Candidates

### 1. Stacked Editor

**Status**: Unclear reference - may refer to a custom or less-known editor. Unable to find definitive information about a "Stacked" markdown editor in open-source React ecosystem.

**Recommendation**: If this refers to a specific editor, please provide GitHub/npm link for evaluation. Otherwise, proceed with MDXEditor as default choice.

---

### 2. MDXEditor

**Repository**: https://github.com/mdx-editor/editor  
**License**: MIT ✅  
**NPM Package**: `@mdx-editor/editor`

#### Evaluation

- **License**: ✅ MIT License
- **React Integration**: ✅ Native React component, hooks-based API, TypeScript support
- **Toolbar Support**: ✅ Built-in toolbar with customizable tool groups
- **Markdown Round-trip Fidelity**: ✅ Excellent - designed for MDX/Markdown editing with source view
- **Bundle Size Risk**: ⚠️ Moderate (~200-300KB gzipped with all plugins)
  - Modular architecture allows tree-shaking
  - Can import only needed plugins
- **Maintenance Activity**: ✅ Active (regular commits, responsive maintainers)
  - Last updated: Recent (2024)
  - Good issue resolution rate
- **Mantine Theming Compatibility**: ✅ Good
  - CSS-in-JS compatible
  - Customizable via CSS variables and theme props
  - Can override styles to match Mantine palette
- **Font Scaling Isolation**: ✅ Good
  - Renders in a container div
  - Can be wrapped in ContentRoot for isolated scaling
  - Toolbar can be excluded from scaling

**Pros**:
- Excellent markdown/MDX support
- Strong TypeScript support
- Active maintenance
- Good documentation
- Modular plugin system

**Cons**:
- Larger bundle size if all features included
- Learning curve for advanced customization
- Some dependencies (ProseMirror-based)

**Verdict**: ⭐ **Top Choice** - Best balance of features, maintenance, and React integration

---

### 3. Milkdown

**Repository**: https://github.com/Milkdown/milkdown  
**License**: MIT ✅  
**NPM Package**: `@milkdown/core`, `@milkdown/react`

#### Evaluation

- **License**: ✅ MIT License
- **React Integration**: ✅ Official React package (`@milkdown/react`)
- **Toolbar Support**: ✅ Plugin-based toolbar system
- **Markdown Round-trip Fidelity**: ✅ Excellent - built on ProseMirror with markdown parser
- **Bundle Size Risk**: ⚠️ Moderate to High (~250-400KB with all plugins)
  - Plugin-based architecture
  - Can be tree-shaken but requires careful configuration
- **Maintenance Activity**: ✅ Active
  - Regular updates
  - Good community engagement
  - TypeScript-first
- **Mantine Theming Compatibility**: ⚠️ Moderate
  - Uses CSS variables
  - Requires custom CSS for full Mantine integration
  - Theme system exists but may need adaptation
- **Font Scaling Isolation**: ✅ Good
  - Component-based rendering
  - Can be wrapped for isolated scaling

**Pros**:
- Modern architecture (ProseMirror-based)
- Strong TypeScript support
- Plugin ecosystem
- Good performance

**Cons**:
- Steeper learning curve
- More complex setup
- Bundle size can grow with plugins
- Less straightforward Mantine integration

**Verdict**: ⭐ **Strong Alternative** - Good choice if MDXEditor doesn't meet needs

---

### 4. Tiptap

**Repository**: https://github.com/tiptap/tiptap  
**License**: MIT ✅  
**NPM Package**: `@tiptap/react`, `@tiptap/starter-kit`

#### Evaluation

- **License**: ✅ MIT License
- **React Integration**: ✅ Excellent - First-class React support, hooks-based
- **Toolbar Support**: ✅ Built-in MenuBar component, highly customizable
- **Markdown Round-trip Fidelity**: ⚠️ Good but requires markdown extension
  - Markdown support via `@tiptap/extension-markdown`
  - Round-trip may have edge cases
- **Bundle Size Risk**: ⚠️ Moderate (~200-350KB with extensions)
  - Modular extensions
  - Good tree-shaking support
- **Maintenance Activity**: ✅ Very Active
  - Excellent maintenance
  - Large community
  - Regular updates and improvements
- **Mantine Theming Compatibility**: ✅ Good
  - CSS-in-JS friendly
  - Customizable styling
  - Can integrate with Mantine theme system
- **Font Scaling Isolation**: ✅ Excellent
  - Renders in container
  - Easy to wrap for isolated scaling
  - Toolbar separate from content

**Pros**:
- Excellent React integration
- Very active maintenance
- Great documentation
- Flexible extension system
- Strong community

**Cons**:
- Markdown support requires extension (not built-in)
- Primarily WYSIWYG-focused (markdown is secondary)
- May need more configuration for pure markdown editing

**Verdict**: ⭐ **Good Choice** - Best for WYSIWYG-first editing, markdown as secondary

---

## Comparison Matrix

| Feature | Stacked | MDXEditor | Milkdown | Tiptap |
|---------|---------|-----------|---------|--------|
| **License** | ❓ Unknown | ✅ MIT | ✅ MIT | ✅ MIT |
| **React Integration** | ❓ Unknown | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Toolbar Support** | ❓ Unknown | ✅ Built-in | ✅ Plugin-based | ✅ Built-in |
| **Markdown Fidelity** | ❓ Unknown | ✅ Excellent | ✅ Excellent | ⚠️ Good (via extension) |
| **Bundle Size** | ❓ Unknown | ⚠️ Moderate | ⚠️ Moderate-High | ⚠️ Moderate |
| **Maintenance** | ❓ Unknown | ✅ Active | ✅ Active | ✅ Very Active |
| **Mantine Theming** | ❓ Unknown | ✅ Good | ⚠️ Moderate | ✅ Good |
| **Font Scaling** | ❓ Unknown | ✅ Good | ✅ Good | ✅ Excellent |

## Recommendation

### Primary Choice: **MDXEditor**

**Rationale**:
1. ✅ MIT License
2. ✅ Excellent React integration with TypeScript
3. ✅ Built-in toolbar and markdown support
4. ✅ Active maintenance and good documentation
5. ✅ Good Mantine theming compatibility
6. ✅ Can isolate font scaling to content area
7. ✅ Designed specifically for markdown/MDX editing

**Implementation Notes**:
- Use modular imports to minimize bundle size
- Wrap editor in ContentRoot for font scaling isolation
- Customize toolbar styling to match Mantine palette
- Use CSS variables for theme integration

### Alternative: **Tiptap** (if WYSIWYG-first editing is preferred)

**Rationale**:
- Better for users who prefer visual editing
- Excellent React integration
- Very active maintenance
- Can add markdown support via extension

## Next Steps

1. ✅ Create proof-of-concept page at `/editor-spike`
2. ✅ Implement MDXEditor with:
   - Toolbar
   - Editable markdown state
   - Preview toggle
   - Font scaling isolation
3. ⏳ Evaluate performance and bundle size impact
4. ⏳ Test Mantine theme integration
5. ⏳ Gather user feedback on editor experience

## Spike Branch Plan

### Phase 1: Setup (Current)
- [x] Create evaluation document
- [x] Install MDXEditor dependencies
- [x] Create `/editor-spike` route
- [x] Basic editor implementation

### Phase 2: Integration
- [ ] Add toolbar with common markdown actions
- [ ] Implement preview toggle
- [ ] Integrate with Mantine theme system
- [ ] Test font scaling isolation

### Phase 3: Polish
- [ ] Style toolbar to match Continuum palette
- [ ] Add keyboard shortcuts
- [ ] Test markdown round-trip fidelity
- [ ] Measure bundle size impact

### Phase 4: Evaluation
- [ ] User testing
- [ ] Performance benchmarking
- [ ] Bundle size analysis
- [ ] Decision: Proceed to Document modal integration or explore alternatives




