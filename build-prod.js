#!/usr/bin/env node

/**
 * Conditional build script for production
 * This script allows building with or without TinaCMS based on environment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Determine if we should skip TinaCMS in production
const skipTinaCMS = process.env.SKIP_TINA === 'true';
// Detect if we're on Vercel
const isVercel = process.env.VERCEL === '1';

console.log(`Building for production ${skipTinaCMS ? 'WITHOUT' : 'WITH'} TinaCMS`);
console.log(`Running on Vercel: ${isVercel ? 'Yes' : 'No'}`);

// Always set this to avoid Rollup native module issues
process.env.ROLLUP_SKIP_NODEJS = 'true';

try {
  // First run svelte-kit sync to prepare the app
  try {
    console.log('Running svelte-kit sync...');
    execSync('npx svelte-kit sync', { stdio: 'inherit' });
  } catch (syncError) {
    console.log('Warning: svelte-kit sync failed, but continuing build...');
  }

  if (skipTinaCMS || isVercel) {
    // For Vercel, we'll always skip TinaCMS to avoid the native module issues
    console.log('🚀 Building SvelteKit app without TinaCMS...');
    
    // If we're on Vercel and trying to skip TinaCMS, let's make sure any necessary
    // TinaCMS generated files are available or stubbed
    if (isVercel) {
      // Ensure tina/__generated__ directory exists
      const generatedDir = path.join(process.cwd(), 'tina', '__generated__');
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }
    }
    
    // Run the build with ROLLUP_SKIP_NODEJS explicitly set
    execSync('ROLLUP_SKIP_NODEJS=true npx vite build', { stdio: 'inherit', env: {...process.env, ROLLUP_SKIP_NODEJS: 'true'} });
  } else {
    // Build with TinaCMS (only in non-Vercel environments)
    console.log('🦙 Building with TinaCMS...');
    execSync('ROLLUP_SKIP_NODEJS=true npx tinacms build && ROLLUP_SKIP_NODEJS=true npx vite build', { 
      stdio: 'inherit', 
      env: {...process.env, ROLLUP_SKIP_NODEJS: 'true'} 
    });
  }
  
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
