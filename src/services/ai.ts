import type { AICueData, AICueStep } from '../types';
import {
  buildFallbackCueData,
  minimizeCareContext,
  parseCueJson,
  validateCueData,
} from './cueValidation';

const DEFAULT_MODEL = 'openai/gpt-4o';

interface AIPromptContext {
  patientName: string;
  preferredName: string;
  routineName: string;
  steps: { id?: string; instruction: string; icon?: string; helpText?: string }[];
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

export async function generateCueData(contextData: AIPromptContext, aiConfig: AIGenerationStatus): Promise<AICueData> {
  const fallbackSteps = contextData.steps.map((step) => ({
    stepId: step.id,
    text: step.instruction,
    audio_text: step.instruction,
    help_text: step.helpText || 'Take your time. Do this one small step, then press Done.',
  }));
  const fallbackCueData = buildFallbackCueData(
    contextData.preferredName,
    contextData.context.day,
    contextData.context.date,
    fallbackSteps,
  );
  
  if (aiConfig.isEnabled) {
    try {
      const minimizedNotes = minimizeCareContext(contextData.context.notes, [
        contextData.patientName,
        contextData.preferredName,
      ]);
      const promptSteps = contextData.steps.map((step, index) => ({
        stepId: step.id || `step-${index + 1}`,
        instruction: step.instruction,
        icon: step.icon,
        helpText: step.helpText,
      }));
      const prompt = `You are CueGuide, a calm patient guidance voice for people who need simple daily support.
Generate step-by-step prompts from de-identified care context.

Preferred address: use the exact placeholder "{{preferredName}}" when addressing the patient. The app will safely personalize it later.
Routine: ${contextData.routineName}
Steps: ${JSON.stringify(promptSteps)}

Context:
Day: ${contextData.context.day}
Date: ${contextData.context.date}
Weather: ${contextData.context.weather}
Upcoming: ${contextData.context.upcoming}
Care Notes, de-identified and minimum necessary: ${minimizedNotes}

Rules:
- Write like gentle navigation directions: human, soft, brief, and steady.
- Use one action per step. Prefer "Would you like to..." or "When you're ready..." over commands.
- Simple, calm, non-clinical language.
- Never mention dementia, memory loss, forgetting, failure, urgency, or blame.
- Do not say you are AI. Do not over-explain.
- Keep each step one short instruction, 8-18 words when possible.
- For medications, describe the pill visually and purpose simply.
- Patient-facing text must never sound urgent or scolding.
- Help text should calmly repeat the next physical action, not apologize or lecture.
- Return exactly ${fallbackSteps.length} steps in the same order as the input.

Output format ONLY JSON, no markdown formatting blocks, no extra text:
{
  "greeting": "string (warm, conversational greeting with preferred name; keep orientation details brief and optional)",
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
        const validated = validateCueData(parseCueJson(text), fallbackCueData);
        if (validated.source === 'ai') {
          return {
            ...validated,
            greeting: validated.greeting.replaceAll('{{preferredName}}', contextData.preferredName),
            steps: validated.steps.map((step) => ({
              ...step,
              text: step.text.replaceAll('{{preferredName}}', contextData.preferredName),
              audio_text: step.audio_text.replaceAll('{{preferredName}}', contextData.preferredName),
              help_text: step.help_text?.replaceAll('{{preferredName}}', contextData.preferredName),
            })),
            encouragement: validated.encouragement.replaceAll('{{preferredName}}', contextData.preferredName),
          };
        }
      }
    } catch (e) {
      console.error("AI Generation failed", e);
    }
  }

  return fallbackCueData;
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
      const minimizedNotes = minimizeCareContext(contextNotes || 'General daily support.', []);
      const prompt = `Based on this patient context, suggest a comforting short routine name (max 3-4 words).
Context: ${minimizedNotes}
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
