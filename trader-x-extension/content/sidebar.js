// ============================================================================
// TRADERX SIDEBAR - TROPICAL SUNRISE EDITION v2.0
// ============================================================================
// Premium UI with Tropical Sunrise color palette
// Colors: #ff9f1c (Orange), #ffbf69 (Light Orange), #ffffff (White), 
//         #cbf3f0 (Light Cyan), #2ec4b6 (Teal)
// ============================================================================

class TraderXSidebar {
  constructor() {
    this.isVisible = false;
    this.trustedMode = localStorage.getItem('traderx_trusted_mode') === 'true';
    this.createSidebar();
    this.injectStyles();
  }

  // ========================================================================
  // STYLES - TROPICAL SUNRISE THEME
  // ========================================================================
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      #traderx-sidebar {
        position: fixed;
        top: 0;
        right: -360px;
        width: 360px;
        height: 100vh;
        background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 50%, #0d1b2a 100%);
        border-left: 2px solid #2ec4b6;
        z-index: 9999;
        transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: -20px 0 60px rgba(46, 196, 182, 0.15), -5px 0 30px rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      
      #traderx-sidebar.visible {
        right: 0;
      }
      
      /* Header - Gradient with accent */
      .tx-header {
        padding: 24px;
        background: linear-gradient(135deg, #ff9f1c 0%, #ffbf69 100%);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      
      .tx-header::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
        animation: shimmer 3s infinite;
      }
      
      @keyframes shimmer {
        0%, 100% { transform: translateX(-10%) rotate(0deg); }
        50% { transform: translateX(10%) rotate(5deg); }
      }
      
      .tx-title {
        font-size: 20px;
        font-weight: 800;
        color: #0d1b2a;
        display: flex;
        align-items: center;
        gap: 12px;
        letter-spacing: -0.03em;
        text-shadow: 0 2px 10px rgba(255,255,255,0.3);
        z-index: 1;
      }
      
      .tx-title-icon {
        width: 36px;
        height: 36px;
        background: #0d1b2a;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      
      .tx-close {
        background: rgba(0,0,0,0.2);
        border: none;
        color: #0d1b2a;
        cursor: pointer;
        padding: 10px;
        border-radius: 10px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        backdrop-filter: blur(10px);
      }
      
      .tx-close:hover {
        background: rgba(0,0,0,0.3);
        transform: rotate(90deg);
      }
      
      /* Scrollable Content */
      .tx-content {
        flex: 1;
        overflow-y: auto;
        padding-bottom: 20px;
      }
      
      .tx-content::-webkit-scrollbar {
        width: 6px;
      }
      
      .tx-content::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .tx-content::-webkit-scrollbar-thumb {
        background: #2ec4b6;
        border-radius: 3px;
      }
      
      /* Section Styling */
      .tx-section {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(46, 196, 182, 0.2);
      }
      
      .tx-section-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #2ec4b6;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .tx-section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(46, 196, 182, 0.5) 0%, transparent 100%);
      }
      
      /* Toggle Card */
      .tx-toggle-card {
        background: linear-gradient(135deg, rgba(46, 196, 182, 0.15) 0%, rgba(203, 243, 240, 0.1) 100%);
        padding: 18px;
        border-radius: 16px;
        border: 1px solid rgba(46, 196, 182, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.3s;
      }
      
      .tx-toggle-card:hover {
        border-color: #2ec4b6;
        box-shadow: 0 0 20px rgba(46, 196, 182, 0.2);
      }
      
      .tx-toggle-label {
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
      }
      
      .tx-toggle-sub {
        font-size: 12px;
        color: #cbf3f0;
        margin-top: 4px;
        opacity: 0.8;
      }
      
      /* Modern Toggle Switch */
      .tx-switch {
        position: relative;
        width: 52px;
        height: 28px;
      }
      
      .tx-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .tx-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 28px;
        border: 2px solid #475569;
      }
      
      .tx-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 2px;
        bottom: 2px;
        background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      input:checked + .tx-slider {
        background: linear-gradient(135deg, #2ec4b6 0%, #1aa198 100%);
        border-color: #2ec4b6;
      }
      
      input:checked + .tx-slider:before {
        transform: translateX(24px);
        background: linear-gradient(135deg, #ffffff 0%, #cbf3f0 100%);
      }
      
      /* Button Styles */
      .tx-controls {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .tx-btn {
        width: 100%;
        padding: 16px 20px;
        border-radius: 14px;
        border: none;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        position: relative;
        overflow: hidden;
      }
      
      .tx-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .tx-btn:hover::before {
        left: 100%;
      }
      
      .tx-btn-primary {
        background: linear-gradient(135deg, #ff9f1c 0%, #ffbf69 100%);
        color: #0d1b2a;
        box-shadow: 0 4px 20px rgba(255, 159, 28, 0.4);
      }
      
      .tx-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(255, 159, 28, 0.5);
      }
      
      .tx-btn-secondary {
        background: linear-gradient(135deg, #2ec4b6 0%, #1aa198 100%);
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(46, 196, 182, 0.3);
      }
      
      .tx-btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(46, 196, 182, 0.4);
      }
      
      .tx-btn-outline {
        background: transparent;
        border: 2px solid rgba(46, 196, 182, 0.5);
        color: #cbf3f0;
      }
      
      .tx-btn-outline:hover {
        background: rgba(46, 196, 182, 0.15);
        border-color: #2ec4b6;
        color: #ffffff;
      }
      
      /* Export Buttons - Color coded */
      .tx-btn-json {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
      }
      
      .tx-btn-json:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
      }
      
      .tx-btn-csv {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
      }
      
      .tx-btn-csv:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
      }
      
      .tx-btn-ai {
        background: linear-gradient(135deg, #ff9f1c 0%, #f59e0b 100%);
        color: #0d1b2a;
        box-shadow: 0 4px 20px rgba(255, 159, 28, 0.4);
        font-weight: 700;
      }
      
      .tx-btn-ai:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(255, 159, 28, 0.5);
      }
      
      /* Footer */
      .tx-footer {
        padding: 20px 24px;
        background: linear-gradient(180deg, transparent 0%, rgba(46, 196, 182, 0.1) 100%);
        text-align: center;
        border-top: 1px solid rgba(46, 196, 182, 0.2);
      }
      
      .tx-credits {
        font-size: 12px;
        color: rgba(203, 243, 240, 0.7);
        font-weight: 500;
      }
      
      .tx-link {
        color: #2ec4b6;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .tx-link:hover {
        color: #ff9f1c;
        text-shadow: 0 0 10px rgba(255, 159, 28, 0.5);
      }
      
      /* Floating Trigger Button */
      #tx-trigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 18px;
        background: linear-gradient(135deg, #ff9f1c 0%, #ffbf69 100%);
        color: #0d1b2a;
        border: none;
        box-shadow: 0 8px 30px rgba(255, 159, 28, 0.5);
        cursor: pointer;
        z-index: 9990;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #tx-trigger:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 12px 40px rgba(255, 159, 28, 0.6);
      }
      
      #tx-trigger::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 18px;
        background: inherit;
        z-index: -1;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.2); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
      
      /* Stats Pill */
      .tx-stats-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 159, 28, 0.2);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        color: #ffbf69;
        font-weight: 600;
        border: 1px solid rgba(255, 159, 28, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================================================
  // COMPONENT
  // ========================================================================
  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'traderx-sidebar';

    sidebar.innerHTML = `
      <div class="tx-header">
        <div class="tx-title">
          <div class="tx-title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" stroke-width="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          TraderX Pro
        </div>
        <button class="tx-close" id="tx-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="tx-content">
        <div class="tx-section">
          <div class="tx-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Core Filters
          </div>
          <div class="tx-toggle-card">
            <div>
              <div class="tx-toggle-label">Trusted View Only</div>
              <div class="tx-toggle-sub">Show verified accounts only</div>
            </div>
            <label class="tx-switch">
              <input type="checkbox" id="tx-trusted-toggle" ${this.trustedMode ? 'checked' : ''}>
              <span class="tx-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="tx-controls">
          <div class="tx-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Market Research
          </div>
          
          <button class="tx-btn tx-btn-primary" id="tx-adv-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Advanced Search
          </button>
          
          <button class="tx-btn tx-btn-secondary" id="tx-directory-open">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Signal Directory
          </button>

          <button class="tx-btn tx-btn-outline" id="tx-tracker-toggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Toggle Market Pulse
          </button>
        </div>
        
        <div class="tx-controls" style="padding-top: 0;">
          <div class="tx-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Export Tweets
          </div>
          
          <button class="tx-btn tx-btn-ai" id="tx-copy-ai">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            🧠 AI Analysis Prompt
          </button>
          
          <button class="tx-btn tx-btn-json" id="tx-copy-json">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Copy as JSON
          </button>
          
          <button class="tx-btn tx-btn-csv" id="tx-copy-csv">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Export to CSV
          </button>
        </div>
      </div>
      
      <div class="tx-footer">
        <div class="tx-credits">
          Crafted with 💛 by <a href="https://github.com/bhrigu-verma" target="_blank" class="tx-link">Bhrigu Verma</a>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);

    // Add floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'tx-trigger';
    trigger.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
        <polyline points="16 7 22 7 22 13"></polyline>
      </svg>
    `;
    trigger.addEventListener('click', () => this.toggle());
    document.body.appendChild(trigger);

    this.setupListeners();
  }

  setupListeners() {
    // Close button
    document.getElementById('tx-close-btn').addEventListener('click', () => this.close());

    // Trusted Toggle
    document.getElementById('tx-trusted-toggle').addEventListener('change', (e) => {
      this.trustedMode = e.target.checked;
      localStorage.setItem('traderx_trusted_mode', this.trustedMode);
      if (window.traderXToggleTrustedMode) {
        window.traderXToggleTrustedMode(this.trustedMode);
      }
    });

    // Advanced Search
    document.getElementById('tx-adv-search').addEventListener('click', () => {
      if (window.traderXSearch) {
        window.traderXSearch.createSearchUI();
        this.close();
      }
    });

    // Directory
    document.getElementById('tx-directory-open').addEventListener('click', () => {
      if (window.TraderXDirectory) {
        window.TraderXDirectory.show();
        this.close();
      }
    });

    // Tracker Toggle
    document.getElementById('tx-tracker-toggle').addEventListener('click', () => {
      if (window.TraderXTrackerDashboard) {
        window.TraderXTrackerDashboard.toggle();
      }
    });

    // Export buttons
    document.getElementById('tx-copy-json').addEventListener('click', () => this.copyTweetsAsJSON());
    document.getElementById('tx-copy-csv').addEventListener('click', () => this.exportTweetsAsCSV());
    document.getElementById('tx-copy-ai').addEventListener('click', () => this.copyTweetsForAI());
  }

  // ========================================================================
  // EXPORT FUNCTIONS
  // ========================================================================

  extractTweetsFromPage() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    const tweetData = [];

    tweets.forEach((tweet, index) => {
      const authorEl = tweet.querySelector('[data-testid="User-Name"]');
      const authorText = authorEl ? authorEl.textContent : '';
      const author = authorText.split('@')[1]?.split('·')[0]?.trim() || 'Unknown';
      const displayName = authorText.split('@')[0]?.trim() || 'Unknown';

      const tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
      const text = tweetTextEl ? tweetTextEl.textContent : '';

      const timeEl = tweet.querySelector('time');
      const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';

      const replyEl = tweet.querySelector('[data-testid="reply"]');
      const retweetEl = tweet.querySelector('[data-testid="retweet"]');
      const likeEl = tweet.querySelector('[data-testid="like"]');

      const replies = this.parseNumber(replyEl?.textContent?.trim() || '0');
      const retweets = this.parseNumber(retweetEl?.textContent?.trim() || '0');
      const likes = this.parseNumber(likeEl?.textContent?.trim() || '0');

      if (text) {
        tweetData.push({
          id: index + 1,
          author: `@${author}`,
          displayName,
          timestamp,
          text,
          engagement: { replies, retweets, likes },
          engagementScore: replies + retweets + likes
        });
      }
    });

    return tweetData;
  }

  parseNumber(str) {
    if (!str || str === '0') return 0;
    const num = parseFloat(str);
    if (str.includes('K')) return Math.round(num * 1000);
    if (str.includes('M')) return Math.round(num * 1000000);
    return Math.round(num);
  }

  async copyTweetsAsJSON() {
    const tweets = this.extractTweetsFromPage();

    if (tweets.length === 0) {
      this.showToast('No tweets found on this page!', 'error');
      return;
    }

    const jsonData = {
      exportDate: new Date().toISOString(),
      source: window.location.href,
      totalTweets: tweets.length,
      tweets: tweets
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      this.showToast(`✓ Copied ${tweets.length} tweets as JSON!`, 'success');
    } catch (error) {
      this.showToast('Failed to copy. Please try again.', 'error');
    }
  }

  async exportTweetsAsCSV() {
    const tweets = this.extractTweetsFromPage();

    if (tweets.length === 0) {
      this.showToast('No tweets found on this page!', 'error');
      return;
    }

    let csv = '# Tweet Export\n';
    csv += `# Date: ${new Date().toLocaleDateString()}\n`;
    csv += `# Source: ${window.location.href}\n`;
    csv += `# Total: ${tweets.length} tweets\n\n`;
    csv += 'Index,Author,DisplayName,Timestamp,Text,Replies,Retweets,Likes,Engagement\n';

    tweets.forEach(t => {
      const text = t.text.replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `${t.id},"${t.author}","${t.displayName}","${t.timestamp}","${text}",${t.engagement.replies},${t.engagement.retweets},${t.engagement.likes},${t.engagementScore}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tweets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.showToast(`✓ Downloaded ${tweets.length} tweets!`, 'success');
  }

  async copyTweetsForAI() {
    const tweets = this.extractTweetsFromPage();

    if (tweets.length === 0) {
      this.showToast('No tweets found on this page!', 'error');
      return;
    }

    // Sort by engagement to identify important voices
    const sortedTweets = [...tweets].sort((a, b) => b.engagementScore - a.engagementScore);
    const topTweets = sortedTweets.slice(0, 10);

    const date = new Date().toLocaleDateString();
    const url = window.location.href;

    // Extract ticker from URL or page
    const tickerMatch = url.match(/\$([A-Za-z]+)/) || url.match(/q=.*?([A-Z]{1,5})/i);
    const ticker = tickerMatch ? tickerMatch[1].toUpperCase() : 'UNKNOWN';

    let prompt = `# 🎯 COMPREHENSIVE TWITTER SENTIMENT ANALYSIS REQUEST

## Asset Information
- **Ticker/Asset**: $${ticker}
- **Analysis Date**: ${date}
- **Data Source**: ${url}
- **Total Tweets Analyzed**: ${tweets.length}

---

## 🧠 ANALYSIS INSTRUCTIONS

Please provide a COMPREHENSIVE analysis with the following sections:

### 1️⃣ EXECUTIVE SUMMARY
- One-paragraph overview of the overall sentiment and key takeaways
- Include a sentiment score from 1-100 (1 = extremely bearish, 100 = extremely bullish)

### 2️⃣ SENTIMENT BREAKDOWN
Provide percentages for:
- 🟢 **Bullish**: X% (count: N tweets)
- 🔴 **Bearish**: X% (count: N tweets)  
- ⚪ **Neutral**: X% (count: N tweets)

### 3️⃣ LIVE PRICE CHECK
**IMPORTANT**: Please fetch the current live price of $${ticker} and include:
- Current price
- 24-hour change (%)
- Market cap (if applicable)
- Volume trend

### 4️⃣ KEY THEMES & NARRATIVES
Identify the top 5 discussion themes with supporting tweet examples

### 5️⃣ INFLUENTIAL VOICES SUMMARY
The top 10 most engaged tweets are highlighted below. Summarize what key influencers are saying.

### 6️⃣ CATALYSTS & EVENTS
List any mentioned:
- Upcoming events (earnings, announcements, releases)
- Recent news affecting price
- Regulatory developments
- Partnership/acquisition rumors

### 7️⃣ RISK FACTORS
Identify concerns mentioned by the community:
- Technical concerns
- Fundamental concerns
- Market-wide risks
- Specific threats

### 8️⃣ TECHNICAL ANALYSIS MENTIONS
If any tweets mention technical analysis, summarize:
- Support/resistance levels
- Chart patterns
- Key price targets

### 9️⃣ PRICE PREDICTIONS
Compile any price predictions from tweets:
- Short-term (1-7 days)
- Medium-term (1-4 weeks)
- Long-term (1-3 months)

### 🔟 FINAL RECOMMENDATION
Based on all the above analysis, provide:
- **Outlook**: Bullish / Bearish / Neutral
- **Confidence Level**: Low / Medium / High
- **Time Horizon**: Short / Medium / Long term
- **Key Action Items**: What should traders watch for?

---

## 🌟 TOP 10 INFLUENTIAL TWEETS (by engagement)

`;

    topTweets.forEach((t, i) => {
      prompt += `### ${i + 1}. ${t.displayName} (${t.author})
**Engagement**: 💬 ${t.engagement.replies} | 🔁 ${t.engagement.retweets} | ❤️ ${t.engagement.likes} | Score: ${t.engagementScore}
**Time**: ${t.timestamp}

> ${t.text}

---

`;
    });

    prompt += `
## 📊 ALL TWEETS DATA (${tweets.length} total)

`;

    tweets.forEach((t, i) => {
      prompt += `**[${i + 1}]** ${t.author} (${t.displayName}) • 💬${t.engagement.replies} 🔁${t.engagement.retweets} ❤️${t.engagement.likes}
${t.text}
---
`;
    });

    prompt += `

## 📌 FINAL NOTES

1. Please generate a visual ASCII chart showing sentiment distribution
2. Create a watchlist of key price levels mentioned
3. Highlight any unusual activity or sentiment divergence
4. Compare current sentiment to typical market conditions
5. Provide 3 actionable trade ideas based on this analysis

---

*Data exported by TraderX Pro • ${tweets.length} tweets analyzed*
*Please proceed with the comprehensive analysis now.*
`;

    try {
      await navigator.clipboard.writeText(prompt);
      this.showToast(`✓ AI Analysis Prompt copied! Paste into ChatGPT/Claude`, 'success');
    } catch (error) {
      this.showToast('Failed to copy. Please try again.', 'error');
    }
  }

  showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.getElementById('tx-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tx-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 99999;
      animation: slideIn 0.3s ease;
      ${type === 'success'
        ? 'background: linear-gradient(135deg, #2ec4b6 0%, #1aa198 100%); color: white;'
        : 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;'}
      box-shadow: 0 8px 30px ${type === 'success' ? 'rgba(46, 196, 182, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
    `;
    toast.innerHTML = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  toggle() {
    const sidebar = document.getElementById('traderx-sidebar');
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      sidebar.classList.add('visible');
    } else {
      sidebar.classList.remove('visible');
    }
  }

  close() {
    this.isVisible = false;
    document.getElementById('traderx-sidebar').classList.remove('visible');
  }
}

// Init
window.addEventListener('load', () => {
  window.TraderXSidebar = new TraderXSidebar();
});
