const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

export function formatPrice(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '$0.00';
  }

  const amount = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatDelta(value, withSign = true) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0.00%';
  }

  const delta = Number(value);
  const prefix = withSign && delta > 0 ? '+' : '';
  return `${prefix}${delta.toFixed(2)}%`;
}

export function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }

  return compactFormatter.format(Number(value));
}

export function formatAddress(value, visible = 4) {
  if (!value || typeof value !== 'string') {
    return 'N/A';
  }

  const trimmed = value.trim();
  if (trimmed.length <= visible * 2) {
    return trimmed;
  }

  return `${trimmed.slice(0, visible)}...${trimmed.slice(-visible)}`;
}

export function formatTime(value) {
  if (!value) {
    return '--:--';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return timeFormatter.format(date);
}
