import assert from 'node:assert/strict';
import { chromium, type ConsoleMessage } from 'playwright';

const DEFAULT_URL = 'https://cueguide-web.vercel.app';
const targetUrl = process.env.CUEGUIDE_SMOKE_URL || DEFAULT_URL;
const requireElevenLabs = process.env.CUEGUIDE_REQUIRE_ELEVENLABS !== 'false';

interface TtsObservation {
  method?: string;
  url?: string;
  status?: number;
  contentType?: string;
}

function isAllowedConsoleMessage(message: ConsoleMessage): boolean {
  const text = message.text();
  if (message.type() === 'warning' && text.includes('Sentry DSN not configured')) return true;
  if (!requireElevenLabs && text.includes('ElevenLabs TTS failed')) return true;
  if (!requireElevenLabs && text.includes('429 (Too Many Requests)')) return true;
  return false;
}

async function clickNav(page: import('playwright').Page, name: string): Promise<void> {
  await page.locator('.cg-nav').getByRole('button', { name, exact: true }).click();
}

async function runSmoke(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const ttsObservations: TtsObservation[] = [];
  const consoleProblems: string[] = [];
  const pageErrors: string[] = [];

  page.on('request', (request) => {
    if (request.url().includes('/api/elevenlabs/tts')) {
      ttsObservations.push({ method: request.method(), url: request.url() });
    }
  });

  page.on('response', (response) => {
    if (response.url().includes('/api/elevenlabs/tts')) {
      ttsObservations.push({
        status: response.status(),
        contentType: (response.headers()['content-type'] || '').split(';')[0],
      });
    }
  });

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type()) && !isAllowedConsoleMessage(message)) {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('cueguide-active-tab', 'today');
    });
    await page.reload({ waitUntil: 'networkidle', timeout: 30_000 });

    await page.getByRole('heading', { name: /Medication guidance and routine monitoring/i }).waitFor({ state: 'visible' });
    assert.equal(await page.locator('text=/Failed to compile|Unhandled Runtime Error|Vite Error/i').count(), 0);

    await clickNav(page, 'Medications');
    await page.getByRole('button', { name: /^Add medication$/i }).first().click();
    await page.getByPlaceholder('Times, comma separated').fill('bad-time');
    await page.getByRole('button', { name: /Save medication/i }).click();
    await page.getByText('Medication name is required.').waitFor({ state: 'visible' });
    await page.getByText('Use 24-hour times like 08:00, separated by commas.').waitFor({ state: 'visible' });

    const medicationName = `Smoke Omega ${Date.now()}`;
    await page.getByPlaceholder('Medication name').fill(medicationName);
    await page.getByPlaceholder('Dosage, e.g. 10 mg').fill('5 mg');
    await page.getByPlaceholder('Plain-language purpose').fill('Supports the morning care plan');
    await page.getByPlaceholder('Pill color').fill('blue');
    await page.getByPlaceholder('Pill shape').fill('oval');
    await page.getByPlaceholder('Times, comma separated').fill('10:45');
    await page.getByPlaceholder('Where the patient finds it').fill('the labeled pill organizer');
    await page.getByPlaceholder('Caregiver notes or instructions').fill('Take with water.');
    await page.getByRole('button', { name: /Save medication/i }).click();
    await page.getByText(medicationName).waitFor({ state: 'visible' });
    await page.locator('.cg-med-card').filter({ hasText: medicationName }).getByRole('button', { name: /Edit medication/i }).click();
    await page.getByPlaceholder('Plain-language purpose').fill('Supports the updated morning care plan');
    await page.getByRole('button', { name: /Update medication/i }).click();
    await page.getByText('Supports the updated morning care plan').waitFor({ state: 'visible' });

    await clickNav(page, 'Today');
    await page.getByRole('button', { name: /Start medication session/i }).click();
    await page.getByRole('button', { name: /Begin/i }).waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('button', { name: /Begin/i }).click();
    await page.getByRole('button', { name: /Read aloud/i }).waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('button', { name: /Read aloud/i }).click();
    await page.getByRole('button', { name: /Help/i }).click();
    await page.locator('.patient-help').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /Skip/i }).click();

    for (let index = 0; index < 8; index += 1) {
      if ((await page.locator('.patient-moods button').count()) > 0) break;
      const done = page.getByRole('button', { name: /Done/i });
      if ((await done.count()) > 0) await done.first().click();
      await page.waitForTimeout(300);
    }

    await page.getByRole('button', { name: /Okay/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /Okay/i }).click();
    await page.getByRole('heading', { name: /Thank you/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.waitForTimeout(1_500);

    await page.getByRole('heading', { name: /Live Patient Session/i }).waitFor({ state: 'visible', timeout: 15_000 });
    const summary = await page.locator('.cg-session-summary, .cg-live-panel').first().textContent();
    assert.match(summary || '', /Medication/);
    assert.match(summary || '', /patient actions logged/);

    await clickNav(page, 'Settings');
    await page.getByText(/Patient voice/i).waitFor({ state: 'visible' });
    if (requireElevenLabs) {
      await page.getByText(/ElevenLabs active/i).first().waitFor({ state: 'visible', timeout: 15_000 });
    } else {
      await page.getByText(/ElevenLabs active|ElevenLabs required|ElevenLabs blocked/i).first().waitFor({ state: 'visible', timeout: 15_000 });
    }

    await clickNav(page, 'Reports');
    await page.getByText(/Medication adherence/i).waitFor({ state: 'visible' });
    await page.getByText(/Help requests/i).waitFor({ state: 'visible' });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.evaluate(() => localStorage.setItem('cueguide-active-tab', 'today'));
    await page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
    await page.getByRole('heading', { name: /Medication guidance/i }).waitFor({ state: 'visible' });
    const hasMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    assert.equal(hasMobileOverflow, false);

    if (requireElevenLabs) {
      assert.ok(
        ttsObservations.some((entry) => entry.status === 200 && entry.contentType === 'audio/mpeg'),
        `Expected ElevenLabs audio/mpeg response. Observed: ${JSON.stringify(ttsObservations)}`,
      );
    }

    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleProblems, []);

    console.log(JSON.stringify({
      ok: true,
      targetUrl,
      medicationName,
      elevenLabs: ttsObservations.filter((entry) => entry.status),
      mobileNoOverflow: true,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

runSmoke().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
