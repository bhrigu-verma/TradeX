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
  // STYLES - DEEP SEA BLUE THEME
  // ========================================================================
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      #traderx-sidebar {
        position: fixed;
        top: 0;
        right: -400px; /* Wider for better spacing */
        width: 400px;
        height: 100vh;
        background: linear-gradient(180deg, #001233 0%, #001845 100%); /* Abyssal to Midnight */
        border-left: 1px solid #023e7d;
        z-index: 9999;
        transition: right 0.4s cubic-bezier(0.2, 0, 0, 1);
        display: flex;
        flex-direction: column;
        color: #e0e7ff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
        overflow: hidden;
      }
      
      #traderx-sidebar.visible {
        right: 0;
      }
      
      /* Header - Deep Navy Gradient */
      .tx-header {
        padding: 28px 32px;
        background: linear-gradient(135deg, #002855 0%, #001845 100%);
        border-bottom: 1px solid #023e7d;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      
      .tx-title {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 16px;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 10px rgba(4, 102, 200, 0.4);
      }
      
      .tx-title-icon {
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #0466c8 0%, #023e7d 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(4, 102, 200, 0.3);
      }
      
      .tx-close {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #979dac;
        cursor: pointer;
        padding: 12px;
        border-radius: 12px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tx-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }
      
      /* Content Area */
      .tx-content {
        flex: 1;
        overflow-y: auto;
        padding: 32px; /* Generous padding */
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      
      .tx-content::-webkit-scrollbar {
        width: 8px;
      }
      
      .tx-content::-webkit-scrollbar-track {
        background: #001233;
      }
      
      .tx-content::-webkit-scrollbar-thumb {
        background: #33415c;
        border-radius: 4px;
        border: 2px solid #001233;
      }
      
      /* Section Headers */
      .tx-section-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #5c677d;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .tx-section-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #023e7d;
      }
      
      /* Cards & Containers */
      .tx-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #1a2c4e; /* Custom dark border */
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
      }
      
      .tx-card:hover {
        border-color: #0466c8;
        background: rgba(4, 102, 200, 0.05);
        transform: translateY(-2px);
      }
      
      /* Toggle Row */
      .tx-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .tx-toggle-label {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4px;
      }
      
      .tx-toggle-sub {
        font-size: 13px;
        color: #979dac;
      }
      
      /* Switch */
      .tx-switch {
        position: relative;
        width: 56px;
        height: 30px;
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
        background-color: #002855;
        transition: .4s;
        border-radius: 30px;
        border: 1px solid #023e7d;
      }
      
      .tx-slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background-color: #7d8597;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .tx-slider {
        background-color: #0466c8;
        border-color: #0353a4;
      }
      
      input:checked + .tx-slider:before {
        transform: translateX(26px);
        background-color: #ffffff;
      }
      
      /* Buttons Grid */
      .tx-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .tx-btn {
        width: 100%;
        padding: 18px 24px;
        border-radius: 14px;
        border: 1px solid transparent;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        letter-spacing: 0.01em;
      }
      
      /* Primary Button - Mid Blue Gradient */
      .tx-btn-primary {
        background: linear-gradient(135deg, #0466c8 0%, #0353a4 100%);
        color: #ffffff;
        box-shadow: 0 4px 15px rgba(4, 102, 200, 0.3);
        border: 1px solid #0466c8;
      }
      
      .tx-btn-primary:hover {
        background: linear-gradient(135deg, #023e7d 0%, #002855 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(4, 102, 200, 0.4);
      }
      
      /* Secondary Button - Darker Navy */
      .tx-btn-secondary {
        background: rgba(4, 102, 200, 0.1);
        color: #4cc9f0; /* Keeping a slight bright accent for text readability */
        border: 1px solid rgba(4, 102, 200, 0.3);
      }
      
      .tx-btn-secondary:hover {
        background: rgba(4, 102, 200, 0.2);
        color: #ffffff;
        border-color: #0466c8;
      }
      
      /* Outline Button */
      .tx-btn-outline {
        background: transparent;
        border: 1px solid #33415c;
        color: #979dac;
      }
      
      .tx-btn-outline:hover {
        border-color: #7d8597;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
      }
      
      /* Export Actions Section */
      .tx-export-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .tx-btn-ai {
        background: linear-gradient(135deg, #0353a4 0%, #023e7d 100%);
        color: white;
        border: 1px solid #0466c8;
      }
      
      .tx-btn-ai:hover {
        box-shadow: 0 0 15px rgba(4, 102, 200, 0.5);
      }

      .tx-btn-plain {
        background: #001845;
        color: #7d8597;
        border: 1px solid #023e7d;
      }
      
      .tx-btn-plain:hover {
        background: #002855;
        color: white;
      }

      /* Footer */
      .tx-footer {
        padding: 24px 32px;
        border-top: 1px solid #023e7d;
        background: #001233;
        text-align: center;
      }
      
      .tx-credits {
        font-size: 11px;
        color: #5c677d;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
      
      .tx-link {
        color: #0466c8;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .tx-link:hover {
        color: #4cc9f0;
        text-decoration: underline;
      }
      
      /* Floating Trigger */
      #tx-trigger {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 64px;
        height: 64px;
        border-radius: 20px;
        background: linear-gradient(135deg, #0466c8 0%, #023e7d 100%);
        color: white;
        border: none;
        box-shadow: 0 10px 30px rgba(2, 62, 125, 0.5);
        cursor: pointer;
        z-index: 9990;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      #tx-trigger:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 40px rgba(2, 62, 125, 0.6);
      }
      
      #tx-trigger svg {
        width: 32px;
        height: 32px;
        stroke-width: 2;
      }

      /* Icons */
      .tx-icon {
        width: 18px;
        height: 18px;
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          TraderX Pro
        </div>
        <button class="tx-close" id="tx-close-btn" title="Close Sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="tx-content">
        <!-- TRUSTED MODE -->
        <div class="tx-section">
          <div class="tx-section-title">
            <svg class="tx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Global Filter
          </div>
          <div class="tx-card tx-toggle-row">
            <div>
              <div class="tx-toggle-label">Trusted Mode</div>
              <div class="tx-toggle-sub">Verified accounts only</div>
            </div>
            <label class="tx-switch">
              <input type="checkbox" id="tx-trusted-toggle" ${this.trustedMode ? 'checked' : ''}>
              <span class="tx-slider"></span>
            </label>
          </div>
        </div>
        
        <!-- RESEARCH TOOLS -->
        <div class="tx-section">
          <div class="tx-section-title">
            <svg class="tx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Market Tools
          </div>
          
          <div class="tx-grid">
            <button class="tx-btn tx-btn-primary" id="tx-adv-search">
              Advanced Search
            </button>
            
            <button class="tx-btn tx-btn-secondary" id="tx-directory-open">
              Signal Directory
            </button>

            <button class="tx-btn tx-btn-outline" id="tx-tracker-toggle">
              Market Pulse
            </button>
          </div>
        </div>
        
        <!-- EXPORTS -->
        <div class="tx-section">
          <div class="tx-section-title">
            <svg class="tx-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Analysis & Export
          </div>
          
          <div class="tx-export-grid">
            <button class="tx-btn tx-btn-ai" id="tx-copy-ai">
              ✨ Copy for AI Analysis
            </button>
            <button class="tx-btn tx-btn-plain" id="tx-copy-json">
              { } Copy JSON
            </button>
            <button class="tx-btn tx-btn-plain" id="tx-copy-csv">
               📊 Download CSV
            </button>
          </div>
        </div>
      </div>
      
      <div class="tx-footer">
        <div class="tx-credits">
          Engineered by <a href="https://github.com/bhrigu-verma" target="_blank" class="tx-link">Bhrigu Verma</a>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);

    // Floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'tx-trigger';
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
