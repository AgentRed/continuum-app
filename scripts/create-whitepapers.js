/**
 * Script to create whitepaper canonical documents in continuum-core
 * 
 * Usage: node scripts/create-whitepapers.js
 * 
 * This script reads whitepaper markdown files and creates them as canonical documents
 * via the continuum-core API.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = process.env.API_BASE || 'http://localhost:8080';

// Note: We only have 2 source files:
// - continuum-whitepaper_A_general.md (General audience)
// - continuum-whitepaper_D_agent-cru.md (Agent Cru audience)
// 
// For now, we'll use:
// - A + General -> continuum-whitepaper_A_general.md
// - D + General -> continuum-whitepaper_A_general.md (same as A for now)
// - A + Agent Cru -> continuum-whitepaper_D_agent-cru.md (using Agent Cru version)
// - D + Agent Cru -> continuum-whitepaper_D_agent-cru.md

const whitepapers = [
  {
    key: 'continuum-whitepaper-a.md',
    title: 'Continuum Whitepaper (Version A, General)',
    file: join(__dirname, '../src/content/whitepapers/continuum-whitepaper_A_general.md'),
  },
  {
    key: 'continuum-whitepaper-d.md',
    title: 'Continuum Whitepaper (Version D, General)',
    file: join(__dirname, '../src/content/whitepapers/continuum-whitepaper_A_general.md'),
  },
  {
    key: 'continuum-whitepaper-a-agent-cru.md',
    title: 'Continuum Whitepaper (Version A, Agent Cru)',
    file: join(__dirname, '../src/content/whitepapers/continuum-whitepaper_D_agent-cru.md'),
  },
  {
    key: 'continuum-whitepaper-d-agent-cru.md',
    title: 'Continuum Whitepaper (Version D, Agent Cru)',
    file: join(__dirname, '../src/content/whitepapers/continuum-whitepaper_D_agent-cru.md'),
  },
];

async function createCanonicalDocument(key, title, content) {
  try {
    // First, try to check if document already exists
    const listRes = await fetch(`${API_BASE}/api/canonical-documents`);
    if (listRes.ok) {
      const documents = await listRes.json();
      const existing = documents.find(doc => doc.key === key);
      if (existing) {
        console.log(`✓ Document ${key} already exists (ID: ${existing.id})`);
        // Update it
        const updateRes = await fetch(`${API_BASE}/api/canonical-documents/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
          }),
        });
        if (updateRes.ok) {
          console.log(`  Updated content for ${key}`);
          return existing.id;
        } else {
          const errorText = await updateRes.text();
          throw new Error(`Failed to update: ${updateRes.status} ${errorText}`);
        }
      }
    }

    // Try to create new document
    // Check if there's a POST endpoint
    const createRes = await fetch(`${API_BASE}/api/canonical-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        title,
        content,
        governed: false,
      }),
    });

    if (createRes.ok) {
      const data = await createRes.json();
      console.log(`✓ Created ${key} (ID: ${data.id})`);
      return data.id;
    } else if (createRes.status === 404 || createRes.status === 405) {
      // POST endpoint doesn't exist, try creating via documents endpoint
      console.log(`  POST to /api/canonical-documents not available, trying alternative...`);
      
      // Try creating as a regular document first, then making it canonical
      const docRes = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          title,
          content,
        }),
      });

      if (docRes.ok) {
        const docData = await docRes.json();
        console.log(`  Created document ${key} (ID: ${docData.id}), making it canonical...`);
        
        // Make it canonical
        const canonicalRes = await fetch(`${API_BASE}/api/documents/${docData.id}/canonical`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ canonical: true }),
        });

        if (canonicalRes.ok) {
          console.log(`✓ Made ${key} canonical`);
          return docData.id;
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
  } catch (error) {
    console.error(`✗ Error creating ${key}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log(`Creating whitepaper canonical documents...`);
  console.log(`API Base: ${API_BASE}\n`);

  const results = [];

  for (const wp of whitepapers) {
    try {
      const content = readFileSync(wp.file, 'utf-8');
      const id = await createCanonicalDocument(wp.key, wp.title, content);
      results.push({ key: wp.key, success: true, id });
    } catch (error) {
      console.error(`Failed to process ${wp.key}:`, error.message);
      results.push({ key: wp.key, success: false, error: error.message });
    }
    console.log('');
  }

  console.log('\n=== Summary ===');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✓ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`  - ${r.key} (ID: ${r.id})`));

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`  - ${r.key}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n✓ All whitepaper documents created successfully!');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

