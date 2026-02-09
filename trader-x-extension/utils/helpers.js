export function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit) {
  let inThrottle = false;
  let lastArgs = null;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

export function normalizeText(text) {
  return (text || '').toLowerCase().trim();
}

export function extractText(el) {
  if (!el) return '';
  return el.innerText || el.textContent || '';
}

export function safeQuerySelector(parent, selector) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    return null;
  }
}

export function safeQuerySelectorAll(parent, selector) {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch (error) {
    return [];
  }
}

export function includesKeyword(text, keyword) {
  if (!text || !keyword) return false;
  return normalizeText(text).includes(normalizeText(keyword));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatRelativeDate(date) {
  if (!date) return 'Unknown';
  const now = new Date();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function parseLinkedInTimestamp(text) {
  if (!text) return null;
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;

  const relativeMatch = clean.match(/(\d+)\s*(min|m|hour|h|day|d|week|w|month|mo|year|y)s?/i);
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    const now = new Date();
    const date = new Date(now);
    if (unit.startsWith('m') && !unit.startsWith('mo')) {
      date.setMinutes(now.getMinutes() - value);
    } else if (unit.startsWith('h')) {
      date.setHours(now.getHours() - value);
    } else if (unit.startsWith('d')) {
      date.setDate(now.getDate() - value);
    } else if (unit.startsWith('w')) {
      date.setDate(now.getDate() - value * 7);
    } else if (unit.startsWith('mo')) {
      date.setMonth(now.getMonth() - value);
    } else if (unit.startsWith('y')) {
      date.setFullYear(now.getFullYear() - value);
    }
    return date;
  }

  const parsed = Date.parse(clean);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
}

export function buildHoverCard(contentLines) {
  const container = document.createElement('div');
  container.className = 'lfc-hover-card';
  contentLines.forEach((line) => {
    const item = document.createElement('div');
    item.className = 'lfc-hover-line';
    item.textContent = line;
    container.appendChild(item);
  });
  return container;
}

export function sanitizeText(text) {
  return (text || '').replace(/[<>]/g, '').trim();
}

export function toTitleCase(text) {
  return (text || '').replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function generateId(prefix = 'lfc') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
