export function currency(value, settings) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: settings.currency || 'INR',
maximumFractionDigits: 2,
minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function hours(value) {
  return `${(Number(value) || 0).toFixed(2)}h`;
}

export function hoursMinutes(value) {
  const totalMinutes = Math.max(Math.round((Number(value) || 0) * 60), 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function percent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

export function precisePercent(value) {
  return `${(Number(value) || 0).toFixed(2)}%`;
}
