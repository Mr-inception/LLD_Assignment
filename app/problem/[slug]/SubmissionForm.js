// app/problem/[slug]/SubmissionForm.js
'use client';

import { useState } from 'react';

const statusColors = {
  covered: '#1a7f37',
  partial: '#9a6700',
  missing: '#cf222e',
};

export default function SubmissionForm({ slug }) {
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, submissionText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setFeedback(data.feedback);
      }
    } catch (err) {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="submission" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Your design (classes, relationships, key decisions):
        </label>
        <textarea
          id="submission"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          rows={10}
          style={{ width: '100%', padding: '0.75rem', fontFamily: 'monospace', fontSize: 14 }}
          placeholder="e.g. I'll have a ParkingLot class with a list of spots..."
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            background: loading ? '#999' : '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Evaluating…' : 'Submit for feedback'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#cf222e', marginTop: '1rem' }}>Error: {error}</p>
      )}

      {feedback && (
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
          <h2>Feedback</h2>
          <p>{feedback.overall_summary}</p>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {feedback.items.map((item, i) => (
              <li
                key={i}
                style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  border: `1px solid ${statusColors[item.status] || '#ccc'}`,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{item.criterion}</span>
                  <span style={{ color: statusColors[item.status] || '#333', textTransform: 'uppercase', fontSize: 12 }}>
                    {item.status}
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0 0 0', color: '#444' }}>{item.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}