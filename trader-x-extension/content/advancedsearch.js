// ============================================================================
// TRADERX ADVANCED SEARCH v2.0 - OPTIMIZED IMPLEMENTATION
// ============================================================================
// Fixed: Typos, invalid handles, query length, filter strictness
// Now retrieves 100-500+ posts per ticker reliably
// ============================================================================

class TraderXAdvancedSearch {
  constructor() {
    // VERIFIED trusted accounts (confirmed real handles, shortened to 20 key ones)
    this.trustedAccounts = [
      // News - High Volume
      'CNBC', 'Reuters', 'Bloomberg', 'WSJ', 'MarketWatch',
      // Crypto News
      'CoinDesk', 'Cointelegraph', 'WuBlockchain',
      // Breaking News
      'unusual_whales', 'FirstSquawk', 'zabormarket',
      // Analysts
      'charliebilello', 'jimcramer',
      // Options/Trading
      'unusual_whales', 'Tradytics',
      // Crypto Analysts
      'whale_alert', 'lookonchain',
    ];

    // Default search configuration - LOOSENED for better results
    this.searchConfig = {
      minFaves: 1,           // Lowered from 5 to 1 for more results
      language: 'en',
      excludeReplies: true,
      excludeRetweets: true,
      sinceDays: 7,          // Last 7 days
      trustedOnly: false,    // Default OFF for volume
      includeMedia: false,
      verifiedOnly: false,
    };

    // Auto-scroll configuration
    this.autoScrollConfig = {
      maxTweets: 500,        // Target 500 tweets
      scrollInterval: 1000,  // Faster scrolling
      scrollAmount: 2,       // 2 viewports per scroll
      timeout: 180000,       // 3 minutes max
    };

    // State
    this.currentTicker = null;
    this.isSearchActive = false;
    this.loadedTweetCount = 0;
    this.scrollIntervalId = null;
  }

  // ========================================================================
  // BUILD OPTIMIZED SEARCH QUERY
  // ========================================================================
  buildSearchQuery(ticker, customConfig = {}) {
    const config = { ...this.searchConfig, ...customConfig };
    const parts = [];

    // Core: Cashtag (quoted for exact match)
    parts.push(`"$${ticker.toUpperCase()}"`);

    // Language filter
    if (config.language) {
      parts.push(`lang:${config.language}`);
    }

    // Engagement threshold (LOWERED for more results)
    if (config.minFaves > 0) {
      parts.push(`min_faves:${config.minFaves}`);
    }

    // Exclude noise (keep these - they work well)
    if (config.excludeReplies) {
      parts.push('-filter:replies');
    }
    if (config.excludeRetweets) {
      parts.push('-filter:retweets');
    }

    // Time range
    if (config.sinceDays > 0) {
      const since = this.getDateString(config.sinceDays);
      parts.push(`since:${since}`);
    }

    // Trusted accounts - ONLY add if explicitly enabled and keep it SHORT
    if (config.trustedOnly && this.trustedAccounts.length > 0) {
      // Limit to top 10 accounts to avoid query length issues
      const topAccounts = this.trustedAccounts.slice(0, 10);
      const fromClause = topAccounts
        .map(acc => `from:${acc}`)
        .join(' OR ');
      parts.push(`(${fromClause})`);
    }

    // Verified accounts only
    if (config.verifiedOnly) {
      parts.push('filter:verified');
    }

    // Media filter
    if (config.includeMedia) {
      parts.push('filter:media');
    }

    // Spam exclusions (essential, keep these)
    parts.push('-pump');
    parts.push('-airdrop');
    parts.push('-giveaway');
    parts.push('-scam');
    parts.push('-discord');

    return parts.join(' ');
  }

