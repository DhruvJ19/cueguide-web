import type { AICueData, AICueStep } from '../types';

const DEFAULT_MODEL = 'openai/gpt-4o';

interface AIPromptContext {
  patientName: string;
  preferredName: string;
  routineName: string;
  steps: { instruction: string; icon?: string }[];
  context: {
    day: string;
    date: string;
    weather: string;
    upcoming: string;
    notes: string;
  };
}

export interface AIGenerationStatus {
  isEnabled: boolean;
}

async function callOpenRouter(prompt: string, model = DEFAULT_MODEL) {
  const response = await fetch('/api/ai/cue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.text || '';
}

function safeParseCueData(text: string, fallbackSteps: AICueStep[]): AICueData | null {
  try {
    const parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
    if (!parsed || typeof parsed.greeting !== 'string' || !Array.isArray(parsed.steps)) return null;
    const steps = parsed.steps
      .map((step: any) => ({
        stepId: typeof step.stepId === 'string' ? step.stepId : undefined,
        text: typeof step.text === 'string' ? step.text : '',
        audio_text: typeof step.audio_text === 'string' ? step.audio_text : '',
        help_text: typeof step.help_text === 'string' ? step.help_text : undefined,
      }))
      .filter((step: AICueStep) => step.text && step.audio_text);
    if (steps.length === 0) return null;
    return {
      greeting: parsed.greeting.slice(0, 220),
      steps,
      encouragement: typeof parsed.encouragement === 'string' ? parsed.encouragement.slice(0, 220) : 'All set.',
      reviewed: false,
      source: 'ai',
    };
  } catch {
    return null;
  }
}

export async function generateCueData(contextData: AIPromptContext, aiConfig: AIGenerationStatus): Promise<AICueData> {
  const fallbackSteps = contextData.steps.map((step: any) => ({
    stepId: step.id,
    text: step.instruction,
    audio_text: `${contextData.preferredName}, next ${step.instruction.toLowerCase()}. Take your time.`,
    help_text: step.helpText || 'Take your time. Do this one small step, then press Done.',
  }));
  
  if (aiConfig.isEnabled) {
    try {
      const prompt = `You are CueGuide, a calm patient guidance voice for people who need simple daily support.
Generate step-by-step prompts from de-identified care context.

Preferred Name: ${contextData.preferredName}
Routine: ${contextData.routineName}
Steps: ${JSON.stringify(contextData.steps)}

Context:
Day: ${contextData.context.day}
Date: ${contextData.context.date}
Weather: ${contextData.context.weather}
Upcoming: ${contextData.context.upcoming}
Care Notes, de-identified and minimum necessary: ${contextData.context.notes}

Rules:
- Write like gentle navigation directions: human, soft, brief, and steady.
- Use one action per step. Prefer "Next..." or "When you're ready..." over assistant-like chatter.
- Simple, calm, non-clinical language.
- Never mention dementia, memory loss, failure, or blame.
- Do not say you are AI. Do not over-explain.
- Keep each step one short instruction, 8-18 words when possible.
- For medications, describe the pill visually and purpose simply.
- Patient-facing text must never sound urgent or scolding.
- Help text should calmly repeat the next physical action, not apologize or lecture.

Output format ONLY JSON, no markdown formatting blocks, no extra text:
{
  "greeting": "string (warm, conversational greeting, includes preferred name and date without sounding robotic)",
  "steps": [
    {
      "stepId": "string if supplied",
      "text": "short instruction",
      "audio_text": "gentle read-aloud direction, like soft voice navigation",
      "help_text": "one sentence calm physical guidance"
    }
  ],
  "encouragement": "short, warm finish statement, very conversational"
}`;

      const text = await callOpenRouter(prompt);
      if (text) {
        const parsed = safeParseCueData(text, fallbackSteps);
        if (parsed) return parsed;
      }
    } catch (e) {
      console.error("AI Generation failed", e);
    }
  }

  return {
    "greeting": `Good morning, ${contextData.preferredName}. It is ${contextData.context.day}, ${contextData.context.date}. We will go one step at a time.`,
    "steps": fallbackSteps,
    "encouragement": `All set, ${contextData.preferredName}. Thank you for taking care of yourself.`,
    "reviewed": true,
    "source": "fallback"
  };
}

export async function generateRoutineSteps(routineName: string, category: string, stepCount: string | number, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled) {
    try {
      const prompt = `Generate exactly ${stepCount} simple, clear steps for a routine for someone who needs calm daily guidance.
Routine Name: ${routineName}
Category: ${category}

Style: gentle voice directions, one action per step, no childish language, no clinical labels.

Output JSON format ONLY (array of objects):
[
  { "instruction": "Step text (short, clear)", "icon": "a single distinct emoji representing the step" }
]`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      if (text) return JSON.parse(text);
    } catch (e) {
      console.error("AI Routine Generation failed", e);
    }
  }
  return null;
}

export async function suggestRoutineCategory(routineName: string, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled && routineName.trim()) {
    try {
      const prompt = `Categorize this routine name: "${routineName}"
Choose the single most appropriate category from this list: hygiene, medication, exercise, social, meals, other.
Only reply with the category name, nothing else.`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      const cat = text?.trim().toLowerCase();
      if (['hygiene', 'medication', 'exercise', 'social', 'meals', 'other'].includes(cat || '')) {
        return cat;
      }
    } catch (e) {
      console.error("AI Category suggestion failed", e);
    }
  }
  return null;
}

export async function suggestRoutineName(contextNotes: string, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled) {
    try {
      const prompt = `Based on this patient context, suggest a comforting short routine name (max 3-4 words).
Context: ${contextNotes || 'General early stage dementia.'}
Only return the routine name, nothing else.`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      return text?.trim().replace(/"/g, '');
    } catch (e) {
      console.error("AI Name suggestion failed", e);
    }
  }
  return "Peaceful Evening";
}

export async function generateHelpExplanation(stepInstruction: string, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled) {
    try {
      const prompt = `Provide a calm, simple one-sentence help cue for this step: "${stepInstruction}".
Style it like gentle voice navigation: one physical action, soft tone, no diagnosis labels, no blame.`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      return text;
    } catch (e) {
      console.error("AI Help failed", e);
    }
  }
  return "Take your time. Try this one small step, then press Done.";
}
