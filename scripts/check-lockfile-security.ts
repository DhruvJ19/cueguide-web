import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type LockPackage = {
  version?: string;
  hasInstallScript?: boolean;
};

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as {
  packages?: Record<string, LockPackage>;
};
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};

const packages = lock.packages || {};
const packageNames = Object.keys(packages)
  .filter((path) => path.startsWith('node_modules/'))
  .map((path) => path.replace(/^node_modules\//, ''));

const blockedPackagePatterns = [
  /^@tanstack\//,
  /^axios$/,
  /^plain-crypto-js$/,
  /^@usebruno\/cli$/,
  /^safe-action$/,
  /^ts-dna$/,
  /^cross-stitch$/,
  /^cmux-agent-mcp$/,
  /^agentwork-cli$/,
  /^git-branch-selector$/,
  /^wot-api$/,
  /^git-git-git$/,
  /^nextmove-mcp$/,
  /^ml-toolkit-ts$/,
];

const allowedInstallScriptPackages = new Set([
  'node_modules/@google/genai',
  'node_modules/@sentry/cli',
  'node_modules/core-js',
  'node_modules/esbuild',
  'node_modules/fsevents',
  'node_modules/playwright/node_modules/fsevents',
  'node_modules/protobufjs',
  'node_modules/vite/node_modules/esbuild',
]);

const blockedMatches = packageNames.filter((name) =>
  blockedPackagePatterns.some((pattern) => pattern.test(name))
);

const unexpectedInstallScripts = Object.entries(packages)
  .filter(([path, metadata]) => path.startsWith('node_modules/') && metadata.hasInstallScript)
  .filter(([path]) => !allowedInstallScriptPackages.has(path))
  .map(([path, metadata]) => `${path}@${metadata.version || 'unknown'}`);

const rootLifecycleScripts = Object.entries(packageJson.scripts || {}).filter(([name]) =>
  /^(preinstall|install|postinstall|prepare|prepublish|prepublishOnly)$/i.test(name)
);

assert.deepEqual(blockedMatches, [], `Blocked supply-chain package(s) present: ${blockedMatches.join(', ')}`);
assert.deepEqual(
  unexpectedInstallScripts,
  [],
  `Unexpected dependency install scripts present: ${unexpectedInstallScripts.join(', ')}`
);
assert.deepEqual(
  rootLifecycleScripts,
  [],
  `Root lifecycle scripts are not allowed in this app: ${rootLifecycleScripts.map(([name]) => name).join(', ')}`
);

console.log('lockfile security checks passed');