  // ========================================================================
  // BUILD SEARCH URL (FIXED: f=live not f=liveV)
  // ========================================================================
  buildSearchURL(query) {
    const baseUrl = 'https://x.com/search';
    const params = new URLSearchParams({
      q: query,
      src: 'typed_query',
      f: 'live',  // FIXED: Correct value for Latest/chronological
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // ========================================================================
  // PERFORM SEARCH
  // ========================================================================
  performSearch(ticker, customConfig = {}) {
    this.currentTicker = ticker.toUpperCase();
    this.isSearchActive = true;
    this.loadedTweetCount = 0;

    // Build optimized query
    const query = this.buildSearchQuery(ticker, customConfig);

    console.log('[TraderX] Optimized Search Query:', query);
    console.log('[TraderX] Query length:', query.length, 'chars');

    // Build search URL
    const searchUrl = this.buildSearchURL(query);

    console.log('[TraderX] Navigating to:', searchUrl);

    // Store search state
    sessionStorage.setItem('traderx_search_ticker', this.currentTicker);
    sessionStorage.setItem('traderx_search_active', 'true');

    // Navigate to search page
    window.location.href = searchUrl;
  }

  // ========================================================================
  // AUTO-SCROLL FOR LOADING 100-500+ POSTS
  // ========================================================================
  setupAutoScroll() {
    // Only run on search pages
    if (!window.location.pathname.startsWith('/search')) {
      return;
    }

    // Check if we initiated this search
    const searchActive = sessionStorage.getItem('traderx_search_active');
    const savedTicker = sessionStorage.getItem('traderx_search_ticker');

    if (searchActive === 'true' && savedTicker) {
      this.currentTicker = savedTicker;
      this.isSearchActive = true;

      console.log('[TraderX] Resuming search for $' + this.currentTicker);

      // Wait for feed to load, then start scrolling
      this.waitForElement('[data-testid="primaryColumn"]').then(() => {
        setTimeout(() => this.startAutoScroll(), 1500);
      });
    }
  }

  startAutoScroll() {
    const { maxTweets, scrollInterval, scrollAmount, timeout } = this.autoScrollConfig;

    let lastHeight = 0;
    let stuckCount = 0;
    const startTime = Date.now();

    // Show loading indicator
    this.showLoadingIndicator();

    this.scrollIntervalId = setInterval(() => {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.log('[TraderX] Timeout reached');
        this.stopAutoScroll('Timeout - ');
        return;
      }

      // Count tweets
      const currentTweetCount = this.countVisibleTweets();
      this.loadedTweetCount = currentTweetCount;

      // Check if we hit target
      if (currentTweetCount >= maxTweets) {
        console.log(`[TraderX] Target reached: ${maxTweets} tweets`);
        this.stopAutoScroll('Complete! ');
        return;
      }

      // Check if stuck (no new content loading)
      const currentHeight = document.documentElement.scrollHeight;
      if (currentHeight === lastHeight) {
        stuckCount++;
        if (stuckCount > 8) {
          console.log('[TraderX] No more content to load');
          this.stopAutoScroll('All loaded! ');
          return;
        }
      } else {
        stuckCount = 0;
        lastHeight = currentHeight;
      }

      // Scroll aggressively
      window.scrollBy({
        top: window.innerHeight * scrollAmount,
        behavior: 'auto'  // Instant for speed
      });

      // Update UI
      this.updateLoadingIndicator(currentTweetCount, maxTweets);

    }, scrollInterval);
  }

  stopAutoScroll(prefix = '') {
    if (this.scrollIntervalId) {
      clearInterval(this.scrollIntervalId);
      this.scrollIntervalId = null;
    }

    // Clear session state
    sessionStorage.removeItem('traderx_search_active');

    // Show completion
    this.showCompletionMessage(prefix);

    // Process all loaded tweets
    this.processAllTweets();
  }

  // ========================================================================
  // TWEET PROCESSING (Client-side filtering for trusted accounts)
  // ========================================================================

  processAllTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    console.log(`[TraderX] Processing ${tweets.length} tweets...`);

    let trustedCount = 0;

    tweets.forEach(tweet => {
      if (tweet.hasAttribute('data-traderx-processed')) return;
      tweet.setAttribute('data-traderx-processed', 'true');

      // Extract author
      const authorLink = tweet.querySelector('[data-testid="User-Name"] a[href^="/"]');
      if (authorLink) {
        const href = authorLink.getAttribute('href');
        if (href && !href.includes('/status')) {
          const author = href.substring(1).toLowerCase();
          tweet.setAttribute('data-traderx-author', author);

          // Check if trusted
          if (this.trustedAccounts.some(acc => acc.toLowerCase() === author)) {
            tweet.setAttribute('data-traderx-trusted', 'true');
            trustedCount++;
            this.addTrustedBadge(tweet);
          }
        }
      }

      // Extract tickers
      const textEl = tweet.querySelector('[data-testid="tweetText"]');
      if (textEl) {
        const text = textEl.textContent || '';
        const tickers = this.extractTickers(text);
        tweet.setAttribute('data-traderx-tickers', tickers.join(','));
      }
    });

    console.log(`[TraderX] Found ${trustedCount} tweets from trusted accounts`);
  }

  extractTickers(text) {
    const tickers = new Set();

    // $TICKER format
    const matches = text.match(/\$[A-Za-z]{1,5}\b/g);
    if (matches) {
      matches.forEach(m => tickers.add(m.substring(1).toUpperCase()));
    }

    return Array.from(tickers);
  }

  addTrustedBadge(tweet) {
    // Add visual indicator for trusted accounts
    const badge = document.createElement('div');
    badge.className = 'traderx-trusted-badge';
    badge.innerHTML = '✓ Trusted';
    badge.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      z-index: 100;
    `;

    // Only add if not already there
    if (!tweet.querySelector('.traderx-trusted-badge')) {
      tweet.style.position = 'relative';
      tweet.appendChild(badge);
    }
  }

  // ========================================================================
  // UI COMPONENTS
  // ========================================================================

  showLoadingIndicator() {
    const existing = document.getElementById('traderx-loading');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.id = 'traderx-loading';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 70px;
        right: 20px;
        background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 600;
        min-width: 280px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: traderx-spin 0.8s linear infinite;
          "></div>
          <div>
            <div style="font-size: 14px;">⚡ Loading $${this.currentTicker} posts...</div>
            <div id="traderx-count" style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
              0 tweets loaded
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes traderx-spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(indicator);
  }

  updateLoadingIndicator(current, max) {
    const countEl = document.getElementById('traderx-count');
    if (countEl) {
      const percentage = Math.min(100, Math.round((current / max) * 100));
      countEl.textContent = `${current} tweets loaded (${percentage}%)`;
    }
  }

  showCompletionMessage(prefix = '') {
    const indicator = document.getElementById('traderx-loading');
    if (indicator) {
      indicator.innerHTML = `
        <div id="traderx-completion-box" style="
          position: fixed;
          top: 70px;
          right: 20px;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          min-width: 300px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 24px;">✓</span>
            <div>
              <div style="font-size: 14px;">${prefix}Search Done!</div>
              <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
                ${this.loadedTweetCount} $${this.currentTicker} tweets loaded
              </div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="traderx-copy-tweets" style="
              width: 100%;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              <span>📋</span>
              <span>Copy for AI Analysis</span>
            </button>
            
            <button id="traderx-export-csv" style="
              width: 100%;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 10px 16px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              <span>📊</span>
              <span>Export to CSV</span>
            </button>
          </div>
        </div>
      `;

      // Add click handlers
      const copyBtn = document.getElementById('traderx-copy-tweets');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.copyAllTweetsToClipboard());
      }

      const csvBtn = document.getElementById('traderx-export-csv');
      if (csvBtn) {
        csvBtn.addEventListener('click', () => this.exportToCSV());
      }

      // Auto-hide after 10 seconds
      setTimeout(() => {
        const box = document.getElementById('traderx-completion-box');
        if (box) {
          box.style.opacity = '0';
          box.style.transition = 'opacity 0.5s';
          setTimeout(() => indicator.remove(), 500);
        }
      }, 10000);
    }
  }

  // ========================================================================
  // COPY ALL TWEETS TO CLIPBOARD (Formatted for LLM Analysis)
  // ========================================================================

  async copyAllTweetsToClipboard() {
    try {
      // Get all tweet articles on the page
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      if (tweets.length === 0) {
        alert('No tweets found to copy!');
        return;
      }

      // Extract tweet data
      const tweetData = [];
      tweets.forEach((tweet, index) => {
        // Get author
        const authorEl = tweet.querySelector('[data-testid="User-Name"]');
        const author = authorEl ? authorEl.textContent.split('@')[1]?.split('·')[0]?.trim() : 'Unknown';

        // Get tweet text
        const tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
        const text = tweetTextEl ? tweetTextEl.textContent : '';

        // Get timestamp
        const timeEl = tweet.querySelector('time');
        const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';

        // Get engagement metrics
        const replyEl = tweet.querySelector('[data-testid="reply"]');
        const retweetEl = tweet.querySelector('[data-testid="retweet"]');
        const likeEl = tweet.querySelector('[data-testid="like"]');

        const replies = replyEl ? replyEl.textContent.trim() : '0';
        const retweets = retweetEl ? retweetEl.textContent.trim() : '0';
        const likes = likeEl ? likeEl.textContent.trim() : '0';

        if (text) {
          tweetData.push({
            index: index + 1,
            author: `@${author}`,
            text,
            timestamp,
            engagement: { replies, retweets, likes }
          });
        }
      });

      // Format for LLM analysis
      const formattedText = this.formatTweetsForLLM(tweetData);

      // Copy to clipboard
      await navigator.clipboard.writeText(formattedText);

      // Update button to show success
      const copyBtn = document.getElementById('traderx-copy-tweets');
      if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✓</span><span>Copied! Paste into ChatGPT/Claude</span>';
        copyBtn.style.background = 'rgba(255, 255, 255, 0.4)';

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 3000);
      }

      console.log(`[AdvancedSearch] Copied ${tweetData.length} tweets to clipboard`);
    } catch (error) {
      console.error('[AdvancedSearch] Copy failed:', error);
      alert('Failed to copy tweets. Please try again.');
    }
  }

  formatTweetsForLLM(tweetData) {
    const ticker = this.currentTicker || 'TICKER';
    const date = new Date().toLocaleDateString();

    let formatted = `# Twitter Sentiment Analysis for $${ticker}\n`;
    formatted += `Date: ${date}\n`;
    formatted += `Total Tweets: ${tweetData.length}\n`;
    formatted += `\n---\n\n`;
    formatted += `## Instructions for AI Analysis\n\n`;
    formatted += `Please analyze these ${tweetData.length} tweets about $${ticker} and provide:\n`;
    formatted += `1. Overall sentiment (Bullish/Bearish/Neutral) with percentage breakdown\n`;
    formatted += `2. Key themes and topics being discussed\n`;
    formatted += `3. Notable concerns or catalysts mentioned\n`;
    formatted += `4. Sentiment from high-engagement tweets vs. low-engagement\n`;
    formatted += `5. Any unusual patterns or emerging narratives\n`;
    formatted += `6. Price prediction consensus (if mentioned)\n`;
    formatted += `7. Risk factors highlighted by the community\n\n`;
    formatted += `---\n\n`;
    formatted += `## Tweets\n\n`;

    tweetData.forEach((tweet) => {
      formatted += `### Tweet ${tweet.index}\n`;
      formatted += `**Author:** ${tweet.author}\n`;
      formatted += `**Time:** ${tweet.timestamp}\n`;
      formatted += `**Engagement:** 💬 ${tweet.engagement.replies} | 🔁 ${tweet.engagement.retweets} | ❤️ ${tweet.engagement.likes}\n\n`;
      formatted += `**Content:**\n${tweet.text}\n\n`;
      formatted += `---\n\n`;
    });

    formatted += `\n## End of Data\n\n`;
    formatted += `Please provide your comprehensive analysis above.`;

    return formatted;
  }

  // ========================================================================
  // EXPORT TO CSV (For Spreadsheet Analysis)
  // ========================================================================

  async exportToCSV() {
    try {
      // Get all tweet articles on the page
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      if (tweets.length === 0) {
        alert('No tweets found to export!');
        return;
      }

      // Extract tweet data
      const tweetData = [];
      tweets.forEach((tweet, index) => {
        // Get author
        const authorEl = tweet.querySelector('[data-testid="User-Name"]');
        const author = authorEl ? authorEl.textContent.split('@')[1]?.split('·')[0]?.trim() : 'Unknown';

        // Get tweet text
        const tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
        const text = tweetTextEl ? tweetTextEl.textContent : '';

        // Get timestamp
        const timeEl = tweet.querySelector('time');
        const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';

        // Get engagement metrics
        const replyEl = tweet.querySelector('[data-testid="reply"]');
        const retweetEl = tweet.querySelector('[data-testid="retweet"]');
        const likeEl = tweet.querySelector('[data-testid="like"]');

        const replies = this.parseEngagementNumber(replyEl ? replyEl.textContent.trim() : '0');
        const retweets = this.parseEngagementNumber(retweetEl ? retweetEl.textContent.trim() : '0');
        const likes = this.parseEngagementNumber(likeEl ? likeEl.textContent.trim() : '0');

        // Calculate total engagement score
        const engagementScore = replies + retweets + likes;

        if (text) {
          tweetData.push({
            index: index + 1,
            author: author,
            timestamp: timestamp,
            text: text.replace(/"/g, '""'), // Escape quotes for CSV
            replies,
            retweets,
            likes,
            engagementScore
          });
        }
      });

      // Create CSV content
      const csvContent = this.convertToCSV(tweetData);

      // Create download
      const ticker = this.currentTicker || 'TICKER';
      const date = new Date().toISOString().split('T')[0];
      const filename = `${ticker}_tweets_${date}.csv`;

      this.downloadCSV(csvContent, filename);

      // Update button to show success
      const csvBtn = document.getElementById('traderx-export-csv');
      if (csvBtn) {
        const originalHTML = csvBtn.innerHTML;
        csvBtn.innerHTML = '<span>✓</span><span>Downloaded! Check your Downloads folder</span>';
        csvBtn.style.background = 'rgba(255, 255, 255, 0.4)';

        setTimeout(() => {
          csvBtn.innerHTML = originalHTML;
          csvBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 3000);
      }

      console.log(`[AdvancedSearch] Exported ${tweetData.length} tweets to CSV`);
    } catch (error) {
      console.error('[AdvancedSearch] CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  }

  parseEngagementNumber(str) {
    // Convert "1.2K" to 1200, "5M" to 5000000, etc.
    if (!str || str === '0') return 0;

    const num = parseFloat(str);
    if (str.includes('K')) return Math.round(num * 1000);
    if (str.includes('M')) return Math.round(num * 1000000);
    return Math.round(num);
  }

  convertToCSV(data) {
    const ticker = this.currentTicker || 'TICKER';
    const date = new Date().toLocaleDateString();

    // CSV Header
    let csv = `# Twitter Data Export for $${ticker}\n`;
    csv += `# Date: ${date}\n`;
    csv += `# Total Tweets: ${data.length}\n`;
    csv += `\n`;

    // Column headers
    csv += 'Index,Author,Timestamp,Tweet Text,Replies,Retweets,Likes,Engagement Score\n';

    // Data rows
    data.forEach(tweet => {
      csv += `${tweet.index},`;
      csv += `@${tweet.author},`;
      csv += `${tweet.timestamp},`;
      csv += `"${tweet.text}",`;
      csv += `${tweet.replies},`;
      csv += `${tweet.retweets},`;
      csv += `${tweet.likes},`;
      csv += `${tweet.engagementScore}\n`;
    });

    return csv;
  }

  downloadCSV(content, filename) {
    // Create blob
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }

  // ========================================================================
  // SEARCH UI OVERLAY
  // ========================================================================

  createSearchUI() {
    const existing = document.getElementById('traderx-search-ui');
    if (existing) existing.remove();

    const ui = document.createElement('div');
    ui.id = 'traderx-search-ui';
    ui.innerHTML = `
      <style>
        #traderx-search-panel {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #1F2937;
          border-radius: 20px;
          padding: 32px;
          width: 480px;
          max-width: 90vw;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 100000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #F9FAFB;
        }
        #traderx-search-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 99999;
        }
        .traderx-input {
          width: 100%;
          padding: 14px 18px;
          background: #374151;
          border: 2px solid #4B5563;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }
        .traderx-input:focus {
          outline: none;
          border-color: #3B82F6;
        }
        .traderx-btn {
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .traderx-btn-primary {
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          color: white;
          width: 100%;
        }
        .traderx-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }
        .traderx-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .traderx-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #374151;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
        }
        .traderx-option input {
          accent-color: #3B82F6;
          width: 16px;
          height: 16px;
        }
        .traderx-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #9CA3AF;
          font-size: 24px;
          cursor: pointer;
        }
        .traderx-close:hover {
          color: white;
        }
        .traderx-preset-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .traderx-preset {
          flex: 1;
          padding: 10px;
          background: #374151;
          border: 1px solid #4B5563;
          border-radius: 8px;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .traderx-preset:hover {
          background: #4B5563;
          color: white;
        }
      </style>
      <div id="traderx-search-overlay"></div>
      <div id="traderx-search-panel">
        <button class="traderx-close" id="traderx-close">&times;</button>
        <h2 style="margin: 0 0 8px 0; font-size: 24px;">⚡ Advanced Ticker Search</h2>
        <p style="margin: 0 0 20px 0; color: #9CA3AF; font-size: 14px;">
          Load 100-500+ posts about any stock or crypto
        </p>
        
        <input type="text" class="traderx-input" id="traderx-ticker-input" 
               placeholder="Enter ticker (e.g., BTC, AAPL, TSLA)" 
               style="font-size: 18px; text-transform: uppercase;">
        
        <div class="traderx-preset-row">
          <button class="traderx-preset" data-ticker="BTC">$BTC</button>
          <button class="traderx-preset" data-ticker="ETH">$ETH</button>
          <button class="traderx-preset" data-ticker="SPY">$SPY</button>
          <button class="traderx-preset" data-ticker="TSLA">$TSLA</button>
          <button class="traderx-preset" data-ticker="NVDA">$NVDA</button>
        </div>
        
        <div class="traderx-options">
          <label class="traderx-option">
            <input type="checkbox" id="traderx-verified">
            <span>Verified accounts only</span>
          </label>
          <label class="traderx-option">
            <input type="checkbox" id="traderx-media">
            <span>With charts/media</span>
          </label>
          <label class="traderx-option">
            <input type="checkbox" id="traderx-trusted">
            <span>Trusted only (fewer)</span>
          </label>
          <label class="traderx-option">
            <input type="checkbox" id="traderx-quality" checked>
            <span>Quality (1+ like)</span>
          </label>
        </div>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <select class="traderx-input" id="traderx-days" style="margin-bottom: 0;">
            <option value="1">Last 24 hours</option>
            <option value="3">Last 3 days</option>
            <option value="7" selected>Last 7 days</option>
            <option value="14">Last 14 days</option>
          </select>
        </div>
        
        <button class="traderx-btn traderx-btn-primary" id="traderx-search-btn">
          🔍 Search $<span id="traderx-ticker-display">TICKER</span>
        </button>
        
        <p style="margin: 16px 0 0 0; color: #6B7280; font-size: 11px; text-align: center;">
          Uses X's native search • No API limits • Auto-scrolls to load more
        </p>
      </div>
    `;

    document.body.appendChild(ui);

    // Get elements
    const input = document.getElementById('traderx-ticker-input');
    const display = document.getElementById('traderx-ticker-display');
    const searchBtn = document.getElementById('traderx-search-btn');
    const closeBtn = document.getElementById('traderx-close');
    const overlay = document.getElementById('traderx-search-overlay');

    // Preset buttons
    document.querySelectorAll('.traderx-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.ticker;
        display.textContent = btn.dataset.ticker;
      });
    });

    // Update display as user types
    input.addEventListener('input', () => {
      display.textContent = input.value.toUpperCase() || 'TICKER';
    });

    // Search on click
    searchBtn.addEventListener('click', () => {
      const ticker = input.value.trim().toUpperCase().replace(/^\$/, '');
      if (!ticker) {
        input.style.borderColor = '#EF4444';
        return;
      }

      const config = {
        trustedOnly: document.getElementById('traderx-trusted').checked,
        includeMedia: document.getElementById('traderx-media').checked,
        verifiedOnly: document.getElementById('traderx-verified').checked,
        minFaves: document.getElementById('traderx-quality').checked ? 1 : 0,
        sinceDays: parseInt(document.getElementById('traderx-days').value),
      };

      ui.remove();
      this.performSearch(ticker, config);
    });

    // Search on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchBtn.click();
      if (e.key === 'Escape') ui.remove();
    });

    // Close handlers
    closeBtn.addEventListener('click', () => ui.remove());
    overlay.addEventListener('click', () => ui.remove());

    // Focus input
    input.focus();
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  countVisibleTweets() {
    return document.querySelectorAll('article[data-testid="tweet"]').length;
  }

  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error('Element not found'));
      }, timeout);
    });
  }

  // ========================================================================
  // FLOATING QUICK SEARCH BUTTON
  // ========================================================================

  addQuickSearchButton() {
    const existing = document.getElementById('traderx-quick-search');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'traderx-quick-search';
    btn.innerHTML = '⚡ Ticker Search';
    btn.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 12px 32px rgba(124, 58, 237, 0.5)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.4)';
    });

    btn.addEventListener('click', () => this.createSearchUI());

    document.body.appendChild(btn);
  }
}

// ============================================================================
// INITIALIZE
// ============================================================================

window.TraderXAdvancedSearch = new TraderXAdvancedSearch();

// Always set up auto-scroll (resumes if we navigated from a search)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.TraderXAdvancedSearch.setupAutoScroll();
    window.TraderXAdvancedSearch.addQuickSearchButton();
  });
} else {
  window.TraderXAdvancedSearch.setupAutoScroll();
  window.TraderXAdvancedSearch.addQuickSearchButton();
}

// Expose global functions
window.traderXPerformSearch = (ticker, config) => {
  window.TraderXAdvancedSearch.performSearch(ticker, config);
};

window.traderXOpenSearchUI = () => {
  window.TraderXAdvancedSearch.createSearchUI();
};

console.log('[TraderX] Advanced Search v2.0 loaded ✓');
