const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function generateWorkoutPlan(userProfile) {
  const prompt = buildWorkoutPrompt(userProfile);

  if (OPENAI_API_KEY) {
    return callOpenAI(prompt);
  }
  if (GEMINI_API_KEY) {
    return callGemini(prompt);
  }
  return getMockWorkoutPlan(userProfile);
}

function buildWorkoutPrompt(profile) {
  return `You are an expert personal trainer. Generate a personalized workout plan as valid JSON.

User Profile:
- Fitness Level: ${profile.fitnessLevel}
- Goal: ${profile.goal}
- Days per week: ${profile.daysPerWeek}
- Available equipment: ${profile.equipment}
- Age: ${profile.age}
- Any injuries or limitations: ${profile.limitations || 'None'}

Return ONLY a JSON object with this exact structure:
{
  "planName": "string",
  "weeklySchedule": [
    {
      "day": "string",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": number,
          "restSeconds": number,
          "instructions": "string",
          "muscleGroups": ["string"]
        }
      ]
    }
  ],
  "tips": ["string"],
  "estimatedDurationMinutes": number
}`;
}

async function callOpenAI(prompt) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callGemini(prompt) {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}

function getMockWorkoutPlan(profile) {
  return {
    planName: `${profile.fitnessLevel} ${profile.goal} Plan`,
    weeklySchedule: [
      {
        day: 'Monday',
        focus: 'Upper Body',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15, restSeconds: 60, instructions: 'Keep your core tight and lower your chest to the floor.', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
          { name: 'Dumbbell Rows', sets: 3, reps: 12, restSeconds: 60, instructions: 'Pull the dumbbell to your hip, keeping your back flat.', muscleGroups: ['Back', 'Biceps'] },
          { name: 'Overhead Press', sets: 3, reps: 10, restSeconds: 90, instructions: 'Press straight up, avoid arching your lower back.', muscleGroups: ['Shoulders', 'Triceps'] },
        ],
      },
      {
        day: 'Wednesday',
        focus: 'Lower Body',
        exercises: [
          { name: 'Squats', sets: 4, reps: 12, restSeconds: 90, instructions: 'Keep knees over toes, sit back as if into a chair.', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'] },
          { name: 'Lunges', sets: 3, reps: 10, restSeconds: 60, instructions: 'Step forward, lower knee toward floor, push back up.', muscleGroups: ['Quads', 'Glutes'] },
          { name: 'Calf Raises', sets: 3, reps: 20, restSeconds: 45, instructions: 'Rise onto your toes slowly, lower with control.', muscleGroups: ['Calves'] },
        ],
      },
      {
        day: 'Friday',
        focus: 'Core & Cardio',
        exercises: [
          { name: 'Plank', sets: 3, reps: 1, restSeconds: 60, instructions: 'Hold for 30-60 seconds, keep hips level.', muscleGroups: ['Core'] },
          { name: 'Bicycle Crunches', sets: 3, reps: 20, restSeconds: 45, instructions: 'Rotate elbow to opposite knee, control the movement.', muscleGroups: ['Core', 'Obliques'] },
          { name: 'Burpees', sets: 3, reps: 10, restSeconds: 90, instructions: 'Full body movement: squat, jump back, push-up, jump up.', muscleGroups: ['Full Body'] },
        ],
      },
    ],
    tips: [
      'Warm up for 5-10 minutes before every session',
      'Stay hydrated throughout your workout',
      'Focus on form over weight to prevent injury',
      'Progressive overload: add weight or reps each week',
    ],
    estimatedDurationMinutes: 45,
  };
}
