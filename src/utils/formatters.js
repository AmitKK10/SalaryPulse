export function currency(value, settings) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: settings.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function hours(value) {
  return `${(Number(value) || 0).toFixed(2)}h`;
}

export function percent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}
