#!/usr/bin/env node

// Navigation Schema Validation Script
// Ensures all navigation nodes have valid actions or children

import { NAV_SCHEMA, flattenNavNodes } from "../src/lib/nav-schema";
import type { NavNode } from "../src/types/nav";

interface ValidationError {
  nodeId: string;
  error: string;
  severity: 'error' | 'warning';
}

function validateNavNode(node: NavNode): ValidationError[] {
  const errors: ValidationError[] = [];

  // Rule 1: Node must have action OR children
  if (!node.action && (!node.children || node.children.length === 0)) {
    errors.push({
      nodeId: node.id,
      error: 'Node has no action and no children',
      severity: 'error'
    });
  }

  // Rule 2: Validate action structure
  if (node.action) {
    switch (node.action.type) {
      case 'route':
        if (!node.action.to || typeof node.action.to !== 'string') {
          errors.push({
            nodeId: node.id,
            error: 'Route action missing valid "to" property',
            severity: 'error'
          });
        }
        break;
      
      case 'modal':
        if (!node.action.id || typeof node.action.id !== 'string') {
          errors.push({
            nodeId: node.id,
            error: 'Modal action missing valid "id" property',
            severity: 'error'
          });
        }
        break;
      
      case 'mutation':
        if (!node.action.key || typeof node.action.key !== 'string') {
          errors.push({
            nodeId: node.id,
            error: 'Mutation action missing valid "key" property',
            severity: 'error'
          });
        }
        break;
      
      case 'external':
        if (!node.action.href || typeof node.action.href !== 'string') {
          errors.push({
            nodeId: node.id,
            error: 'External action missing valid "href" property',
            severity: 'error'
          });
        }
        break;
      
      case 'compose':
        if (!node.action.steps || !Array.isArray(node.action.steps) || node.action.steps.length === 0) {
          errors.push({
            nodeId: node.id,
            error: 'Compose action missing valid "steps" array',
            severity: 'error'
          });
        }
        break;
      
      default:
        errors.push({
          nodeId: node.id,
          error: `Unknown action type: ${(node.action as any).type}`,
          severity: 'error'
        });
    }
  }

  // Rule 3: Check required properties
  if (!node.labelKey) {
    errors.push({
      nodeId: node.id,
      error: 'Node missing required "labelKey" property',
      severity: 'error'
    });
  }

  if (!node.id) {
    errors.push({
      nodeId: 'unknown',
      error: 'Node missing required "id" property',
      severity: 'error'
    });
  }

  // Rule 4: Validate children recursively
  if (node.children) {
    for (const child of node.children) {
      errors.push(...validateNavNode(child));
    }
  }

  // Rule 5: Check for duplicate IDs
  const allNodes = flattenNavNodes();
  const ids = allNodes.map(n => n.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicates.includes(node.id)) {
    errors.push({
      nodeId: node.id,
      error: 'Duplicate node ID detected',
      severity: 'error'
    });
  }

  return errors;
}

function validateNavSchema(): ValidationError[] {
  const allErrors: ValidationError[] = [];
  
  for (const rootNode of NAV_SCHEMA) {
    allErrors.push(...validateNavNode(rootNode));
  }
  
  return allErrors;
}

function main() {
  console.log('🔍 Validating Navigation Schema...\n');
  
  const errors = validateNavSchema();
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  if (criticalErrors.length > 0) {
    console.log('❌ Critical Errors:');
    criticalErrors.forEach(error => {
      console.log(`  • [${error.nodeId}] ${error.error}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => {
      console.log(`  • [${warning.nodeId}] ${warning.error}`);
    });
    console.log('');
  }
  
  if (errors.length === 0) {
    console.log('✅ Navigation Schema Validation Passed');
    console.log(`📊 Stats: ${flattenNavNodes().length} total nodes`);
  } else {
    console.log(`❌ Navigation Schema Validation Failed`);
    console.log(`📊 Stats: ${criticalErrors.length} errors, ${warnings.length} warnings`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateNavSchema, validateNavNode };