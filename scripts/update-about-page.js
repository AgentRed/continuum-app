/**
 * Script to update the continuum-about.md canonical document
 * 
 * Usage: node scripts/update-about-page.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = process.env.API_BASE || 'http://localhost:8080';

const aboutContent = `# About Continuum

Continuum is a system that builds systems. It turns organizational knowledge into governed software, creating platforms that understand their own purpose, constraints, and context.

## Continuum and Nucleus

Continuum is the first Nucleus platform, and the proving ground for Nucleus tools and ideals. Nucleus is broader—a venture studio and operating system for building aligned intelligence systems. Continuum is the platform substrate and governance framework that makes the "aligned intelligence layer" real.

Where Nucleus provides the vision and infrastructure for building bespoke platforms, Continuum demonstrates how that vision works in practice. Every feature, every decision, and every constraint in Continuum is tested against real organizational needs. What works in Continuum becomes part of the Nucleus toolkit. What fails teaches us how to build better systems.

## Current State vs North Star

### Current State

Continuum today provides:

- **Governed Workspaces**: Organizational boundaries where knowledge is scoped and controlled
- **Canonical Documents**: Official knowledge that requires approval to change
- **Proposals**: Governance workflow for making changes to canonical documents
- **Surfaces**: User interfaces built within workspaces
- **Deterministic Workflows**: Processes that operate within documented constraints
- **Nodes**: Active cores that execute programs and manage integrations
- **Documents**: Knowledge artifacts that live within nodes and workspaces

### North Star

Continuum's trajectory is toward building bespoke platforms that replace fragmented SaaS and stateless LLM usage by:

- **Grounding Intelligence in Canon**: AI operates on official, approved knowledge, not guesses
- **Scoping to Context**: Systems understand their domain, constraints, and priorities
- **Stack Awareness**: Intelligence knows what APIs, databases, and services are available
- **Compounding Value**: Every interaction builds on previous ones, creating systems that become more valuable over time
- **Replacing SaaS Categories**: Instead of subscribing to generic tools, organizations build purpose-built systems
- **Ownership**: Organizations own their intelligence layer, not rent it

## Core Hierarchy

### Owner

An Owner represents an organization or entity that uses Continuum. Owners contain Workspaces and provide the top-level boundary for governance and access control.

### Workspace

A Workspace is a domain or function within an Owner. Each workspace contains:
- Documents (governed and ungoverned)
- Nodes (active cores)
- Canonical documents (system-level knowledge)
- Proposals (change workflow)

Workspaces provide the context boundary. Intelligence within a workspace understands that workspace's domain, constraints, and priorities.

### Node

A Node is an active core within a Workspace. Nodes:
- Execute programs
- Manage integrations
- Contain documents
- Operate within workspace constraints

Nodes are the execution layer. They turn governed knowledge into running systems.

## Primitives

### Canonical Documents

Canonical documents represent official knowledge. They are:
- **Governed**: Changes require approval through proposals
- **Versioned**: History is tracked
- **Referenced**: The system knows which documents are canonical
- **Trusted**: AI references canonical versions, not drafts

### Proposals

Proposals are the governance mechanism for changing canonical documents. They:
- Require review and approval
- Track changes explicitly
- Encode decisions as system changes
- Ensure knowledge remains accurate and aligned

### Documents

Documents are knowledge artifacts within nodes and workspaces. They can be:
- **Governed**: Part of the canonical knowledge base
- **Ungoverned**: Working documents, drafts, or temporary knowledge

### Surfaces

Surfaces are user interfaces built within workspaces. They:
- Understand workspace context
- Reference canonical documents
- Operate within workspace constraints
- Provide access to workspace knowledge and capabilities

## How Continuum Works

1. **Knowledge Becomes Canon**: Documents are created, reviewed, and approved as canonical knowledge
2. **Canon Guides Intelligence**: AI references canonical documents to answer questions and guide actions
3. **Decisions Become Proposals**: Changes to canonical knowledge go through proposal workflow
4. **Proposals Become Canon**: Approved proposals update canonical documents
5. **Systems Build on Canon**: Workspaces, nodes, and surfaces operate within canonical constraints
6. **Intelligence Compounds**: Every interaction builds on previous knowledge, creating systems that become more valuable over time

## What Makes Continuum Different

- **Canon-Driven**: Intelligence operates on official knowledge, not general patterns
- **Context-Aware**: Systems understand their domain, constraints, and priorities
- **Stack-Aware**: Intelligence knows what's possible within the technical infrastructure
- **Governed**: Changes require approval, ensuring knowledge remains trustworthy
- **Bespoke**: Systems are built for specific organizations, not market averages
- **Compounding**: Value increases with use, rather than resetting each session

## Continuum as Nucleus Platform

Continuum serves as both a product and a proving ground. Every feature we build, every constraint we enforce, and every decision we make is tested against real organizational needs. What works becomes part of the Nucleus toolkit. What fails teaches us how to build better systems.

This creates a feedback loop: Continuum demonstrates what's possible, Nucleus provides the infrastructure to build it, and together they create a foundation for aligned intelligence systems.

## What This Means for Organizations

Organizations using Continuum are not just adopting a tool. They are building an intelligence layer that:
- Understands their business
- Operates within their constraints
- Compounds in value over time
- Replaces fragmented SaaS with unified platforms
- Owns their knowledge instead of renting it

This is not about faster answers or better chatbots. It is about better systems—systems that are built for your organization, not adapted to fit generic tools.
`;

async function updateAboutDocument() {
  try {
    console.log('Updating continuum-about.md...');
    console.log(`API Base: ${API_BASE}\n`);

    // First, get all canonical documents to find the about document
    const listRes = await fetch(`${API_BASE}/api/canonical-documents`);
    if (!listRes.ok) {
      throw new Error(`Failed to list documents: ${listRes.status}`);
    }
    const documents = await listRes.json();
    
    const aboutDoc = documents.find((doc) => doc.key === 'continuum-about.md');
    
    if (!aboutDoc) {
      console.log('About document not found. Creating new document...');
      
      // Try to create it
      const createRes = await fetch(`${API_BASE}/api/canonical-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'continuum-about.md',
          title: 'About Continuum',
          content: aboutContent,
          governed: false,
        }),
      });

      if (createRes.ok) {
        const data = await createRes.json();
        console.log(`✓ Created continuum-about.md (ID: ${data.id})`);
        return;
      } else if (createRes.status === 404 || createRes.status === 405) {
        // Try creating as a regular document first
        const docRes = await fetch(`${API_BASE}/api/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'continuum-about.md',
            title: 'About Continuum',
            content: aboutContent,
          }),
        });

        if (docRes.ok) {
          const docData = await docRes.json();
          console.log(`  Created document, making it canonical...`);
          
          const canonicalRes = await fetch(`${API_BASE}/api/documents/${docData.id}/canonical`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ canonical: true }),
          });

          if (canonicalRes.ok) {
            console.log(`✓ Created and made canonical continuum-about.md`);
            return;
          } else {
            throw new Error(`Failed to make canonical: ${canonicalRes.status}`);
          }
        } else {
          const errorText = await docRes.text();
          throw new Error(`Failed to create document: ${docRes.status} ${errorText}`);
        }
      } else {
        const errorText = await createRes.text();
        throw new Error(`Failed to create: ${createRes.status} ${errorText}`);
      }
    }

    // Update existing document
    console.log(`Found existing document (ID: ${aboutDoc.id}), updating...`);
    const updateRes = await fetch(`${API_BASE}/api/canonical-documents/${aboutDoc.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'About Continuum',
        content: aboutContent,
      }),
    });

    if (updateRes.ok) {
      console.log(`✓ Updated continuum-about.md`);
    } else {
      const errorText = await updateRes.text();
      throw new Error(`Failed to update: ${updateRes.status} ${errorText}`);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateAboutDocument().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});





