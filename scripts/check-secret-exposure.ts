import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

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
const findings: string[] = [];

for (const file of trackedFiles) {
  if (ignoredFiles.has(file) || !existsSync(file)) continue;
  const stat = statSync(file);
  if (!stat.isFile() || stat.size > 1_000_000) continue;

  const contents = readFileSync(file, 'utf8');
  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    const matches = contents.match(pattern);
    if (matches?.length) {
      findings.push(`${file}: possible ${name} (${matches.length} match${matches.length === 1 ? '' : 'es'})`);
    }
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets found:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log('secret exposure checks passed');
