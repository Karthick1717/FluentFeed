import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const History = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/evaluation/history');
        setAttempts(data.attempts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page-loading">Loading history…</div>;

  if (attempts.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">History</p>
        <h2>No attempts yet</h2>
        <p>Head back to Speak and submit your first response to see it here.</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <p className="eyebrow">Your progress</p>
      <h1>Past attempts</h1>

      <div className="history-list">
        {attempts.map((a) => (
          <div key={a._id} className="history-item">
            <div className="history-item-head">
              <span className="history-score">{a.evaluation.overallScore}/10</span>
              <span className="history-date">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
            <p className="history-topic">{a.topic}</p>
            <p className="history-transcript">{a.transcript}</p>
            <div className="history-meta">
              <span>Grammar {a.evaluation.grammarScore}/10</span>
              <span>Vocabulary {a.evaluation.vocabularyScore}/10</span>
              <span>{a.wordCount} words</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
