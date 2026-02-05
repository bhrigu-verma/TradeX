// ============================================================================
// TRADERX TRACKER DASHBOARD - FINTECH EDITION
// ============================================================================
// Professional grade UI with Glassmorphism and SVG icons
// Real-time sentiment analysis
// ============================================================================

class TrackerDashboard {
  constructor() {
    // Load saved tickers or use defaults
    const savedTickers = localStorage.getItem('traderx_pulse_tickers');
    this.tickers = savedTickers ? JSON.parse(savedTickers) : ['BTC', 'ETH', 'TSLA', 'NVDA'];

    this.updateInterval = 30000;
    this.intervalId = null;
    this.isVisible = true;
    this.isMinimized = false;
    this.element = null;

    // Card data state (enhanced)
    this.cardData = {};
    this.tickers.forEach(ticker => {
      this.cardData[ticker] = {
        status: 'LOADING',
        sentiment: 0,
        lastUpdated: null,
        sampleSize: 0,
        isStale: false,
        tweets: [], // Store actual tweets for click-through
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0
      };
    });
  }

  init() {
    this.createDashboard();
    this.startTracking();
  }

  createDashboard() {
    if (document.getElementById('traderx-tracker-dashboard')) {
      this.element = document.getElementById('traderx-tracker-dashboard');
      return;
    }

    const dashboard = document.createElement('div');
    dashboard.id = 'traderx-tracker-dashboard';
    dashboard.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        #traderx-tracker-dashboard {
          position: fixed;
          top: 80px;
          left: 20px;
          width: 320px; /* Slightly wider */
          max-height: 500px;
          background: #001233; /* Abyssal */
          border: 1px solid #0466c8;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.4);
          z-index: 9998;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #e0e7ff;
          overflow: hidden;
          transition: height 0.3s ease, width 0.3s ease;
          resize: both;
        }
        
