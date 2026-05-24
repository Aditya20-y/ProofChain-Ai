
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/analyze-image', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const analyzeUrl = async () => {
    if (!url) return;

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/analyze-url', { url });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 900, margin: 'auto' }}>
      <h1 style={{ fontSize: 40 }}>ProofChain AI</h1>
      <p>AI-powered scam, phishing & trust verification platform.</p>

      <div style={{ marginTop: 30, padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
        <h2>Scam Screenshot Detection</h2>

        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button
          onClick={analyzeImage}
          style={{
            marginLeft: 10,
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Analyze Screenshot
        </button>
      </div>

      <div style={{ marginTop: 30, padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
        <h2>Phishing URL Scanner</h2>

        <input
          type="text"
          placeholder="Paste suspicious URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '70%', padding: 10 }}
        />

        <button
          onClick={analyzeUrl}
          style={{
            marginLeft: 10,
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Scan URL
        </button>
      </div>

      {loading && <p style={{ marginTop: 20 }}>Analyzing...</p>}

      {result && (
        <div
          style={{
            marginTop: 30,
            border: '1px solid #ccc',
            padding: 20,
            borderRadius: 10
          }}
        >
          <h2>Analysis Result</h2>

          <p><strong>Risk Score:</strong> {result.riskScore}%</p>
          <p><strong>Threat Type:</strong> {result.threatType}</p>
          <p><strong>Summary:</strong> {result.summary}</p>

          <h3>Detected Signals</h3>

          <ul>
            {result.signals.map((signal: string, idx: number) => (
              <li key={idx}>{signal}</li>
            ))}
          </ul>

          <h3>Recommended Action</h3>
          <p>{result.recommendation}</p>
        </div>
      )}
    </main>
  );
}
