# AI Workout Coach

A React Native (Expo) mobile app that generates personalized workout plans using AI (OpenAI GPT-4o or Google Gemini), tracks exercises with native rep counting via the accelerometer, and includes a camera mode for form checks.

## Features

- **AI Plan Generation** — personalized weekly plans via OpenAI GPT-4o or Gemini Pro
- **Accelerometer Rep Counter** — counts reps using the device's motion sensor
- **Camera Form Check** — front/back camera view with pose guide overlay
- **Active Workout Tracker** — set completion, rest timers, workout timer
- **History** — completed workout sessions with stats
- **Onboarding** — multi-step profile setup (fitness level, goal, equipment, schedule)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your API key in a `.env` file:
   ```
   OPENAI_API_KEY=sk-...
   # OR
   GEMINI_API_KEY=...
   ```
   If neither key is set, the app uses a built-in mock plan so it works out of the box.

3. Start the app:
   ```bash
   npx expo start
   ```

## Project Structure

```
src/
├── screens/
│   ├── OnboardingScreen.js     # Multi-step profile setup
│   ├── HomeScreen.js           # Plan overview + exercise list
│   ├── ActiveWorkoutScreen.js  # Live workout session
│   ├── HistoryScreen.js        # Workout history
│   └── ProfileScreen.js        # User stats + settings
├── components/
│   ├── ExerciseCard.js         # Expandable exercise detail
│   ├── RepCounter.js           # Accelerometer-based rep counter
│   ├── CameraView.js           # Camera + pose guide overlay
│   └── StatCard.js             # Dashboard stat widget
├── services/
│   ├── aiService.js            # OpenAI / Gemini / mock API calls
│   └── storageService.js       # AsyncStorage persistence
├── hooks/
│   └── useRepCounter.js        # Accelerometer rep detection hook
├── navigation/
│   └── AppNavigator.js         # Stack + tab navigation
└── utils/
    ├── theme.js                 # Colors, spacing, typography
    └── formatters.js            # Date, duration, text helpers
```

## Tech Stack

- React Native + Expo
- OpenAI GPT-4o API / Google Gemini API
- expo-sensors (Accelerometer)
- expo-camera
- React Navigation (Stack + Bottom Tabs)
- AsyncStorage
