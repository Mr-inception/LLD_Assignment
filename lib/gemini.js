// lib/gemini.js
import { GoogleGenAI } from '@google/genai';

let ai;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function evaluateSubmission({ problem, rubricItems, submissionText }) {
  const rubricList = rubricItems
    .map((r, i) => `${i + 1}. ${r.criterion}: ${r.description}`)
    .join('\n');

  const prompt = `You are an LLD (Low-Level Design) reviewer evaluating a learner's solution.

PROBLEM: ${problem.title}
${problem.description}

RUBRIC (evaluate the submission strictly against these criteria, nothing else):
${rubricList}

LEARNER'S SUBMISSION:
"""
${submissionText}
"""

For EACH rubric item, decide if it is "covered", "partial", or "missing" in the submission, and give a one-sentence reason grounded in what the learner actually wrote (quote or paraphrase specific parts of their submission — do not give generic advice).

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "overall_summary": "2-3 sentence summary of the submission's strengths and biggest gap",
  "items": [
    { "criterion": "string (must match rubric criterion exactly)", "status": "covered" | "partial" | "missing", "reason": "string" }
  ]
}`;

    const response = await getClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned non-JSON output: ${cleaned.slice(0, 300)}`);
  }
}