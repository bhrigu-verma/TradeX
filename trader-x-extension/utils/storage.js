import { DEFAULT_SETTINGS } from './constants.js';

/* global chrome */

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      resolve(settings);
    });
  });
}

export async function getSetting(key) {
  const settings = await getSettings();
  return settings[key];
}

export async function updateSettings(updates) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(updates, () => resolve());
  });
}

export async function resetSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.clear(() => {
      chrome.storage.sync.set(DEFAULT_SETTINGS, () => resolve());
    });
  });
}

export async function exportSettings() {
  const settings = await getSettings();
  return JSON.stringify(settings, null, 2);
}

export async function importSettings(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    await updateSettings(parsed);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function incrementStat(statKey, amount = 1) {
  const settings = await getSettings();
  const stats = settings.stats || DEFAULT_SETTINGS.stats;

  if (statKey.includes('.')) {
    const [parent, child] = statKey.split('.');
    stats[parent] = stats[parent] || {};
    stats[parent][child] = (stats[parent][child] || 0) + amount;
  } else {
    stats[statKey] = (stats[statKey] || 0) + amount;
  }

  stats.totalFiltered = (stats.totalFiltered || 0) + amount;

  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.filteredToday = 0;
    stats.lastResetDate = today;
  }
  stats.filteredToday += amount;

  await updateSettings({ stats });
}

export async function pushRecentActivity(entry) {
  const settings = await getSettings();
  const stats = settings.stats || DEFAULT_SETTINGS.stats;
  stats.recentActivity = stats.recentActivity || [];
  stats.recentActivity.unshift({
    ...entry,
    timestamp: new Date().toISOString()
  });
  stats.recentActivity = stats.recentActivity.slice(0, 5);
  await updateSettings({ stats });
}
