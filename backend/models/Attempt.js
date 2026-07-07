const mongoose = require('mongoose');

// Stores one speaking-evaluation attempt.
const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    transcript: { type: String, required: true },
    wordCount: { type: Number, required: true },
    evaluation: {
      grammarScore: { type: Number, min: 0, max: 10 },
      vocabularyScore: { type: Number, min: 0, max: 10 },
      overallScore: { type: Number, min: 0, max: 10 },
      suggestions: [{ type: String }],
      grammarIssues: [{ type: String }],
      strengths: [{ type: String }],
    },
    source: { type: String, enum: ['gemini', 'fallback-heuristic', 'cache'], default: 'fallback-heuristic' },
    status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
