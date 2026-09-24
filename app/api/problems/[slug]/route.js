// app/api/problems/[slug]/route.js
import db from '@/lib/db';

export async function GET(request, { params }) {
  const { slug } = await params;

  const problem = db.prepare('SELECT * FROM problems WHERE slug = ?').get(slug);
  if (!problem) {
    return Response.json({ error: 'Problem not found' }, { status: 404 });
  }

  const rubricItems = db
    .prepare('SELECT id, criterion, description FROM rubric_items WHERE problem_id = ?')
    .all(problem.id);

  return Response.json({ ...problem, rubricItems });
}