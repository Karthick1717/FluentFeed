# FluentFeed — Speaking Evaluation System (MERN)

A full-stack speaking evaluation app: a user speaks 100–200 words on a
generated topic, the app transcribes it in the browser, and the backend
scores grammar, vocabulary, and overall performance, returning suggestions
for improvement.

Built with **MongoDB, Express, React (Vite), Node.js** — MERN — plus
JWT authentication.

## Features

- Email/password signup & login (JWT, bcrypt-hashed passwords)
- Random speaking topics
- In-browser speech-to-text (Web Speech API) with a live mic waveform
  (Web Audio API) — falls back to a plain text box if the browser doesn't
  support speech recognition
- Backend evaluation via **Gemini API**, with:
  - an in-memory cache (avoids re-scoring identical submissions)
  - a graceful **offline heuristic fallback** if no Gemini key is set or
    the call fails, so the app is always usable
  - rate limiting on the evaluation endpoint
- Attempt history per user, stored in MongoDB

## Project structure

```
fluentfeed/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/          User.js, Attempt.js
│   ├── middleware/       auth.js, rateLimiter.js, errorHandler.js
│   ├── controllers/      authController.js, evaluationController.js
│   ├── routes/           authRoutes.js, evaluationRoutes.js
│   ├── services/aiService.js   (Gemini call + cache + fallback)
│   └── utils/cache.js
├── frontend/
│   └── src/
│       ├── pages/        Login, Signup, Dashboard, History
│       ├── components/   Navbar, Waveform, ScoreCard
│       ├── context/AuthContext.jsx
│       └── api/axios.js
└── Speaking_Evaluation_System_Design.docx   (written assignment answers)
```

## Setup

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local or Atlas)
- (Optional) A Gemini API key from https://aistudio.google.com/app/apikey
  — without one, the app still works using the offline heuristic scorer.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and (optionally) GEMINI_API_KEY
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to the
backend. Open it in Chrome or Edge for the best speech-recognition support.

## Notes on design decisions

- **Speech-to-text runs in the browser** (Web Speech API) rather than on
  the server. This avoids uploading raw audio, keeps the backend
  lightweight, and matches how the assignment's architecture doc reasons
  about a hosted STT service being one of several possible components —
  here the browser itself plays that role for the demo. Swapping in a
  server-side STT provider (Google Speech-to-Text / Whisper) only requires
  changing how `transcript` is produced before it hits
  `POST /api/evaluation`.
- **Caching + fallback** in `services/aiService.js` directly implements
  the cost-optimization and reliability answers from the write-up.
- See `Speaking_Evaluation_System_Design.docx` for the full theoretical
  answers (limitations, architecture for ~10k evaluations/day, cost
  optimization, reliability under load, and further improvements).
