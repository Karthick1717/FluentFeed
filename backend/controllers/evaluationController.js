const Attempt = require('../models/Attempt');
const { evaluateSpeech } = require('../services/aiService');

const TOPICS = [
  'Describe a place you would love to visit and explain why.',
  'Talk about a skill you would like to learn and how you would go about it.',
  'Describe your favourite way to spend a weekend.',
  'Talk about a piece of technology that has changed your daily life.',
  'Describe a book, film, or show that left an impression on you.',
  'Talk about a challenge you overcame and what you learned from it.',
];

const getTopic = (req, res) => {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  res.json({ topic });
};

const submitEvaluation = async (req, res, next) => {
  try {
    const { topic, transcript } = req.body;

    if (!topic || !transcript) {
      return res.status(400).json({ message: 'topic and transcript are required' });
    }

    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      return res.status(400).json({
        message: 'Transcript is too short to evaluate meaningfully. Please speak at least ~100 words.',
      });
    }

    const evaluation = await evaluateSpeech(topic, transcript);

    const attempt = await Attempt.create({
      user: req.user._id,
      topic,
      transcript,
      wordCount,
      evaluation: {
        grammarScore: evaluation.grammarScore,
        vocabularyScore: evaluation.vocabularyScore,
        overallScore: evaluation.overallScore,
        suggestions: evaluation.suggestions || [],
        grammarIssues: evaluation.grammarIssues || [],
        strengths: evaluation.strengths || [],
      },
      source: evaluation.source,
      status: 'completed',
    });

    res.status(201).json({ attempt });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTopic, submitEvaluation, getHistory };
