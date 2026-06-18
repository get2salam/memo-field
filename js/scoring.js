export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

export function daysFromToday(value, today = new Date()) {
  if (!value) return 999;
  const anchor = new Date(today);
  anchor.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 999;
  return Math.round((target - anchor) / 86400000);
}

export function priorityBreakdown(item, config = {}) {
  const stateWeights = config.stateWeights || {};
  const completedStates = new Set(config.completedStates || []);
  const today = config.today || new Date();
  const completed = completedStates.has(item.state);
  const daysUntilReview = daysFromToday(item.date, today);
  const dueBoost = completed
    ? 0
    : Math.max(0, 4 - Math.max(daysUntilReview, 0)) * 4;
  const scoreImpact = item.score * 6;
  const recallImpact = item.metric * 5;
  const stateImpact = stateWeights[item.state] ?? 0;
  const frictionImpact = item.effort * -4;

  return {
    total: scoreImpact + recallImpact + dueBoost + stateImpact + frictionImpact,
    scoreImpact,
    recallImpact,
    dueBoost,
    stateImpact,
    frictionImpact,
    daysUntilReview,
    completed,
    overdue: !completed && daysUntilReview < 0,
  };
}

export function priority(item, config = {}) {
  return priorityBreakdown(item, config).total;
}
