#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '../src');

let fixedCount = 0;

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has the problematic pattern
  if (!content.includes('import {') || !content.includes("import logger from '@/lib/logger';")) {
    return;
  }

  const lines = content.split('\n');
  const newLines = [];
  let loggerLine = null;
  let inBrokenImport = false;
  let brokenImportBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Capture logger import line
    if (line === "import logger from '@/lib/logger';") {
      loggerLine = line;
      continue; // Skip this line for now
    }

    // Detect broken import pattern
    if (line === 'import {') {
      inBrokenImport = true;

      // Insert logger import BEFORE the import {
      if (loggerLine) {
        newLines.push(loggerLine);
        loggerLine = null;
      }

      newLines.push(line);
      continue;
    }

    newLines.push(line);
  }

  // If we captured a logger line but didn't use it, add it back
  if (loggerLine) {
    // Find first import and insert before it
    for (let i = 0; i < newLines.length; i++) {
      if (newLines[i].startsWith('import ')) {
        newLines.splice(i, 0, loggerLine);
        break;
      }
    }
  }

  const newContent = newLines.join('\n');

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed: ${path.relative(srcDir, filePath)}`);
    fixedCount++;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Fixing bad logger imports...\n');
walkDir(srcDir);
console.log(`\n✅ Fixed ${fixedCount} files`);
