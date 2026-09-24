// app/api/submit/route.js
import db from '@/lib/db';
import { evaluateSubmission } from '@/lib/gemini';

export async function POST(request) {
  const body = await request.json();
  const { slug, submissionText } = body;

  if (!slug || !submissionText || !submissionText.trim()) {
    return Response.json({ error: 'slug and submissionText are required' }, { status: 400 });
  }

  const problem = db.prepare('SELECT * FROM problems WHERE slug = ?').get(slug);
  if (!problem) {
    return Response.json({ error: 'Problem not found' }, { status: 404 });
  }

  const rubricItems = db
    .prepare('SELECT id, criterion, description FROM rubric_items WHERE problem_id = ?')
    .all(problem.id);

  const insertSubmission = db.prepare(
    'INSERT INTO submissions (problem_id, content) VALUES (?, ?)'
  );
  const { lastInsertRowid: submissionId } = insertSubmission.run(problem.id, submissionText);

  let result;
  try {
    result = await evaluateSubmission({ problem, rubricItems, submissionText });
  } catch (err) {
    console.error('Gemini evaluation failed:', err);
    return Response.json({ error: 'Feedback generation failed' }, { status: 502 });
  }

  db.prepare('INSERT INTO feedback (submission_id, result_json) VALUES (?, ?)').run(
    submissionId,
    JSON.stringify(result)
  );

  return Response.json({ submissionId, feedback: result });
}