# Continuum Glossary (v1)

## What Continuum Is
Continuum is a system for organizing, navigating, and operating your environments, knowledge, and build programs and artifacts, including APIs, MCP servers, and RAG-ready documents. It gives you a consistent structure, a UI surface, and a set of governed rules so the platform can evolve without drifting, breaking, or silently rewriting your intent.

## Core nouns

### Continuum
The overall platform, meaning the whole system, including the data model, API, UI surfaces, documents, and governance.

### Core API (continuum-core)
The backend service that exposes Continuum data (Workspaces, Nodes, etc.) over HTTP endpoints. It is where the database, Prisma, and Express live.

### App (continuum-app)
The frontend UI that renders Continuum surfaces. It talks to the Core API and lets you browse and operate on the Continuum structure.

### Workspace
A top-level organizational container in Continuum. A Workspace groups Nodes that belong together. In your current phase, Workspaces represent major areas you want to manage and build within.

### Node
A functional domain inside a Workspace. Nodes are the units you browse into and eventually attach programs, documents, integrations, MCP servers, and RAG sources to.

### Document
A piece of content stored and governed inside Continuum. Documents can also be used as RAG sources. Documents should have stable identity and traceable lineage.

### Program
A defined build or operational unit inside a Node, for example a workflow, an automation, an agent instruction set, a generator, a build plan, or a runbook.

### Module
A reusable component used by Programs, for example a template, a prompt module, a schema fragment, a validation rule, or a connector wrapper.

### Integration
A connection to an external system, for example GitHub, Slite, Google Drive, Slack, n8n, Railway, or any API.

### MCP server
A tool server that exposes capabilities to an LLM client via the Model Context Protocol. In Continuum, MCP servers are treated as build artifacts that can be created, versioned, and governed.

### RAG
Retrieval Augmented Generation, meaning the system can pull from a curated knowledge store to answer questions with higher accuracy and continuity.

### Knowledge store
A collection of documents and sources that are indexed for retrieval. A knowledge store can be used for RAG, validation, or governance checks.

### Surface
A UI screen that expresses one navigational slice of Continuum, for example Workspace Browser, Node Explorer, Document Console, Program Runner.

## Multi-tenant note (current phase)
Continuum is not multi-tenant right now. The data model may still use the word "tenant" in places, but operationally there is one owner environment (you), with optional collaborators. A future phase may introduce true multi-tenant semantics, but v1 is single-owner, governed collaboration.

## Automatic vs governed updates

### Automatic update
A change executed by the system without requiring explicit human approval at the moment of change, because it is:
- deterministic
- non-destructive
- reversible
- fully logged
- constrained by pre-approved rules

Examples:
- recomputing derived indexes for search
- refreshing RAG embeddings for documents that have not changed meaning
- updating counts, cache entries, or read models
- reformatting documents using a fixed, approved formatter

### Governed update
A change that requires explicit approval (you, or an authorized collaborator) before it becomes canonical, because it:
- changes meaning, structure, or hierarchy
- deletes or overwrites canonical content
- modifies governance rules, schemas, or identity boundaries
- has potential cross-workspace impact

Examples:
- renaming Workspaces or Nodes that affect navigation semantics
- changing canonical hierarchy rules
- altering schemas, roles, permissions, or ownership boundaries
- rewriting documents that serve as governance or canon

## Governance matrix (v1)

| Asset / Change Type | Allowed Automatically? | Approval Required? | Logging Required? | Notes |
|---|---:|---:|---:|---|
| UI theme / palette switching | Yes | No | No | Local UI preference, not canon |
| Derived counts (node counts, document counts) | Yes | No | Yes | Log as telemetry, not canon |
| Search index rebuild | Yes | No | Yes | Deterministic, reversible |
| RAG embedding refresh (no text change) | Yes | No | Yes | Must not alter source content |
| Create Workspace / Node | Yes | No | Yes | Logged as a creation event |
| Rename Workspace / Node | No | Yes | Yes | Meaning-impacting |
| Delete Workspace / Node | No | Yes | Yes | Destructive |
| Add Document | Yes | No | Yes | Canonical ID must be assigned |
| Edit Document (non-governance) | No | Yes | Yes | Content meaning can change |
| Edit Governance / Canon docs | No | Yes (strict) | Yes | Highest protection tier |
| Schema change / migrations | No | Yes (strict) | Yes | Must be planned and reversible |
| MCP server creation from template | Yes | No | Yes | If templates are pre-approved |
| MCP server capability change | No | Yes | Yes | Can expand system power |

## Practical rule of thumb
If a change affects meaning, boundaries, identity, or deletion, it is governed. If it is derived, reversible, and deterministic, it can be automatic.

