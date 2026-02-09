// ============================================================================
// TRADERX SIDEBAR - DEEP SEA BLUE EDITION v3.0
// ============================================================================
// Premium UI with Deep Sea Blue color palette
// Colors: #0466c8 (Mid Blue), #0353a4 (Darker Blue), #023e7d (Deep Blue),
//         #002855 (Navy), #001845 (Midnight), #001233 (Abyssal)
//         #33415c, #5c677d, #7d8597, #979dac (Greys/Slates)
// ============================================================================

class TraderXSidebar {
  constructor() {
    this.isVisible = false;
    this.trustedMode = localStorage.getItem('traderx_trusted_mode') === 'true';
    this.createSidebar();
    this.injectStyles();
  }

  // ========================================================================
  // STYLES - PREMIUM FINTECH THEME
  // ========================================================================
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #traderx-sidebar {
        position: fixed;
        top: 0;
        right: -480px;
        width: 480px;
        height: 100vh;
        background: #141820;
        border-left: 1px solid rgba(242, 246, 248, 0.12);
        z-index: 99999;
        transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        color: #F2F6F8;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }
      
      #traderx-sidebar.visible {
        right: 0;
      }
      
      .pro-header {
        padding: 28px 24px;
        border-bottom: 1px solid rgba(242, 246, 248, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .pro-logo-container {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      
      .pro-icon {
        width: 44px;
        height: 44px;
        background: #00A36C;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      
      .pro-title {
        font-size: 22px;
        font-weight: 700;
        color: #F2F6F8;
        letter-spacing: -0.01em;
      }
      
      .pro-title span {
        background: linear-gradient(135deg, #C9A66B 0%, #E5C88C 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .tx-close {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #232830;
        border: 1px solid rgba(242, 246, 248, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: rgba(242, 246, 248, 0.6);
      }
      
      .tx-close:hover {
        background: #EF4444;
        color: white;
        transform: rotate(90deg);
      }
      
      .tx-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      
      .section-header {
        padding: 20px 24px 12px 24px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .section-icon {
        font-size: 18px;
        color: rgba(242, 246, 248, 0.6);
      }
      
      .section-title {
        font-size: 11px;
        font-weight: 700;
        color: rgba(242, 246, 248, 0.6);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      
      .toggle-card {
        margin: 0 24px 20px 24px;
        background: #232830;
        border: 1px solid rgba(242, 246, 248, 0.08);
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .toggle-info { flex: 1; }
      .toggle-title { font-size: 16px; font-weight: 600; color: #F2F6F8; margin-bottom: 4px; }
      .toggle-description { font-size: 13px; color: rgba(242, 246, 248, 0.6); font-weight: 400; }
      
      .toggle-switch {
        width: 50px;
        height: 28px;
        background: rgba(242, 246, 248, 0.12);
        border-radius: 14px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .toggle-switch.active { background: #00A36C; }
      
      .toggle-knob {
        width: 22px;
        height: 22px;
        background: #F2F6F8;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .toggle-switch.active .toggle-knob { left: 25px; }
      
      .action-button {
        margin: 0 24px 12px 24px;
        height: 56px;
        background: #232830;
        border: 1px solid rgba(242, 246, 248, 0.08);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: calc(100% - 48px);
        outline: none;
      }
      
      .action-button:hover {
        background: #00A36C;
        border-color: #00A36C;
        transform: translateX(4px);
        box-shadow: 0 4px 16px rgba(0, 163, 108, 0.2);
      }
      
      .action-button:hover .button-text { color: #141820; }
      .button-text { font-size: 16px; font-weight: 600; color: #F2F6F8; transition: color 0.2s ease; }
      
      .premium-button {
        margin: 0 24px 20px 24px;
        height: 56px;
        background: linear-gradient(135deg, #C9A66B 0%, #E5C88C 100%);
        border: none;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(201, 166, 107, 0.3);
        width: calc(100% - 48px);
      }
      
      .premium-button:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201, 166, 107, 0.5); }
      .premium-button-icon { font-size: 20px; color: #141820; }
      .premium-button-text { font-size: 16px; font-weight: 700; color: #141820; }
      
      .modal-footer { padding: 16px 24px 20px 24px; border-top: 1px solid rgba(242, 246, 248, 0.06); }
      .footer-text { font-size: 12px; color: rgba(242, 246, 248, 0.4); text-align: center; }
      .footer-link { color: #00A36C; text-decoration: none; font-weight: 600; }
      .footer-link:hover { text-decoration: underline; }
      
      /* Market Pulse FAB (Top Right) */
      .market-pulse-fab {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #232830;
        border: 1px solid rgba(242, 246, 248, 0.12);
        border-radius: 12px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 9998;
      }
      
      .market-pulse-fab:hover {
        background: #00A36C;
        border-color: #00A36C;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 163, 108, 0.3);
      }
      
      .market-pulse-fab:hover .fab-text, .market-pulse-fab:hover .fab-icon { color: #141820; }
      .fab-icon { width: 20px; height: 20px; color: #00A36C; transition: color 0.2s ease; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .fab-text { font-size: 14px; font-weight: 700; color: #F2F6F8; letter-spacing: -0.01em; transition: color 0.2s ease; }
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
      <div class="pro-header">
        <div class="pro-logo-container">
          <div class="pro-icon">⚡</div>
          <div class="pro-title">TraderX <span>Pro</span></div>
        </div>
        <button class="tx-close" id="tx-close-btn" title="Close Panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="tx-content">
        <!-- MODE SETTINGS -->
        <div class="section-header">
          <span class="section-icon">🛡️</span>
          <span class="section-title">Filtering Mode</span>
        </div>
        
        <div class="toggle-card">
          <div class="toggle-info">
            <div class="toggle-title">Trusted Mode</div>
            <div class="toggle-description">Only show verified signal accounts</div>
          </div>
          <div class="toggle-switch ${this.trustedMode ? 'active' : ''}" id="tx-trusted-toggle">
            <div class="toggle-knob"></div>
          </div>
        </div>
        
        <!-- TOOLS -->
        <div class="section-header">
          <span class="section-icon">🛠️</span>
          <span class="section-title">Analysis Tools</span>
        </div>
        
        <button class="action-button" id="tx-adv-search">
          <span class="button-text">Advanced Search</span>
        </button>
        
        <button class="action-button" id="tx-directory-open">
          <span class="button-text">Signal Directory</span>
        </button>

        <button class="action-button" id="tx-tracker-toggle">
          <span class="button-text">Market Pulse Dashboard</span>
        </button>
        
        <!-- PREMIUM ACTIONS -->
        <div class="section-header">
          <span class="section-icon">💎</span>
          <span class="section-title">Premium Features</span>
        </div>
        
        <button class="premium-button" id="tx-copy-ai">
          <span class="premium-button-icon">✨</span>
          <span class="premium-button-text">AI Sentiment Analysis</span>
        </button>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 24px 24px 24px;">
          <button class="action-button" id="tx-copy-json" style="margin: 0; width: 100%;">
            <span class="button-text">{ } JSON</span>
          </button>
          <button class="action-button" id="tx-copy-csv" style="margin: 0; width: 100%;">
            <span class="button-text">📊 CSV</span>
          </button>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-text">
          Engineered by <a href="https://github.com/bhrigu-verma" target="_blank" class="footer-link">Bhrigu Verma</a> • v2.0
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);

    // Market Pulse FAB (Top Right)
    const trigger = document.createElement('div');
    trigger.id = 'tx-trigger';
    trigger.className = 'market-pulse-fab';
    trigger.innerHTML = `
      <div class="fab-icon">📈</div>
      <div class="fab-text">MARKET PULSE</div>
    `;
    trigger.addEventListener('click', () => this.toggle());
    document.body.appendChild(trigger);

    this.setupListeners();
  }

  setupListeners() {
    // Close button
    document.getElementById('tx-close-btn').addEventListener('click', () => this.close());

    // Trusted Toggle (Custom Switch)
    const trustedToggle = document.getElementById('tx-trusted-toggle');
    if (trustedToggle) {
      trustedToggle.addEventListener('click', () => {
        this.trustedMode = !this.trustedMode;
        trustedToggle.classList.toggle('active', this.trustedMode);
        localStorage.setItem('traderx_trusted_mode', this.trustedMode);

        // Broadcast to other components if needed
        if (window.traderXToggleTrustedMode) {
          window.traderXToggleTrustedMode(this.trustedMode);
        }
      });
    }

    // Advanced Search
    document.getElementById('tx-adv-search').addEventListener('click', () => {
      if (window.TraderXAdvancedSearch) {
        window.TraderXAdvancedSearch.createSearchUI();
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

    // Exports
    document.getElementById('tx-copy-json').addEventListener('click', () => this.copyTweetsAsJSON());
    document.getElementById('tx-copy-csv').addEventListener('click', () => this.exportTweetsAsCSV());
    document.getElementById('tx-copy-ai').addEventListener('click', () => this.copyTweetsForAI());
  }

  // ========================================================================
  // EXPORT LOGIC (UNCHANGED)
  // ========================================================================

  extractTweetsFromPage() {
    // Try multiple selectors for tweets (X.com DOM can vary)
    const selectors = [
      'article[data-testid="tweet"]',
      'article[role="article"]',
      '[data-testid="cellInnerDiv"] article',
      'div[data-testid="primaryColumn"] article'
    ];

    let tweets = [];
    for (const selector of selectors) {
      tweets = document.querySelectorAll(selector);
      if (tweets.length > 0) {
        console.log(`[TraderX] Found ${tweets.length} tweets using selector: ${selector}`);
        break;
      }
    }

    if (tweets.length === 0) {
      console.warn('[TraderX] No tweets found on page. Available articles:', document.querySelectorAll('article').length);
      return [];
    }

    const tweetData = [];

    tweets.forEach((tweet, index) => {
      try {
        // Try multiple selectors for author info
        let authorEl = tweet.querySelector('[data-testid="User-Name"]');
        if (!authorEl) authorEl = tweet.querySelector('a[role="link"][href*="/"]');

        const authorText = authorEl ? authorEl.textContent : '';
        const author = authorText.split('@')[1]?.split('·')[0]?.trim() || 'Unknown';
        const displayName = authorText.split('@')[0]?.trim() || 'Unknown';

        // Try multiple selectors for tweet text
        let tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
        if (!tweetTextEl) tweetTextEl = tweet.querySelector('div[lang]');
        const text = tweetTextEl ? tweetTextEl.textContent : '';

        const timeEl = tweet.querySelector('time');
        const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';

        // Engagement metrics with fallbacks
        const replyEl = tweet.querySelector('[data-testid="reply"]');
        const retweetEl = tweet.querySelector('[data-testid="retweet"]');
        const likeEl = tweet.querySelector('[data-testid="like"]');

        const replies = this.parseNumber(replyEl?.textContent?.trim() || '0');
        const retweets = this.parseNumber(retweetEl?.textContent?.trim() || '0');
        const likes = this.parseNumber(likeEl?.textContent?.trim() || '0');

        if (text && text.length > 0) {
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
      } catch (err) {
        console.warn(`[TraderX] Error parsing tweet ${index}:`, err);
      }
    });

    console.log(`[TraderX] Successfully extracted ${tweetData.length} tweets`);
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

    let csv = '# Tweet Export\\n';
    csv += `# Date: ${new Date().toLocaleDateString()}\\n`;
    csv += `# Source: ${window.location.href}\\n`;
    csv += `# Total: ${tweets.length} tweets\\n\\n`;
    csv += 'Index,Author,DisplayName,Timestamp,Text,Replies,Retweets,Likes,Engagement\\n';

    tweets.forEach(t => {
      const text = t.text.replace(/"/g, '""').replace(/\\n/g, ' ');
      csv += `${t.id},"${t.author}","${t.displayName}","${t.timestamp}","${text}",${t.engagement.replies},${t.engagement.retweets},${t.engagement.likes},${t.engagementScore}\\n`;
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

    const sortedTweets = [...tweets].sort((a, b) => b.engagementScore - a.engagementScore);
    const topTweets = sortedTweets.slice(0, 10);

    const date = new Date().toLocaleDateString();
    const url = window.location.href;
    const tickerMatch = url.match(/\\$([A-Za-z]+)/) || url.match(/q=.*?([A-Z]{1,5})/i);
    const ticker = tickerMatch ? tickerMatch[1].toUpperCase() : 'UNKNOWN';

    let prompt = `# 🎯 COMPREHENSIVE TWITTER SENTIMENT ANALYSIS REQUEST\\n\\n## Asset Information\\n- **Ticker/Asset**: $${ticker}\\n- **Analysis Date**: ${date}\\n- **Data Source**: ${url}\\n- **Total Tweets Analyzed**: ${tweets.length}\\n\\n---\\n\\n## 🧠 ANALYSIS INSTRUCTIONS\\n\\nPlease provide a COMPREHENSIVE analysis with the following sections:\\n\\n### 1️⃣ EXECUTIVE SUMMARY\\n- One-paragraph overview of the overall sentiment and key takeaways\\n- Include a sentiment score from 1-100 (1 = extremely bearish, 100 = extremely bullish)\\n\\n### 2️⃣ SENTIMENT BREAKDOWN\\nProvide percentages for:\\n- 🟢 **Bullish**: X% (count: N tweets)\\n- 🔴 **Bearish**: X% (count: N tweets)  \\n- ⚪ **Neutral**: X% (count: N tweets)\\n\\n### 3️⃣ LIVE PRICE CHECK\\n**IMPORTANT**: Please fetch the current live price of $${ticker} and include:\\n- Current price\\n- 24-hour change (%)\\n- Market cap (if applicable)\\n- Volume trend\\n\\n### 4️⃣ KEY THEMES & NARRATIVES\\nIdentify the top 5 discussion themes with supporting tweet examples\\n\\n### 5️⃣ INFLUENTIAL VOICES SUMMARY\\nThe top 10 most engaged tweets are highlighted below. Summarize what key influencers are saying.\\n\\n### 6️⃣ CATALYSTS & EVENTS\\nList any mentioned:\\n- Upcoming events (earnings, announcements, releases)\\n- Recent news affecting price\\n- Regulatory developments\\n- Partnership/acquisition rumors\\n\\n### 7️⃣ RISK FACTORS\\nIdentify concerns mentioned by the community:\\n- Technical concerns\\n- Fundamental concerns\\n- Market-wide risks\\n- Specific threats\\n\\n### 8️⃣ TECHNICAL ANALYSIS MENTIONS\\nIf any tweets mention technical analysis, summarize:\\n- Support/resistance levels\\n- Chart patterns\\n- Key price targets\\n\\n### 9️⃣ PRICE PREDICTIONS\\nCompile any price predictions from tweets:\\n- Short-term (1-7 days)\\n- Medium-term (1-4 weeks)\\n- Long-term (1-3 months)\\n\\n### 🔟 FINAL RECOMMENDATION\\nBased on all the above analysis, provide:\\n- **Outlook**: Bullish / Bearish / Neutral\\n- **Confidence Level**: Low / Medium / High\\n- **Time Horizon**: Short / Medium / Long term\\n- **Key Action Items**: What should traders watch for?\\n\\n---\\n\\n## 🌟 TOP 10 INFLUENTIAL TWEETS (by engagement)\\n\\n`;

    topTweets.forEach((t, i) => {
      prompt += `### ${i + 1}. ${t.displayName} (${t.author})\\n**Engagement**: 💬 ${t.engagement.replies} | 🔁 ${t.engagement.retweets} | ❤️ ${t.engagement.likes} | Score: ${t.engagementScore}\\n**Time**: ${t.timestamp}\\n\\n> ${t.text}\\n\\n---\\n\\n`;
    });

    prompt += `\\n## 📊 ALL TWEETS DATA (${tweets.length} total)\\n\\n`;

    tweets.forEach((t, i) => {
      prompt += `**[${i + 1}]** ${t.author} (${t.displayName}) • 💬${t.engagement.replies} 🔁${t.engagement.retweets} ❤️${t.engagement.likes}\\n${t.text}\\n---\\n`;
    });

    prompt += `\\n\\n## 📌 FINAL NOTES\\n\\n1. Please generate a visual ASCII chart showing sentiment distribution\\n2. Create a watchlist of key price levels mentioned\\n3. Highlight any unusual activity or sentiment divergence\\n4. Compare current sentiment to typical market conditions\\n5. Provide 3 actionable trade ideas based on this analysis\\n\\n---\\n\\n*Data exported by TraderX Pro • ${tweets.length} tweets analyzed*\\n*Please proceed with the comprehensive analysis now.*\\n`;

    try {
      await navigator.clipboard.writeText(prompt);
      this.showToast(`✓ AI Analysis Prompt copied!`, 'success');
    } catch (error) {
      this.showToast('Failed to copy. Please try again.', 'error');
    }
  }

  showToast(message, type = 'success') {
    const existing = document.getElementById('tx-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tx-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 110px;
      right: 30px;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 99999;
      background: #001233;
      color: white;
      border: 1px solid #0466c8;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s cubic-bezier(0.2, 0, 0, 1);
    `;
    toast.innerHTML = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
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
