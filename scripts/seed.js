// scripts/seed.js
import db from '../lib/db.js';

const problems = [
  {
    slug: 'parking-lot',
    title: 'Parking Lot System',
    description:
      'Design a parking lot that supports multiple levels, multiple vehicle types (motorcycle, car, bus), and multiple spot sizes. It should track availability, assign the best-fit spot, and calculate a parking fee on exit.',
    rubric: [
      ['Entity modeling', 'Distinct classes for ParkingLot, Level, Spot, Vehicle (with subtypes) rather than one bloated class.'],
      ['Spot allocation strategy', 'A clear strategy for matching vehicle type to spot size/level, ideally pluggable (Strategy pattern) rather than hardcoded if/else.'],
      ['Concurrency / thread-safety', 'Some acknowledgment that two vehicles could compete for the same spot, and how that is handled.'],
      ['Fee calculation', 'A separate, extensible component for pricing rather than logic buried inside the parking flow.'],
      ['Extensibility', 'Adding a new vehicle type or spot type does not require rewriting core logic (Open/Closed Principle).'],
    ],
  },
  {
    slug: 'elevator-system',
    title: 'Elevator System',
    description:
      'Design an elevator system for a building with multiple elevators and multiple floors. It should handle internal and external requests, decide which elevator to dispatch, and manage elevator state (idle, moving, doors open).',
    rubric: [
      ['Entity modeling', 'Distinct classes for Elevator, ElevatorController/Dispatcher, Request, Floor rather than one god class.'],
      ['Dispatch algorithm', 'A clear strategy for choosing which elevator serves a request (e.g. nearest idle, direction-aware), ideally pluggable.'],
      ['State management', 'Explicit elevator states (idle/moving up/moving down/door open) and clean transitions between them.'],
      ['Request queuing', 'A sensible way to queue and order multiple pending requests, not just a flat unsorted list.'],
      ['Extensibility', 'Adding a new dispatch strategy or elevator does not require rewriting the core controller.'],
    ],
  },
];

const insertProblem = db.prepare(
  `INSERT OR IGNORE INTO problems (slug, title, description) VALUES (?, ?, ?)`
);
const insertRubric = db.prepare(
  `INSERT INTO rubric_items (problem_id, criterion, description) VALUES (?, ?, ?)`
);
const getProblemId = db.prepare(`SELECT id FROM problems WHERE slug = ?`);
const countRubric = db.prepare(`SELECT COUNT(*) as c FROM rubric_items WHERE problem_id = ?`);

for (const p of problems) {
  insertProblem.run(p.slug, p.title, p.description);
  const { id } = getProblemId.get(p.slug);

  const { c } = countRubric.get(id);
  if (c === 0) {
    for (const [criterion, description] of p.rubric) {
      insertRubric.run(id, criterion, description);
    }
  }
}

console.log('Seeded problems:');
console.log(db.prepare('SELECT id, slug, title FROM problems').all());
console.log('Rubric item counts:');
console.log(
  db
    .prepare(
      `SELECT p.slug, COUNT(r.id) as rubric_items FROM problems p LEFT JOIN rubric_items r ON r.problem_id = p.id GROUP BY p.id`
    )
    .all()
);