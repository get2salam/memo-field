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

export function priority(item, config = {}) {
  const stateWeights = config.stateWeights || {};
  const completedStates = new Set(config.completedStates || []);
  const today = config.today || new Date();
  const completed = completedStates.has(item.state);
  const dueBoost = completed
    ? 0
    : Math.max(0, 4 - Math.max(daysFromToday(item.date, today), 0)) * 4;
  return (
    item.score * 6 +
    item.metric * 5 +
    dueBoost +
    (stateWeights[item.state] ?? 0) -
    item.effort * 4
  );
}
