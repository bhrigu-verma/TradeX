/* src/hooks/useTraderX.js */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';
const API_KEY = 'traderx_dev_key_here'; // Hardcoded for local dev as seeded

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
});

export const useTraderX = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [sentimentData, setSentimentData] = useState({});
    const [backtestStats, setBacktestStats] = useState({});
    const [portfolio, setPortfolio] = useState({ positions: [], summary: {} });
    const [alerts, setAlerts] = useState([]);
    const [alertHistory, setAlertHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Get watchlist
            const watchlistRes = await api.get('/watchlist');
            const tickers = watchlistRes.data.tickers.map(t => t.ticker);
            setWatchlist(watchlistRes.data.tickers);

            // 2. Load sentiment for all tickers (including history for sparklines)
            const sentimentPromises = tickers.map(t => api.get(`/sentiment/${t}?cached=true`));
            const historyPromises = tickers.map(t => api.get(`/sentiment/${t}/history`).catch(() => ({ data: { history: [] } })));
            const [sentimentResults, historyResults] = await Promise.all([
                Promise.allSettled(sentimentPromises),
                Promise.allSettled(historyPromises),
            ]);

            const sentimentMap = {};
            sentimentResults.forEach((res, idx) => {
                if (res.status === 'fulfilled') {
                    sentimentMap[tickers[idx]] = res.value.data;
                }
            });
            // Attach sparkline history to sentiment data
            historyResults.forEach((res, idx) => {
                if (res.status === 'fulfilled' && sentimentMap[tickers[idx]]) {
                    const history = res.value.data?.history || [];
                    sentimentMap[tickers[idx]].sparklineData = history.slice(-12).map(h => ({
                        v: h.sentiment_score || h.sentiment || 0,
                        t: h.cached_at || h.timestamp || 0,
                    }));
                }
            });
            setSentimentData(sentimentMap);

            // 3. Load portfolio
            const portfolioRes = await api.get('/portfolio');
            setPortfolio(portfolioRes.data);

            // 4. Load alerts & history
            const alertsRes = await api.get('/alerts');
            const historyRes = await api.get('/alerts/history');
            setAlerts(alertsRes.data.alerts);
            setAlertHistory(historyRes.data.history);

            // 5. Load backtest stats for watchlist tickers
            const backtestMap = {};
            try {
                const backtestPromises = tickers.slice(0, 10).map(t =>
                    api.get(`/backtest/${t}`).catch(() => ({ data: null }))
                );
                const backtestResults = await Promise.allSettled(backtestPromises);
                backtestResults.forEach((res, idx) => {
                    if (res.status === 'fulfilled' && res.value.data) {
                        backtestMap[tickers[idx]] = res.value.data;
                    }
                });
            } catch (_) {}
            setBacktestStats(backtestMap);

            setError(null);
        } catch (err) {
            console.error('[Dashboard] Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToWatchlist = async (ticker) => {
        try {
            await api.post('/watchlist', { tickers: [ticker] });
            await fetchDashboardData();
        } catch (err) {
            setError(`Failed to add ${ticker}`);
        }
    };

    const removeFromWatchlist = async (ticker) => {
        try {
            await api.delete(`/watchlist/${ticker}`);
            await fetchDashboardData();
        } catch (err) {
            setError(`Failed to remove ${ticker}`);
        }
    };

    const closePosition = async (id, closePrice) => {
        try {
            await api.patch(`/portfolio/${id}/close`, { closePrice });
            await fetchDashboardData();
        } catch (err) {
            setError('Failed to close position');
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    return {
        watchlist,
        sentimentData,
        backtestStats,
        portfolio,
        alerts,
        alertHistory,
        loading,
        error,
        refresh: fetchDashboardData,
        actions: {
            addToWatchlist,
            removeFromWatchlist,
            closePosition
        }
    };
};
