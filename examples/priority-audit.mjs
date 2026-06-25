import assert from 'node:assert/strict';
import { priorityBreakdown } from '../js/scoring.js';

const config = {
  stateWeights: { Fresh: 4, Linked: 8, Actioned: 3, Archived: 1 },
  completedStates: ['Actioned', 'Archived'],
  today: new Date('2026-01-10T12:00:00'),
};

const memos = [
  {
    title: 'Discovery-call wording',
    state: 'Fresh',
    score: 8,
    metric: 7,
    effort: 2,
    date: '2026-01-10',
  },
  {
    title: 'Benchmark write-up',
    state: 'Linked',
    score: 7,
    metric: 8,
    effort: 3,
    date: '2026-01-13',
  },
  {
    title: 'Archived reset reminder',
    state: 'Archived',
    score: 5,
    metric: 6,
    effort: 1,
    date: '2026-01-05',
  },
];

const rankedMemos = memos
  .map((memo) => ({ ...memo, breakdown: priorityBreakdown(memo, config) }))
  .sort((a, b) => b.breakdown.total - a.breakdown.total);

assert.equal(rankedMemos[0].title, 'Discovery-call wording');
assert.equal(rankedMemos[0].breakdown.total, 95);
assert.equal(rankedMemos[2].breakdown.completed, true);

console.log('Memo priority audit');
for (const [index, memo] of rankedMemos.entries()) {
  const { total, scoreImpact, recallImpact, dueBoost, stateImpact, frictionImpact } = memo.breakdown;
  console.log(
    `${index + 1}. ${memo.title}: total=${total} ` +
      `(score=${scoreImpact}, recall=${recallImpact}, due=${dueBoost}, state=${stateImpact}, friction=${frictionImpact})`,
  );
}
