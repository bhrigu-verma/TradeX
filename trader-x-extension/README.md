# TraderX Pro - Advanced Twitter Trading Intelligence

A powerful Chrome extension that transforms Twitter/X into a real-time trading intelligence platform. Get instant sentiment analysis, price tracking, and AI-powered insights for stocks and crypto.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### 📊 **Market Pulse Dashboard**
- Real-time sentiment analysis for stocks & crypto
- Live price tracking (CoinGecko + Yahoo Finance)
- Volume spike detection with visual indicators
- Influencer-weighted sentiment scoring
- Click any ticker to see analyzed tweets in a modal

### 🔍 **Advanced Ticker Search**
- Load 150-200+ tweets per ticker
- Auto-scroll to gather comprehensive data
- Smart filtering (verified accounts, engagement thresholds)
- **Export Options:**
  - 📋 Copy all tweets formatted for ChatGPT/Claude analysis
  - 📊 Export to CSV for Excel/spreadsheet analysis

### 🎯 **Smart Content Filtering**
- Hide engagement bait, crypto scams, promotional content
- Filter low-effort posts and old news
- Time-sensitive content prioritization
- Customizable filter settings

### 👥 **Signal Directory**
- 250+ verified trading accounts across 13 categories
- Real Twitter profile pictures via Unavatar
- Categories: Central Banks, Institutional, News, Crypto, VCs, etc.
- Beautiful purple/violet gradient UI

### 📈 **Price & Sentiment Integration**
- Live crypto prices (BTC, ETH, SOL, etc.)
- Live stock prices (TSLA, NVDA, AAPL, SPY, etc.)
- 24-hour price change with color coding
- Sentiment correlation with price movements

### 🤖 **AI-Ready Data Export**
- One-click copy for LLM analysis
- Structured format with analysis prompts
- CSV export with engagement metrics
- Perfect for backtesting and research

## 📦 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/bhrigu-verma/traderx-pro.git
   cd traderx-pro
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `trader-x-extension` folder

3. **Start using!**
   - Visit [Twitter/X](https://x.com)
   - Click the TraderX icon in your toolbar
   - Enjoy real-time trading intelligence!

## 🎯 Usage

### Market Pulse Dashboard
1. Visit Twitter/X
2. Dashboard appears automatically on the right side
3. View sentiment, prices, and volume for tracked tickers
4. Click any ticker card to see analyzed tweets

### Advanced Search
1. Click TraderX icon → "Advanced Search"
2. Enter a ticker (e.g., BTC, TSLA, NVDA)
3. Wait for 150-200 tweets to load
4. **Export Options:**
   - Click "Copy for AI Analysis" → Paste into ChatGPT/Claude
   - Click "Export to CSV" → Open in Excel for analysis

### Settings
1. Right-click TraderX icon → "Options"
2. Configure:
   - **Filters**: Content filtering preferences
   - **Account Tiers**: Influencer weighting
   - **Watchlist**: Add/remove tickers
   - **Suggested Follows**: Browse 250+ verified accounts

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**: 
  - CoinGecko (crypto prices)
  - Yahoo Finance (stock prices)
  - Unavatar (profile pictures)
- **Browser**: Chrome Extension Manifest V3
- **Storage**: Chrome Storage API
- **Architecture**: Content scripts, background workers

## 📊 Data Sources

### Price Data
- **Crypto**: CoinGecko API (free, no API key required)
- **Stocks**: Yahoo Finance API (free, 15-min delay)

### Sentiment Analysis
- FinBERT-based keyword analysis
- Influencer weighting (3-tier system)
- Volume spike detection
- Engagement metrics (likes, retweets, replies)

### Verified Accounts
- 250+ manually curated accounts
- 13 categories (Macro, Institutional, News, Crypto, etc.)
- Tier 1: Critical influencers (10x weight)
- Tier 2: Trusted voices (5x weight)
- Tier 3: Signal accounts (2x weight)

## 📁 Project Structure

```
trader-x-extension/
├── manifest.json           # Extension configuration
├── background.js           # Background service worker
├── accounts.json           # 250+ verified trading accounts
├── content/
│   ├── content.js         # Main content script
│   ├── advancedsearch.js  # Advanced ticker search
│   ├── trackerDashboard.js # Market Pulse dashboard
│   ├── analysisEngine.js  # Sentiment analysis
│   ├── priceFetcher.js    # Price data fetching
│   └── tweetProcessor.js  # Tweet extraction & processing
├── settings/
│   ├── settings.html      # Settings page
│   ├── settings.css       # Settings styles
│   └── settings.js        # Settings logic
└── icons/                 # Extension icons
```

## 🔧 Configuration

### Adding Custom Tickers
1. Open Settings → Watchlist
2. Enter ticker symbol (e.g., AAPL, BTC)
3. Click "Add to Watchlist"

### Adjusting Filters
1. Open Settings → Filters
2. Toggle filters on/off:
   - Engagement bait
   - Promotional content
   - Low-effort posts
   - Crypto scams
   - Old news

### Influencer Tiers
Edit `accounts.json` to add/modify verified accounts:
```json
{
  "tier1": ["elonmusk", "federalreserve"],
  "tier2": ["jimcramer", "charliebilello"],
  "tier3": ["unusual_whales", "zerohedge"]
}
```

## 🚀 Roadmap

### Planned Features
- [ ] Smart alerts & notifications
- [ ] Sentiment timeline charts
- [ ] Portfolio tracker integration
- [ ] Correlation heatmap
- [ ] Whale tracker
- [ ] Earnings calendar integration
- [ ] Backtesting engine
- [ ] AI trade ideas generator
- [ ] Cloud sync across devices
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bhrigu Verma**
- GitHub: [@bhrigu-verma](https://github.com/bhrigu-verma)

## 🙏 Acknowledgments

- CoinGecko for free crypto price API
- Yahoo Finance for stock data
- Unavatar for profile picture service
- All the verified accounts in our Signal Directory

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: 146697095+bhrigu-verma@users.noreply.github.com

---

**⚠️ Disclaimer**: This tool is for informational purposes only. Not financial advice. Always do your own research before making investment decisions.

**Made with ❤️ for traders by traders**
