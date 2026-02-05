// === TRADERX POPUP SCRIPT ===

// Get market status
function getMarketStatus() {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = et.getHours();
    const minute = et.getMinutes();
    const time = hour + minute / 60;
    const day = et.getDay();

    if (day === 0 || day === 6) return '😴 Closed';
    if (time >= 4 && time < 9.5) return '🌅 Pre-Market';
    if (time >= 9.5 && time < 16) return '📈 Market Open';
    if (time >= 16 && time < 20) return '🌙 After Hours';
    return '😴 Closed';
}

// Load config
async function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['config'], (result) => {
            resolve(result.config || {
                watchlist: [],
                filters: {
                    enableSpamFilter: true,
                    enableWatchlistHighlight: true,
                    enableTierColors: true,
                    enableTimeSensitive: true
                },
                ui: { showSidebar: true }
            });
        });
    });
}

async function saveConfig(config) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ config }, resolve);
    });
}

// Initialize
async function init() {
    const config = await getConfig();

    document.getElementById('market-status').textContent = getMarketStatus();

    // Load toggles
    document.getElementById('toggle-spam').checked = config.filters?.enableSpamFilter ?? true;
    document.getElementById('toggle-watchlist').checked = config.filters?.enableWatchlistHighlight ?? true;
    document.getElementById('toggle-tiers').checked = config.filters?.enableTierColors ?? true;
    document.getElementById('toggle-time').checked = config.filters?.enableTimeSensitive ?? true;
    document.getElementById('toggle-sidebar').checked = config.ui?.showSidebar ?? true;

    renderWatchlist(config.watchlist || []);
    loadStats();
    setupEventListeners();
}

// Render watchlist
function renderWatchlist(watchlist) {
    const container = document.getElementById('watchlist-container');

    if (!watchlist || watchlist.length === 0) {
        container.innerHTML = '<div class="empty-state">No tickers yet - add one above!</div>';
        return;
    }

    container.innerHTML = '';
    watchlist.forEach(ticker => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `$${ticker} <span class="tag-remove">×</span>`;
        tag.onclick = () => removeTicker(ticker);
        container.appendChild(tag);
    });
}

// Load stats
async function loadStats() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && (tab.url?.includes('x.com') || tab.url?.includes('twitter.com'))) {
            chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
                if (response) {
                    document.getElementById('stat-hidden').textContent = response.hiddenCount || 0;
                    document.getElementById('stat-alerts').textContent = response.alertCount || 0;
                    document.getElementById('stat-watchlist').textContent = response.watchlistMentions || 0;
                }
            });
        }
    } catch (e) {
        console.log('Could not load stats:', e);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Toggle handlers
    const toggles = [
        { id: 'toggle-spam', key: 'enableSpamFilter' },
        { id: 'toggle-watchlist', key: 'enableWatchlistHighlight' },
        { id: 'toggle-tiers', key: 'enableTierColors' },
        { id: 'toggle-time', key: 'enableTimeSensitive' }
    ];

    toggles.forEach(({ id, key }) => {
        document.getElementById(id).addEventListener('change', async (e) => {
            const config = await getConfig();
            config.filters = config.filters || {};
            config.filters[key] = e.target.checked;
            await saveConfig(config);
        });
    });

    document.getElementById('toggle-sidebar').addEventListener('change', async (e) => {
        const config = await getConfig();
        config.ui = config.ui || {};
        config.ui.showSidebar = e.target.checked;
        await saveConfig(config);
    });

    // Add ticker
    document.getElementById('add-ticker').addEventListener('click', addTicker);
    document.getElementById('ticker-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTicker();
    });

    // Search
    document.getElementById('search-btn').addEventListener('click', searchTicker);
    document.getElementById('search-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchTicker();
    });

    // Buttons
    document.getElementById('open-settings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById('refresh-feed').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) chrome.tabs.reload(tab.id);
    });

    document.getElementById('view-alerts').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'alerts.html' });
    });
}

// Add ticker
async function addTicker() {
    const input = document.getElementById('ticker-input');
    const successMsg = document.getElementById('add-success');
    const ticker = input.value.trim().toUpperCase().replace(/^\$/, '');

    if (!ticker || !/^[A-Z]{1,10}$/.test(ticker)) {
        input.style.borderColor = '#EF4444';
        setTimeout(() => { input.style.borderColor = ''; }, 1000);
        return;
    }

    const config = await getConfig();
    config.watchlist = config.watchlist || [];

    if (!config.watchlist.includes(ticker)) {
        config.watchlist.push(ticker);
        await saveConfig(config);
        renderWatchlist(config.watchlist);

        // Show success
        successMsg.textContent = `✓ $${ticker} added to watchlist!`;
        successMsg.style.display = 'block';
        setTimeout(() => { successMsg.style.display = 'none'; }, 2000);
    } else {
        successMsg.textContent = `$${ticker} is already in watchlist`;
        successMsg.style.background = 'rgba(251, 191, 36, 0.2)';
        successMsg.style.color = '#FBBF24';
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
            successMsg.style.background = '';
            successMsg.style.color = '';
        }, 2000);
    }

    input.value = '';
}

// Remove ticker
async function removeTicker(ticker) {
    const config = await getConfig();
    config.watchlist = (config.watchlist || []).filter(t => t !== ticker);
    await saveConfig(config);
    renderWatchlist(config.watchlist);
}

// Search ticker
async function searchTicker() {
    const input = document.getElementById('search-input');
    const status = document.getElementById('search-status');
    const ticker = input.value.trim().toUpperCase().replace(/^\$/, '');

    if (!ticker) {
        status.textContent = '';
        return;
    }

    if (!/^[A-Z]{1,10}$/.test(ticker)) {
        status.textContent = '❌ Invalid ticker format';
        status.className = 'search-status';
        return;
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && (tab.url?.includes('x.com') || tab.url?.includes('twitter.com'))) {
            chrome.tabs.sendMessage(tab.id, { action: 'searchTicker', ticker }, (response) => {
                if (response?.success) {
                    status.textContent = `🔍 Filtering posts for $${ticker}`;
                    status.className = 'search-status active';
                }
            });
        } else {
            status.textContent = '⚠️ Open x.com first';
            status.className = 'search-status';
        }
    } catch (e) {
        status.textContent = '⚠️ Could not search';
    }
}

document.addEventListener('DOMContentLoaded', init);
