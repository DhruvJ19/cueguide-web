import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean);

const secretPatterns = [
  { name: 'ElevenLabs API key', pattern: /sk_[A-Za-z0-9]{32,}/g },
  { name: 'OpenAI API key', pattern: /sk-proj-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}/g },
  { name: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9_]{30,}/g },
  { name: 'npm token', pattern: /npm_[A-Za-z0-9]{30,}/g },
  { name: 'AWS access key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Supabase JWT-like key', pattern: /eyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
];

const ignoredFiles = new Set(['package-lock.json']);
const localEnvFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
  'CueGuide/.env',
  'CueGuide/.env.local',
  'CueGuide/.env.development',
  'CueGuide/.env.production',
];
const browserPublicEnvPrefix = /^(VITE|EXPO_PUBLIC)_/;
const browserSecretNamePattern = /(API_)?KEY|SECRET|TOKEN|AUTH|ACCOUNT_SID|PRIVATE/i;
const allowedBrowserEnvNames = new Set([
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_USE_ELEVENLABS',
  'VITE_TWILIO_PHONE_NUMBER',
  'VITE_SENTRY_DSN',
  'VITE_VAPID_PUBLIC_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_CUEGUIDE_API_BASE_URL',
  'EXPO_PUBLIC_TWILIO_PHONE_NUMBER',
]);
const findings: string[] = [];

function checkContentsForSecrets(file: string, contents: string): void {
  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    const matches = contents.match(pattern);
    if (matches?.length) {
      findings.push(`${file}: possible ${name} (${matches.length} match${matches.length === 1 ? '' : 'es'})`);
    }
  }
}

function checkPublicEnvNames(file: string, contents: string): void {
  for (const [index, line] of contents.split('\n').entries()) {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match) continue;
    const name = match[1];
    if (!browserPublicEnvPrefix.test(name)) continue;
    if (allowedBrowserEnvNames.has(name)) continue;
    if (browserSecretNamePattern.test(name)) {
      findings.push(`${file}:${index + 1}: ${name} uses a browser-public prefix for a provider secret`);
    }
  }
}

function collectDistFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) return collectDistFiles(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

for (const file of trackedFiles) {
  if (ignoredFiles.has(file) || !existsSync(file)) continue;
  const stat = statSync(file);
  if (!stat.isFile() || stat.size > 1_000_000) continue;

  const contents = readFileSync(file, 'utf8');
  checkContentsForSecrets(file, contents);
  checkPublicEnvNames(file, contents);
}

for (const file of localEnvFiles) {
  if (!existsSync(file)) continue;
  const contents = readFileSync(file, 'utf8');
  checkPublicEnvNames(file, contents);
}

for (const file of collectDistFiles('dist')) {
  const stat = statSync(file);
  if (!stat.isFile() || stat.size > 2_000_000) continue;
  if (!/\.(html|js|css|json|map|txt)$/.test(file)) continue;
  const contents = readFileSync(file, 'utf8');
  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    const matches = contents.match(pattern);
    if (matches?.length) {
      findings.push(`${file}: possible bundled ${name} (${matches.length} match${matches.length === 1 ? '' : 'es'})`);
    }
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets found:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log('secret exposure checks passed');
