/* rollup-patch.cjs */
// This patch forces Rollup to use the pure JavaScript implementation instead of native modules

// Original file is /node_modules/rollup/dist/native.js
// Monkey-patch Rollup's native module loader to force using JS implementation
const originalResolve = require.resolve;
require.resolve = function(request, options) {
  if (request.startsWith('@rollup/rollup-') && request.endsWith('-gnu')) {
    // Force error to make it fall back to JavaScript implementation
    throw new Error('Forcing pure JavaScript implementation of Rollup');
  }
  return originalResolve(request, options);
};

// Set environment variable to skip native modules
process.env.ROLLUP_SKIP_NODEJS = 'true';

module.exports = {};
