// app/problem/[slug]/page.js
import Link from 'next/link';
import db from '@/lib/db';
import SubmissionForm from './SubmissionForm';

export default async function ProblemPage({ params }) {
  const { slug } = await params;

  const problem = db.prepare('SELECT * FROM problems WHERE slug = ?').get(slug);

  if (!problem) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Problem not found.</p>
        <Link href="/">← Back to problems</Link>
      </main>
    );
  }

  const rubricItems = db
    .prepare('SELECT criterion, description FROM rubric_items WHERE problem_id = ?')
    .all(problem.id);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/" style={{ color: '#555' }}>
        ← Back to problems
      </Link>
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>

      <h3>What a strong solution covers:</h3>
      <ul>
        {rubricItems.map((r, i) => (
          <li key={i}>
            <strong>{r.criterion}:</strong> {r.description}
          </li>
        ))}
      </ul>

      <SubmissionForm slug={slug} />
    </main>
  );
}