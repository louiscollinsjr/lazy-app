#!/usr/bin/env node

/**
 * Conditional build script for production
 * This script allows building with or without TinaCMS based on environment
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Determine if we should skip TinaCMS in production
const skipTinaCMS = process.env.SKIP_TINA === 'true';

console.log(`Building for production ${skipTinaCMS ? 'WITHOUT' : 'WITH'} TinaCMS`);

// Set environment variables to avoid Rollup native module issues
process.env.ROLLUP_SKIP_NODEJS = 'true';

try {
  if (skipTinaCMS) {
    // Skip TinaCMS build and just build the SvelteKit app
    console.log('🚀 Building SvelteKit app directly...');
    execSync('ROLLUP_SKIP_NODEJS=true vite build', { stdio: 'inherit' });
  } else {
    // Build with TinaCMS (the normal way)
    console.log('🦙 Building with TinaCMS...');
    execSync('ROLLUP_SKIP_NODEJS=true tinacms build && ROLLUP_SKIP_NODEJS=true vite build', { stdio: 'inherit' });
  }
  
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
