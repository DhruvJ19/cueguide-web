const CUEGUIDE_API_BASE_URL = process.env.EXPO_PUBLIC_CUEGUIDE_API_BASE_URL?.trim() ?? '';
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

function getApiUrl(path: string): string {
  if (!CUEGUIDE_API_BASE_URL) return '';
  return `${CUEGUIDE_API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function callOpenRouter(prompt: string, model = DEFAULT_MODEL): Promise<string> {
  const apiUrl = getApiUrl('/api/ai/cue');
  if (!apiUrl) throw new Error('CueGuide AI proxy is not configured');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function generateCueData(contextData: AIPromptContext, aiConfig: AIGenerationStatus): Promise<{
  greeting: string;
  steps: { text: string; audio_text: string }[];
  encouragement: string;
}> {
  if (aiConfig.isEnabled && CUEGUIDE_API_BASE_URL) {
    try {
      const prompt = `You are CueGuide, a compassionate AI assistant helping people with early-stage
dementia complete daily routines. You generate step-by-step prompts.

Patient Name: ${contextData.patientName}
Preferred Name: ${contextData.preferredName}
Routine: ${contextData.routineName}
Steps: ${JSON.stringify(contextData.steps)}

Context:
Day: ${contextData.context.day}
Date: ${contextData.context.date}
Weather: ${contextData.context.weather}
Upcoming: ${contextData.context.upcoming}
Notes: ${contextData.context.notes}

Output format ONLY JSON, no markdown formatting blocks, no extra text:
{
  "greeting": "string (warm, conversational greeting, includes preferred name, date, and weather/upcoming without sounding robotic)",
  "steps": [
    {
      "text": "short instruction",
      "audio_text": "read aloud version, encouraging"
    }
  ],
  "encouragement": "warm finish statement, very conversational, use the preferred name, encourage them"
}`;

      const text = await callOpenRouter(prompt);
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.error("AI Generation failed", e);
    }
  }

  return {
    greeting: `Good morning, ${contextData.preferredName}. It's a nice ${contextData.context.day}, ${contextData.context.date}. The weather is ${contextData.context.weather.toLowerCase()} today.`,
    steps: contextData.steps.map(step => ({
      text: step.instruction,
      audio_text: `${step.instruction}, ${contextData.preferredName}.`
    })),
    encouragement: `All done with your ${contextData.routineName}. You're doing absolutely great, ${contextData.preferredName}. I'm here when you need me.`
  };
}

export async function generateRoutineSteps(
  routineName: string, 
  category: string, 
  stepCount: string | number, 
  aiConfig: AIGenerationStatus
): Promise<{ instruction: string; icon: string }[] | null> {
  if (aiConfig.isEnabled && CUEGUIDE_API_BASE_URL) {
    try {
      const prompt = `Generate exactly ${stepCount} simple, clear steps for a routine for someone with early dementia.
Routine Name: ${routineName}
Category: ${category}

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

export async function suggestRoutineCategory(
  routineName: string, 
  aiConfig: AIGenerationStatus
): Promise<string | null> {
  if (aiConfig.isEnabled && CUEGUIDE_API_BASE_URL && routineName.trim()) {
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

export async function suggestRoutineName(
  contextNotes: string, 
  aiConfig: AIGenerationStatus
): Promise<string> {
  if (aiConfig.isEnabled && CUEGUIDE_API_BASE_URL) {
    try {
      const prompt = `Based on this patient context, suggest a comforting short routine name (max 3-4 words).
Context: ${contextNotes || 'General early stage dementia.'}
Only return the routine name, nothing else.`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      return text?.trim().replace(/"/g, '') || 'Peaceful Evening';
    } catch (e) {
      console.error("AI Name suggestion failed", e);
    }
  }
  return 'Peaceful Evening';
}

export async function generateHelpExplanation(
  stepInstruction: string, 
  aiConfig: AIGenerationStatus
): Promise<string> {
  if (aiConfig.isEnabled && CUEGUIDE_API_BASE_URL) {
    try {
      const prompt = `Please provide a calm, simple 1-2 sentence expanded explanation for this step for someone with early dementia: "${stepInstruction}"`;
      const text = await callOpenRouter(prompt, 'openai/gpt-4o-mini');
      return text || "Take your time. We're here to help.";
    } catch (e) {
      console.error("AI Help failed", e);
    }
  }
  return "Take your time. Expand gently on what needs to be done. We are here to help.";
}
