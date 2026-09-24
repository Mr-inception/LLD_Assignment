// app/page.js
import Link from 'next/link';
import db from '@/lib/db';

export default function Home() {
  const problems = db.prepare('SELECT slug, title, description FROM problems').all();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>LLD Practice Platform</h1>
      <p style={{ color: '#555' }}>
        Pick a problem, write your design, and get AI feedback grounded in a rubric.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {problems.map((p) => (
          <Link
            key={p.slug}
            href={`/problem/${p.slug}`}
            style={{
              display: 'block',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: 8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{p.title}</h2>
            <p style={{ margin: 0, color: '#555' }}>{p.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}