// QA ONLY: preload in build/e2e subprocesses to prevent Next from opening ANY
// .env files. Never use this preload for normal local development/deployment.
const env = require('@next/env');
// @next/env exports non-configurable getters; replace the cached exports object
// instead of assigning its read-only loadEnvConfig property.
require.cache[require.resolve('@next/env')].exports = {
  ...env,
  loadEnvConfig: () => ({ combinedEnv: process.env, parsedEnv: {}, loadedEnvFiles: [] }),
};
// Fail visibly if any other build code tries to read a private environment file.
const fs = require('node:fs');
const path = require('node:path');
const originalRead = fs.readFileSync;
fs.readFileSync = function (file, ...args) {
  const name = typeof file === 'string' ? path.basename(file) : '';
  if (name === '.env' || (name.startsWith('.env.') && name !== '.env.example')) throw new Error('QA blocked a private environment file read');
  return originalRead.call(this, file, ...args);
};
