import { getSetting } from './storage.js';

let debugEnabledCache = null;

async function isDebugEnabled() {
  if (debugEnabledCache !== null) return debugEnabledCache;
  debugEnabledCache = await getSetting('debugMode');
  return debugEnabledCache;
}

export async function log(...args) {
  if (await isDebugEnabled()) {
    console.log('[LFC]', ...args);
  }
}

export async function warn(...args) {
  if (await isDebugEnabled()) {
    console.warn('[LFC]', ...args);
  }
}

export async function error(...args) {
  console.error('[LFC]', ...args);
}

export function resetDebugCache() {
  debugEnabledCache = null;
}
