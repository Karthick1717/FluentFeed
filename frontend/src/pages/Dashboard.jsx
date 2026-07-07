import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import Waveform from '../components/Waveform';
import ScoreCard from '../components/ScoreCard';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Dashboard = () => {
  const [topic, setTopic] = useState('');
  const [topicLoading, setTopicLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [unsupported, setUnsupported] = useState(false);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const fetchTopic = async () => {
    setTopicLoading(true);
    setResult(null);
    setTranscript('');
    finalTranscriptRef.current = '';
    try {
      const { data } = await api.get('/evaluation/topic');
      setTopic(data.topic);
    } catch {
      setTopic('Talk about something you are passionate about.');
    } finally {
      setTopicLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
    if (!SpeechRecognition) setUnsupported(true);
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = async () => {
    setError('');
    setResult(null);
    finalTranscriptRef.current = '';
    setTranscript('');

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(micStream);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += `${text} `;
            } else {
              interim += text;
            }
          }
          setTranscript(`${finalTranscriptRef.current}${interim}`.trim());
        };

        recognition.onerror = (event) => {
          if (event.error !== 'no-speech') {
            setError('Speech recognition hit an issue. You can also type your response below.');
          }
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      setListening(true);
    } catch (err) {
      setError('Microphone access was denied or is unavailable. You can type your response instead.');
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setListening(false);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/evaluation', { topic, transcript });
      setResult(data.attempt);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not evaluate your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard">
      <section className="topic-card">
        <div className="topic-card-head">
          <p className="eyebrow">Today's topic</p>
          <button className="btn-ghost" onClick={fetchTopic} disabled={topicLoading || listening}>
            New topic
          </button>
        </div>
        <h1>{topicLoading ? 'Loading a topic…' : topic}</h1>
        <p className="hint">Speak for 100–200 words. Aim for clear structure and natural pacing.</p>
      </section>

      <section className="record-card">
        <Waveform stream={stream} active={listening} />

        <div className="record-controls">
          {!listening ? (
            <button className="btn-primary btn-record" onClick={startListening}>
              ● Start speaking
            </button>
          ) : (
            <button className="btn-primary btn-record is-recording" onClick={stopListening}>
              ■ Stop
            </button>
          )}
          <span className="word-count">{wordCount} words</span>
        </div>

        {unsupported && (
          <p className="hint">
            Your browser doesn't support live speech-to-text. Type your response in the box below instead.
          </p>
        )}

        <textarea
          className="transcript-box"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcribed speech will appear here as you talk — or type / edit it directly."
          rows={6}
        />

        {error && <p className="form-error">{error}</p>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={submitting || wordCount < 20 || listening}
        >
          {submitting ? 'Evaluating…' : 'Submit for evaluation'}
        </button>
      </section>

      {result && (
        <ScoreCard evaluation={result.evaluation} wordCount={result.wordCount} source={result.source} />
      )}
    </div>
  );
};

export default Dashboard;
