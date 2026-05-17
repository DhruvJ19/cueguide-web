# Security Notes

## Current Npm Supply-Chain Response

On May 12-13, 2026, public reports described a Mini Shai-Hulud npm/PyPI supply-chain campaign affecting TanStack and other packages. CueGuide currently does not depend on the reported TanStack, Axios, Bruno, or related package names checked by `scripts/check-lockfile-security.ts`.

Run the local security gate before installing new dependencies or deploying:

```bash
npm run security:all
```

This checks:
- known affected package names from the current incident
- unexpected dependency install scripts in `package-lock.json`
- committed secret patterns
- npm audit advisories
- npm registry signatures and attestations

## Dependency Rules

- Use `npm ci` from the lockfile for clean installs.
- Keep `.npmrc` committed with `ignore-scripts=true` so dependency lifecycle scripts do not run by default.
- If a package truly requires install scripts, review it first and add the exact lockfile path to `scripts/check-lockfile-security.ts`.
- Do not add `pull_request_target` GitHub Actions workflows that check out or execute fork-controlled code.
- Do not add GitHub Actions cache writes across untrusted pull request boundaries.
- Pin third-party GitHub Actions by full commit SHA if workflows are added later.

## Secret Handling

- Do not paste API keys into chat, tickets, commits, screenshots, or docs.
- Treat any pasted key as compromised and rotate it immediately.
- `.env`, `.env.local`, and production env files are ignored by git.
- ElevenLabs is required for production voice with `VITE_USE_ELEVENLABS=true`; keep `VITE_ALLOW_BROWSER_TTS_FALLBACK=false` for production so a broken provider key cannot sound like the old browser voice.
- Keep the ElevenLabs secret in `ELEVENLABS_API_KEY` only. Never use a `VITE_` prefix for provider secrets because Vite exposes those values to browser code.
- Keep AI provider secrets in server-only variables such as `OPENROUTER_API_KEY`; CueGuide calls `/api/ai/*` from the browser.
- Use a freshly rotated ElevenLabs key before enabling live voice.

## ElevenLabs Local Setup

After rotating the exposed key, set these values only in an ignored local env file:

```env
VITE_USE_ELEVENLABS=true
VITE_ALLOW_BROWSER_TTS_FALLBACK=false
ELEVENLABS_API_KEY=your_new_rotated_key
ELEVENLABS_VOICE_ID=hpp4J3VqNfWAUOO0d1Us
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
```

Then run:

```bash
npm run security:all
npm test
npm run lint
npm run build
```
