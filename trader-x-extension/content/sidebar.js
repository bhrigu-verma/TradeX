// ============================================================================
// TRADERX SIDEBAR - FINTECH EDITION
// ============================================================================
// Professional grade UI with Slate-950 theme
// Includes Trusted Mode toggle and Advanced Search integration
// ============================================================================

class TraderXSidebar {
  constructor() {
    this.isVisible = false;
    this.trustedMode = localStorage.getItem('traderx_trusted_mode') === 'true';
    this.createSidebar();
    this.injectStyles();
  }

  // ========================================================================
  // STYLES
  // ========================================================================
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #traderx-sidebar {
        position: fixed;
        top: 0;
        right: -320px;
        width: 320px;
        height: 100vh;
        background: #0B1120; /* Slate 950 */
        border-left: 1px solid #1E293B; /* Slate 800 */
        z-index: 9999;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        color: #F8FAFC; /* Slate 50 */
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      }
      
      #traderx-sidebar.visible {
        right: 0;
      }
      
      .tx-header {
        padding: 20px 24px;
        border-bottom: 1px solid #1E293B;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #0F172A; /* Slate 900 */
      }
      
      .tx-title {
        font-size: 18px;
        font-weight: 700;
        color: #F8FAFC;
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: -0.02em;
      }
      
      .tx-close {
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tx-close:hover {
        background: #1E293B;
        color: #F8FAFC;
      }
      
      /* Toggle Section */
      .tx-section {
        padding: 24px;
        border-bottom: 1px solid #1E293B;
      }
      
      .tx-section-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748B; /* Slate 500 */
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tx-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #1E293B;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid #334155;
      }
      
      .tx-toggle-label {
        font-size: 14px;
        font-weight: 500;
        color: #E2E8F0;
      }
      
      .tx-toggle-sub {
        font-size: 12px;
        color: #94A3B8;
        margin-top: 2px;
      }
      
      /* Toggle Switch */
      .tx-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
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
        background-color: #334155;
        transition: .3s;
        border-radius: 34px;
      }
      
      .tx-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      input:checked + .tx-slider {
        background-color: #3B82F6; /* Blue 500 */
      }
      
      input:checked + .tx-slider:before {
        transform: translateX(20px);
      }
      
      /* Controls / Buttons */
      .tx-controls {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .tx-btn {
        width: 100%;
        padding: 14px;
        border-radius: 8px;
        border: 1px solid #334155;
        background: #1E293B;
        color: #E2E8F0;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .tx-btn:hover {
        background: #334155;
        border-color: #475569;
      }
      
      .tx-btn-primary {
        background: #3B82F6;
        border-color: #2563EB;
        color: white;
      }
      
      .tx-btn-primary:hover {
        background: #2563EB;
      }
      
      /* Footer */
      .tx-footer {
        margin-top: auto;
        padding: 24px;
        border-top: 1px solid #1E293B;
        text-align: center;
      }
      
      .tx-credits {
        font-size: 11px;
        color: #64748B;
        font-weight: 500;
      }
      
      .tx-link {
        color: #94A3B8;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .tx-link:hover {
        color: #3B82F6;
        text-decoration: underline;
      }
      
      /* Floating Trigger */
      #tx-trigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #3B82F6;
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        cursor: pointer;
        z-index: 9990;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background 0.2s;
      }
      
      #tx-trigger:hover {
        transform: translateY(-2px);
        background: #2563EB;
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          TraderX Pro
        </div>
        <button class="tx-close" id="tx-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="tx-section">
        <div class="tx-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Core Filters
        </div>
        <div class="tx-toggle-row">
          <div>
            <div class="tx-toggle-label">Trusted View Only</div>
            <div class="tx-toggle-sub">Verified accounts only</div>
          </div>
          <label class="tx-switch">
            <input type="checkbox" id="tx-trusted-toggle" ${this.trustedMode ? 'checked' : ''}>
            <span class="tx-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="tx-controls">
        <div class="tx-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Market Research
        </div>
        
        <button class="tx-btn tx-btn-primary" id="tx-adv-search">
          Advanced Search
        </button>
        
        <button class="tx-btn" id="tx-directory-open">
          View Signal Directory
        </button>

        <button class="tx-btn" id="tx-tracker-toggle">
          Toggle Live Tracker
        </button>
      </div>
      
      <div class="tx-controls" style="padding-top: 0;">
        <div class="tx-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Export Page Tweets
        </div>
        
        <button class="tx-btn" id="tx-copy-json" style="background: #7C3AED; color: white;">
          📋 Copy as JSON
        </button>
        
        <button class="tx-btn" id="tx-copy-csv" style="background: #059669; color: white;">
          📊 Export to CSV
        </button>
        
        <button class="tx-btn" id="tx-copy-ai" style="background: #2563EB; color: white;">
          🤖 Copy for AI Analysis
        </button>
      </div>
      
      <div class="tx-footer">
        <div class="tx-credits">
          Engineered by <a href="https://github.com/bhrigu-verma" target="_blank" class="tx-link">Bhrigu Verma</a>
        </div>
      </div>
    `;


    document.body.appendChild(sidebar);

    // Add floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'tx-trigger';
    trigger.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
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
      window.traderXToggleTrustedMode(this.trustedMode);
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
      const author = authorEl ? authorEl.textContent.split('@')[1]?.split('·')[0]?.trim() : 'Unknown';

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
      alert('No tweets found on this page!');
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
      this.showExportSuccess('tx-copy-json', `✓ Copied ${tweets.length} tweets as JSON!`);
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  }

  async exportTweetsAsCSV() {
    const tweets = this.extractTweetsFromPage();

    if (tweets.length === 0) {
      alert('No tweets found on this page!');
      return;
    }

    let csv = '# Tweet Export\n';
    csv += `# Date: ${new Date().toLocaleDateString()}\n`;
    csv += `# Source: ${window.location.href}\n`;
    csv += `# Total: ${tweets.length} tweets\n\n`;
    csv += 'Index,Author,Timestamp,Text,Replies,Retweets,Likes,Engagement\n';

    tweets.forEach(t => {
      const text = t.text.replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `${t.id},${t.author},"${t.timestamp}","${text}",${t.engagement.replies},${t.engagement.retweets},${t.engagement.likes},${t.engagementScore}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tweets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.showExportSuccess('tx-copy-csv', `✓ Downloaded ${tweets.length} tweets!`);
  }

  async copyTweetsForAI() {
    const tweets = this.extractTweetsFromPage();

    if (tweets.length === 0) {
      alert('No tweets found on this page!');
      return;
    }

    const date = new Date().toLocaleDateString();
    let formatted = `# Twitter Analysis Data\n`;
    formatted += `Date: ${date}\n`;
    formatted += `Source: ${window.location.href}\n`;
    formatted += `Total Tweets: ${tweets.length}\n\n`;
    formatted += `---\n\n`;
    formatted += `## Instructions for AI\n\n`;
    formatted += `Please analyze these ${tweets.length} tweets and provide:\n`;
    formatted += `1. Overall sentiment (Bullish/Bearish/Neutral) with percentages\n`;
    formatted += `2. Key themes and topics discussed\n`;
    formatted += `3. Notable catalysts or concerns mentioned\n`;
    formatted += `4. Emerging narratives or patterns\n`;
    formatted += `5. Summary recommendation\n\n`;
    formatted += `---\n\n`;
    formatted += `## Tweets\n\n`;

    tweets.forEach(t => {
      formatted += `### Tweet ${t.id}\n`;
      formatted += `**Author:** ${t.author}\n`;
      formatted += `**Time:** ${t.timestamp}\n`;
      formatted += `**Engagement:** 💬 ${t.engagement.replies} | 🔁 ${t.engagement.retweets} | ❤️ ${t.engagement.likes}\n\n`;
      formatted += `**Content:**\n${t.text}\n\n---\n\n`;
    });

    formatted += `## End of Data\n`;

    try {
      await navigator.clipboard.writeText(formatted);
      this.showExportSuccess('tx-copy-ai', `✓ Copied ${tweets.length} tweets for AI!`);
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  }

  showExportSuccess(buttonId, message) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = message;
      btn.style.opacity = '0.9';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
      }, 2000);
    }
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
