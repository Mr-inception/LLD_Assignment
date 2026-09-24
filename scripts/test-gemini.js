// scripts/test-gemini.js
import { config } from 'dotenv';
config({ path: '.env.local' });

const { default: db } = await import('../lib/db.js');
const { evaluateSubmission } = await import('../lib/gemini.js');

const problem = db.prepare('SELECT * FROM problems WHERE slug = ?').get('parking-lot');
const rubricItems = db.prepare('SELECT * FROM rubric_items WHERE problem_id = ?').all(problem.id);

const sampleSubmission = `
I'll have a ParkingLot class that has a list of spots. Each spot has a size (small, medium, large).
When a car comes in, I loop through the spots and find the first empty one that fits the vehicle.
I'll track occupied spots with a boolean. For payment, I calculate hours * rate when the car leaves.
`;

const result = await evaluateSubmission({ problem, rubricItems, submissionText: sampleSubmission });
console.log(JSON.stringify(result, null, 2));