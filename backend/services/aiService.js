const { GoogleGenAI } = require("@google/genai");
const { cache, makeKey } = require("../utils/cache");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const buildPrompt = (topic, transcript) => `
You are an English speaking evaluator.

Evaluate this response.

Topic:
${topic}

Response:
${transcript}
`;

const fallbackHeuristicEvaluation = (transcript) => {
  const words = transcript.trim().split(/\s+/).filter(Boolean);

  const unique = new Set(words.map(w => w.toLowerCase()));

  const vocabularyScore = Math.max(
    1,
    Math.min(10, Math.round((unique.size / Math.max(words.length, 1)) * 15))
  );

  const grammarScore = Math.max(
    1,
    Math.min(10, Math.round(words.length / 15))
  );

  return {
    grammarScore,
    vocabularyScore,
    overallScore: Math.round((grammarScore + vocabularyScore) / 2),
    grammarIssues: [],
    strengths: ["Response received successfully."],
    suggestions: ["Practice speaking longer and more confidently."]
  };
};

async function callGemini(topic, transcript) {

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",

    contents: buildPrompt(topic, transcript),

    config: {

      temperature: 0.2,

      responseMimeType: "application/json",

      responseSchema: {
        type: "OBJECT",
        properties: {
          grammarScore: {
            type: "NUMBER"
          },
          vocabularyScore: {
            type: "NUMBER"
          },
          overallScore: {
            type: "NUMBER"
          },
          grammarIssues: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          },
          strengths: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          },
          suggestions: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          }
        },
        required: [
          "grammarScore",
          "vocabularyScore",
          "overallScore",
          "grammarIssues",
          "strengths",
          "suggestions"
        ]
      }
    }
  });

  const text = response.text.trim();

  console.log("Gemini Response:");
  console.log(text);

  return JSON.parse(text);
}

async function evaluateSpeech(topic, transcript) {

  const key = makeKey(topic, transcript);

  const cached = cache.get(key);

  if (cached) {
    return {
      ...cached,
      source: "cache"
    };
  }

  try {

    const result = await callGemini(topic, transcript);

    cache.set(key, result);

    return {
      ...result,
      source: "gemini"
    };

  } catch (err) {

    console.error(err);

    const result = fallbackHeuristicEvaluation(transcript);

    cache.set(key, result);

    return {
      ...result,
      source: "fallback-heuristic"
    };
  }
}

module.exports = {
  evaluateSpeech
};