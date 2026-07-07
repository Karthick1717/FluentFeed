import React, { useEffect, useRef } from 'react';

/**
 * Renders live mic amplitude as animated bars using the Web Audio API.
 * Falls back to a gentle idle pulse when not actively listening.
 */
const BAR_COUNT = 28;

const Waveform = ({ stream, active }) => {
  const barsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!stream || !active) return undefined;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const step = Math.floor(dataArray.length / BAR_COUNT) || 1;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const value = dataArray[i * step] || 0;
        const height = 6 + (value / 255) * 46;
        bar.style.height = `${height}px`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      audioCtx.close();
    };
  }, [stream, active]);

  return (
    <div className={`waveform ${active ? 'is-active' : 'is-idle'}`}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span key={i} ref={(el) => (barsRef.current[i] = el)} className="wave-bar" />
      ))}
    </div>
  );
};

export default Waveform;