        #traderx-tracker-dashboard.minimized {
          height: 56px;
          max-height: 56px;
        }
        
        #traderx-tracker-dashboard.hidden {
          display: none;
        }
        
        .td-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: linear-gradient(135deg, #002855 0%, #001845 100%);
          cursor: grab;
          user-select: none;
          border-bottom: 1px solid #023e7d;
        }
        
        .td-header:active {
          cursor: grabbing;
        }
        
        .td-title {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .td-title svg {
          stroke: #0466c8;
        }
        
        .td-controls {
          display: flex;
          gap: 8px;
        }
        
        .td-btn {
          background: rgba(4, 102, 200, 0.1);
          border: 1px solid transparent;
          color: #979dac;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 6px;
        }
        
        .td-btn:hover {
          background: rgba(4, 102, 200, 0.2);
          color: #ffffff;
          border-color: #0466c8;
        }
        
        .td-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          overflow-x: hidden;
          background: #001233;
        }
        
        .td-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .td-content::-webkit-scrollbar-track {
          background: #001845;
        }
        
        .td-content::-webkit-scrollbar-thumb {
          background: #33415c;
          border-radius: 3px;
        }
        
        /* Cards */
        .td-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #1a2c4e;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
        }
        
        .td-card:hover {
          border-color: #0466c8;
          background: rgba(4, 102, 200, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .td-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .td-ticker-info {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .td-ticker {
          font-family: inherit;
          font-weight: 700;
          font-size: 15px;
          color: #ffffff;
        }
        
        .td-card.volume-spike {
          border-color: #0466c8 !important;
          box-shadow: 0 0 15px rgba(4, 102, 200, 0.3);
        }
        
        .td-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .td-badge.bullish {
          background: rgba(4, 102, 200, 0.2);
          color: #4cc9f0;
          border: 1px solid rgba(4, 102, 200, 0.4);
        }
        
        .td-badge.bearish {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .td-badge.neutral {
          background: rgba(125, 133, 151, 0.1);
          color: #979dac;
          border: 1px solid rgba(125, 133, 151, 0.3);
        }
        
        .td-badge.volatile {
          background: rgba(255, 159, 28, 0.1);
          color: #ffb703;
          border: 1px solid rgba(255, 159, 28, 0.3);
        }
        
        .td-meter {
          height: 4px;
          background: #002855;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
          position: relative;
        }
        
        .td-meter-fill {
          height: 100%;
          border-radius: 4px;
          transition: all 0.5s ease;
          position: absolute;
          top: 0;
        }
        
        /* Center origin meter */
        .td-meter-center {
          width: 2px;
          height: 100%;
          background: #33415c;
          position: absolute;
          left: 50%;
          top: 0;
          z-index: 1;
        }
        
        .td-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #7d8597;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }
        
        .td-footer {
          padding: 12px 20px;
          background: #001233;
          border-top: 1px solid #1a2c4e;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .td-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #5c677d;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        
        .td-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0466c8;
          box-shadow: 0 0 8px rgba(4, 102, 200, 0.5);
          animation: livePulse 2s infinite;
        }
        
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .td-dot.loading {
          background: #ffb703;
          box-shadow: 0 0 8px rgba(255, 183, 3, 0.5);
        }
      </style>
      
      <div class="td-header" id="td-header">
        <div class="td-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Market Pulse
        </div>
        <div class="td-controls">
          <button class="td-btn" id="td-manage" title="Manage Tickers">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </button>
          <button class="td-btn" id="td-refresh" title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button class="td-btn" id="td-minimize" title="Minimize">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="td-content" id="td-cards">
        ${this.tickers.map(ticker => this.createCardHTML(ticker)).join('')}
      </div>
      
      <div class="td-footer">
        <div class="td-status">
          <div class="td-dot" id="td-status-dot"></div>
          <span>LIVE FEED</span>
        </div>
      </div>
    `;

    document.body.appendChild(dashboard);
    this.element = dashboard;
    this.setupEventListeners();
  }

  createCardHTML(ticker) {
    const data = this.cardData[ticker];
    const { badgeClass, icon, label } = this.getStatusConfig(data.status);

    // Calculate bar position
    // If sentiment > 0, left is 50%, width is sentiment * 50%
    // If sentiment < 0, left is 50% - (adjust), width is sentiment * 50%
    const sentiment = data.sentiment || 0;
    const barWidth = Math.min(Math.abs(sentiment) * 50, 50);
    const barLeft = sentiment >= 0 ? 50 : 50 - barWidth;
    const barColor = sentiment >= 0 ? '#10B981' : '#EF4444';

    return `
      <div class="td-card" id="td-card-${ticker}" title="Click to search $${ticker} tweets">
        <div class="td-card-header">
          <div class="td-ticker-info">
            <span class="td-ticker">$${ticker}</span>
            <span class="td-price" id="td-price-${ticker}" style="font-size: 11px; color: #94A3B8; margin-left: 6px;">--</span>
            <span class="td-change" id="td-change-${ticker}" style="font-size: 10px; margin-left: 4px;">--</span>
          </div>
          <div class="td-badge ${badgeClass}" id="td-badge-${ticker}">
            ${icon}
            <span id="td-label-${ticker}">${label}</span>
          </div>
        </div>
        <div class="td-meter">
          <div class="td-meter-center"></div>
          <div class="td-meter-fill" id="td-bar-${ticker}"
               style="left: ${barLeft}%; width: ${barWidth}%; background: ${barColor}">
          </div>
        </div>
        <div class="td-meta">
          <span id="td-vol-${ticker}">${data.sampleSize} tweets</span>
          <span id="td-time-${ticker}">${data.lastUpdated || '--:--'}</span>
        </div>
      </div>
    `;
  }

  getStatusConfig(status) {
    const statusUpper = (status || 'NEUTRAL').toUpperCase();

    if (statusUpper.includes('BULLISH')) {
      return {
        badgeClass: 'bullish',
        label: 'BULLISH',
        icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
      };
    } else if (statusUpper.includes('BEARISH')) {
      return {
        badgeClass: 'bearish',
        label: 'BEARISH',
        icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>'
      };
    } else if (statusUpper.includes('VOL')) {
      return {
        badgeClass: 'volatile',
        label: 'VOLATILE',
        icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>'
      };
    } else if (statusUpper.includes('LOADING')) {
      return {
        badgeClass: 'neutral',
        label: 'SYNCING',
        icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"></path></svg>'
      };
    } else {
      return {
        badgeClass: 'neutral',
        label: 'NEUTRAL',
        icon: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
      };
    }
  }

  updateCardUI(ticker, data) {
    const card = document.getElementById(`td-card-${ticker}`);
    if (!card) return;

    // Update badge info
    const { badgeClass, icon, label } = this.getStatusConfig(data.status);
    const badge = document.getElementById(`td-badge-${ticker}`);
    if (badge) {
      badge.className = `td-badge ${badgeClass}`;
      badge.innerHTML = `${icon} <span>${label}</span>`;
    }

    // Update metric bars
    const bar = document.getElementById(`td-bar-${ticker}`);
    if (bar) {
      const sentiment = data.sentiment || 0;
      const barWidth = Math.min(Math.abs(sentiment) * 50, 50);
      const barLeft = sentiment >= 0 ? 50 : 50 - barWidth;
      const barColor = sentiment >= 0 ? '#10B981' : '#EF4444';

      bar.style.width = `${barWidth}%`;
      bar.style.left = `${barLeft}%`;
      bar.style.background = barColor; // Dynamic color update
    }

    // Update meta - show influencer count if available
    const vol = document.getElementById(`td-vol-${ticker}`);
    if (vol) {
      let metaText = `${data.sampleSize || 0} tweets`;
      if (data.influencerCount > 0) {
        metaText += ` (${data.influencerCount} 👤)`;
      }
      vol.textContent = metaText;
    }

    const time = document.getElementById(`td-time-${ticker}`);
    if (time) time.textContent = data.lastUpdated;

    // Apply volume spike indicator
    if (data.volumeSpike) {
      card.classList.add('volume-spike');
      card.style.position = 'relative';
    } else {
      card.classList.remove('volume-spike');
    }
  }


  // ... (Rest of logic: startTracking, refreshAll, etc. mostly same but calling updateCardUI)

  setupEventListeners() {
    document.getElementById('td-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });

    // Dragging functionality
    const header = document.getElementById('td-header');
    const dashboard = this.element;
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return; // Don't drag when clicking buttons

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = dashboard.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      header.style.cursor = 'grabbing';
      dashboard.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // Keep within viewport bounds
      const maxX = window.innerWidth - dashboard.offsetWidth;
      const maxY = window.innerHeight - dashboard.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      dashboard.style.left = newX + 'px';
      dashboard.style.top = newY + 'px';
      dashboard.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'grab';
        dashboard.style.transition = 'all 0.3s ease';
      }
    });

    document.getElementById('td-refresh').addEventListener('click', (e) => {
      e.stopPropagation();
      this.refreshAll();
    });

    document.getElementById('td-manage').addEventListener('click', (e) => {
      e.stopPropagation();
      this.showManageTickersDialog();
    });

    // Add click handlers to all cards
    this.tickers.forEach(ticker => {
      const card = document.getElementById(`td-card-${ticker}`);
      if (card) {
        card.addEventListener('click', () => this.openTickerSearch(ticker));
      }
    });
  }

  openTickerSearch(ticker) {
    console.log(`[TrackerDashboard] Opening tweets for $${ticker}`);

    const data = this.cardData[ticker];
    if (!data || !data.tweets || data.tweets.length === 0) {
      // No tweets yet, open search
      const query = encodeURIComponent(`$${ticker} lang:en min_faves:1 -filter:replies -filter:retweets`);
      window.open(`https://x.com/search?q=${query}&src=typed_query&f=live`, '_blank');
      return;
    }

    // Show modal with analyzed tweets
    this.showTweetsModal(ticker, data);
  }

  showTweetsModal(ticker, data) {
    // Remove existing modal if any
    const existing = document.getElementById('traderx-tweets-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'traderx-tweets-modal';
    modal.innerHTML = `
      <style>
        #traderx-tweets-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .tweets-modal-content {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .tweets-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .tweets-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #F8FAFC;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .tweets-modal-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #94A3B8;
        }
        
        .tweets-modal-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .tweets-modal-close {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .tweets-modal-close:hover {
          background: #334155;
          color: #F8FAFC;
        }
        
        .tweets-modal-body {
          padding: 16px 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .tweet-item {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }
        
        .tweet-item:hover {
          background: rgba(30, 41, 59, 0.8);
          border-color: #00ADB5;
        }
        
        .tweet-author {
          font-weight: 600;
          color: #00ADB5;
          font-size: 13px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .tweet-text {
          color: #E2E8F0;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        
        .tweet-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748B;
        }
        
        .tweet-sentiment {
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
        }
        
        .tweet-sentiment.bullish {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }
        
        .tweet-sentiment.bearish {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }
        
        .tweet-sentiment.neutral {
          background: rgba(148, 163, 184, 0.2);
          color: #94A3B8;
        }
        
        .influencer-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #60A5FA;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
      </style>
      
      <div class="tweets-modal-content">
        <div class="tweets-modal-header">
          <div>
            <div class="tweets-modal-title">
              <span>$${ticker} Analysis</span>
              <span class="td-badge ${this.getStatusConfig(data.status).badgeClass}">
                ${this.getStatusConfig(data.status).icon}
                ${data.status}
              </span>
            </div>
            <div class="tweets-modal-stats">
              <div class="tweets-modal-stat">
                <span>🟢 ${data.bullishCount || 0} Bullish</span>
              </div>
              <div class="tweets-modal-stat">
                <span>🔴 ${data.bearishCount || 0} Bearish</span>
              </div>
              <div class="tweets-modal-stat">
                <span>⚪ ${data.neutralCount || 0} Neutral</span>
              </div>
              ${data.influencerCount > 0 ? `<div class="tweets-modal-stat"><span>👤 ${data.influencerCount} Influencers</span></div>` : ''}
            </div>
          </div>
          <button class="tweets-modal-close" id="close-tweets-modal">×</button>
        </div>
        
        <div class="tweets-modal-body">
          ${this.renderTweets(data.tweets, ticker)}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('close-tweets-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  renderTweets(tweets, ticker) {
    if (!tweets || tweets.length === 0) {
      return '<p style="color: #64748B; text-align: center; padding: 40px;">No tweets analyzed yet.</p>';
    }

    const engine = window.TraderXAnalysisEngine;

    return tweets.slice(0, 50).map(tweet => {
      const text = typeof tweet === 'string' ? tweet : (tweet.text || tweet.content || '');
      const author = typeof tweet === 'object' ? (tweet.author || tweet.username || 'Unknown') : 'Unknown';

      // Get sentiment
      let score = 0;
      if (engine) {
        score = engine.analyzeText(text);
      }

      let sentimentClass = 'neutral';
      let sentimentLabel = 'Neutral';
      if (score > 0.2) {
        sentimentClass = 'bullish';
        sentimentLabel = 'Bullish';
      } else if (score < -0.2) {
        sentimentClass = 'bearish';
        sentimentLabel = 'Bearish';
      }

      // Check if influencer
      const influencerInfo = engine ? engine.getInfluencerInfo(author) : null;

      return `
        <div class="tweet-item">
          <div class="tweet-author">
            @${author}
            ${influencerInfo ? `<span class="influencer-badge">${influencerInfo.label}</span>` : ''}
          </div>
          <div class="tweet-text">${this.escapeHtml(text)}</div>
          <div class="tweet-meta">
            <span class="tweet-sentiment ${sentimentClass}">${sentimentLabel}</span>
            <span>Score: ${score.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  showManageTickersDialog() {
    const currentTickers = this.tickers.join(', ');
    const newTickers = prompt(
      'Enter tickers to track (comma-separated):\nExample: BTC, ETH, TSLA, NVDA, SPY',
      currentTickers
    );

    if (newTickers !== null && newTickers.trim()) {
      const tickerArray = newTickers
        .split(',')
        .map(t => t.trim().toUpperCase().replace('$', ''))
        .filter(t => t.length > 0 && t.length <= 10);

      if (tickerArray.length > 0) {
        this.tickers = tickerArray;
        localStorage.setItem('traderx_pulse_tickers', JSON.stringify(this.tickers));

        // Reinitialize
        this.cardData = {};
        this.tickers.forEach(ticker => {
          this.cardData[ticker] = {
            status: 'LOADING',
            sentiment: 0,
            lastUpdated: null,
            sampleSize: 0,
            isStale: false,
            tweets: [],
            bullishCount: 0,
            bearishCount: 0,
            neutralCount: 0
          };
        });

        // Rebuild UI
        const cardsContainer = document.getElementById('td-cards');
        if (cardsContainer) {
          cardsContainer.innerHTML = this.tickers.map(ticker => this.createCardHTML(ticker)).join('');
          this.setupEventListeners();
          this.refreshAll();
        }
      }
    }
  }


  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('minimized', this.isMinimized);
  }

  startTracking() {
    this.refreshAll();
    this.intervalId = setInterval(() => this.refreshAll(), this.updateInterval);
  }

  async refreshAll() {
    const dot = document.getElementById('td-status-dot');
    if (dot) dot.classList.add('loading');

    for (const ticker of this.tickers) {
      this.updateCardUI(ticker, { status: 'LOADING' });
      await this.updateTicker(ticker);
      await new Promise(r => setTimeout(r, 200));
    }

    if (dot) dot.classList.remove('loading');
  }

  async updateTicker(ticker) {
    try {
      const fetcher = window.TraderXFetcher;

      // Fetch MORE tweets (request 100 instead of default 20)
      const tweets = fetcher ? await fetcher.fetchTickerTweets(ticker, {
        maxTweets: 100,  // Request 100 tweets
        includeRetweets: false,
        includeReplies: false
      }) : [];

      const engine = window.TraderXAnalysisEngine;
      let analysis;

      if (engine && tweets.length > 0) {
        analysis = await engine.analyzeTicker(tweets);

        // Calculate detailed breakdown
        const bullishCount = tweets.filter(t => {
          const score = engine.analyzeText(t.text);
          return score > 0.2;
        }).length;

        const bearishCount = tweets.filter(t => {
          const score = engine.analyzeText(t.text);
          return score < -0.2;
        }).length;

        const neutralCount = tweets.length - bullishCount - bearishCount;

        this.cardData[ticker] = {
          status: analysis.status,
          sentiment: analysis.sentiment,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sampleSize: analysis.sampleSize,
          tweets: tweets, // Store for click-through
          bullishCount,
          bearishCount,
          neutralCount,
          volumeSpike: analysis.volumeSpike || false,
          influencerCount: analysis.influencerCount || 0
        };
      } else {
        this.cardData[ticker] = {
          status: 'NEUTRAL',
          sentiment: 0,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sampleSize: tweets.length,
          tweets: tweets,
          bullishCount: 0,
          bearishCount: 0,
          neutralCount: tweets.length,
          volumeSpike: false,
          influencerCount: 0
        };
      }

      this.updateCardUI(ticker, this.cardData[ticker]);

      // Also fetch price data
      this.updatePriceUI(ticker);

    } catch (e) {
      console.error('[TrackerDashboard] Error updating ticker:', e);
      this.updateCardUI(ticker, { status: 'ERROR', sampleSize: 0 });
    }
  }

  async updatePriceUI(ticker) {
    const priceFetcher = window.TraderXPriceFetcher;
    if (!priceFetcher) return;

    try {
      const priceData = await priceFetcher.getPrice(ticker);

      const priceEl = document.getElementById(`td-price-${ticker}`);
      const changeEl = document.getElementById(`td-change-${ticker}`);

      if (priceEl && priceData.price !== null) {
        priceEl.textContent = priceFetcher.formatPrice(priceData.price, priceData.type);
      }

      if (changeEl && priceData.change24h !== null) {
        changeEl.textContent = priceFetcher.formatChange(priceData.change24h);
        changeEl.style.color = priceFetcher.getChangeColor(priceData.change24h);
      }
    } catch (e) {
      console.warn(`[TrackerDashboard] Price fetch failed for ${ticker}:`, e);
    }
  }

  // Public APIs
  toggle() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) this.element.classList.remove('hidden');
    else this.element.classList.add('hidden');
  }
}

// Init
window.TraderXTrackerDashboard = window.TraderXTrackerDashboard || new TrackerDashboard();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.TraderXTrackerDashboard.init());
} else {
  setTimeout(() => window.TraderXTrackerDashboard.init(), 1000);
}
