// app/api/problems/route.js
import db from '@/lib/db';

export async function GET() {
  const problems = db.prepare('SELECT id, slug, title, description FROM problems').all();
  return Response.json(problems);
}