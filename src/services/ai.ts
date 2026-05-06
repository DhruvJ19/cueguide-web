import { GoogleGenAI } from '@google/genai';

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
  apiKey: string;
}

export async function generateCueData(contextData: AIPromptContext, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled && aiConfig.apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
      const prompt = `
You are CueGuide, a compassionate AI assistant helping people with early-stage
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
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.error("AI Generation failed", e);
      // fallback on error
    }
  }

  // Fallback / Pre-generated
  return {
    "greeting": `Good morning, ${contextData.preferredName}. It's a nice ${contextData.context.day}, ${contextData.context.date}. The weather is ${contextData.context.weather.toLowerCase()} today.`,
    "steps": contextData.steps.map(step => ({
      "text": step.instruction,
      "audio_text": `${step.instruction}, ${contextData.preferredName}.`
    })),
    "encouragement": `All done with your ${contextData.routineName}. You're doing absolutely great, ${contextData.preferredName}. I'm here when you need me.`
  };
}

export async function generateRoutineSteps(routineName: string, category: string, stepCount: string | number, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled && aiConfig.apiKey) {
     try {
       const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
       const prompt = `Generate exactly ${stepCount} simple, clear steps for a routine for someone with early dementia.
Routine Name: ${routineName}
Category: ${category}

Output JSON format ONLY (array of objects):
[
  { "instruction": "Step text (short, clear)", "icon": "a single distinct emoji representing the step" }
]`;
       const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
       });
       if (response.text) return JSON.parse(response.text);
     } catch (e) {
       console.error("AI Routine Generation failed", e);
     }
  }
  return null;
}

export async function suggestRoutineCategory(routineName: string, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled && aiConfig.apiKey && routineName.trim()) {
    try {
      const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
      const prompt = `Categorize this routine name: "${routineName}"
Choose the single most appropriate category from this list: hygiene, medication, exercise, social, meals, other.
Only reply with the category name, nothing else.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const cat = response.text?.trim().toLowerCase();
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
  if (aiConfig.isEnabled && aiConfig.apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
      const prompt = `Based on this patient context, suggest a comforting short routine name (max 3-4 words).
Context: ${contextNotes || 'General early stage dementia.'}
Only return the routine name, nothing else.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text?.trim().replace(/"/g, '');
    } catch (e) {
      console.error("AI Name suggestion failed", e);
    }
  }
  return "Peaceful Evening";
}

export async function generateHelpExplanation(stepInstruction: string, aiConfig: AIGenerationStatus) {
  if (aiConfig.isEnabled && aiConfig.apiKey) {
     try {
       const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
       const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Please provide a calm, simple 1-2 sentence expanded explanation for this step for someone with early dementia: "${stepInstruction}"`
       });
       return response.text;
     } catch (e) {
       console.error("AI Help failed", e);
     }
  }
  return "Take your time. Expand gently on what needs to be done. We are here to help.";
}
