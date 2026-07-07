import React from 'react';

const scoreLabel = (score) => {
  if (score >= 8.5) return 'Excellent';
  if (score >= 7) return 'Strong';
  if (score >= 5) return 'Developing';
  return 'Needs work';
};

const ScoreCard = ({ evaluation, wordCount, source }) => {
  if (!evaluation) return null;

  return (
    <div className="result-card">
      <div className="result-header">
        <div>
          <p className="eyebrow">Evaluation result</p>
          <h2>{scoreLabel(evaluation.overallScore)}</h2>
        </div>
        <div className="overall-score">
          <span className="overall-score-num">{evaluation.overallScore}</span>
          <span className="overall-score-den">/10</span>
        </div>
      </div>

      <div className="score-row">
        <div className="score-pill">
          <span className="score-pill-label">Grammar</span>
          <span className="score-pill-value">{evaluation.grammarScore}/10</span>
        </div>
        <div className="score-pill">
          <span className="score-pill-label">Vocabulary</span>
          <span className="score-pill-value">{evaluation.vocabularyScore}/10</span>
        </div>
        <div className="score-pill">
          <span className="score-pill-label">Word count</span>
          <span className="score-pill-value">{wordCount}</span>
        </div>
      </div>

      {evaluation.strengths?.length > 0 && (
        <div className="feedback-block">
          <h3>What worked</h3>
          <ul>
            {evaluation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.grammarIssues?.length > 0 && (
        <div className="feedback-block">
          <h3>Grammar notes</h3>
          <ul>
            {evaluation.grammarIssues.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="feedback-block">
        <h3>Suggestions</h3>
        <ul>
          {evaluation.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <p className="source-note">
        Scored by {source === 'gemini' ? 'Gemini' : source === 'cache' ? 'cached result' : 'offline heuristic (no Gemini key configured)'}
      </p>
    </div>
  );
};

export default ScoreCard;
