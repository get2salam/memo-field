import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, daysFromToday, priority } from '../js/scoring.js';

const CONFIG = {
  stateWeights: { Fresh: 4, Linked: 8, Actioned: 3, Archived: 1 },
  completedStates: ['Actioned', 'Archived'],
  today: new Date('2026-01-10T12:00:00'),
};

test('clamp keeps values inside the inclusive bounds', () => {
  assert.equal(clamp(5, 1, 10), 5);
  assert.equal(clamp(-3, 1, 10), 1);
  assert.equal(clamp(99, 1, 10), 10);
  assert.equal(clamp('7', 1, 10), 7);
});

test('daysFromToday returns 999 for missing or unparseable dates', () => {
  assert.equal(daysFromToday(''), 999);
  assert.equal(daysFromToday(null), 999);
  assert.equal(daysFromToday('not-a-date'), 999);
});

test('daysFromToday measures whole days from a fixed anchor', () => {
  const anchor = new Date('2026-01-10T12:00:00');
  assert.equal(daysFromToday('2026-01-10', anchor), 0);
  assert.equal(daysFromToday('2026-01-13', anchor), 3);
  assert.equal(daysFromToday('2026-01-05', anchor), -5);
});

test('priority rewards higher score and recall value', () => {
  const base = { score: 5, effort: 3, metric: 5, state: 'Fresh', date: '2030-01-01' };
  const stronger = { ...base, score: 9, metric: 9 };
  assert.ok(priority(stronger, CONFIG) > priority(base, CONFIG));
});

test('priority penalises high friction (effort)', () => {
  const easy = { score: 6, effort: 1, metric: 6, state: 'Fresh', date: '2030-01-01' };
  const hard = { ...easy, effort: 9 };
  assert.ok(priority(easy, CONFIG) > priority(hard, CONFIG));
});

test('priority surfaces memos that are due today over far-future ones', () => {
  const dueToday = { score: 6, effort: 3, metric: 6, state: 'Fresh', date: '2026-01-10' };
  const future = { ...dueToday, date: '2026-02-10' };
  assert.ok(priority(dueToday, CONFIG) > priority(future, CONFIG));
});

test('priority skips the due-soon boost for completed memos', () => {
  const completedDue = { score: 6, effort: 3, metric: 6, state: 'Actioned', date: '2026-01-10' };
  const activeDue = { ...completedDue, state: 'Fresh' };
  assert.ok(priority(activeDue, CONFIG) > priority(completedDue, CONFIG));
});

test('priority falls back to zero state weight for unknown states', () => {
  const item = { score: 5, effort: 3, metric: 5, state: 'Mystery', date: '2030-01-01' };
  assert.equal(priority(item, CONFIG), 5 * 6 + 5 * 5 - 3 * 4);
});
