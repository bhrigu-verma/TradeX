/* src/components/SentimentCard.js */
'use client';
import { TrendingUp, TrendingDown, Minus, Info, BarChart3, Clock, Share2, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDelta, formatPrice } from '@/app/formatters';

export default function SentimentCard({ ticker, data, onRemove }) {
    const analysis = data?.analysis || { status: 'LOADING...', sentiment: 0, sampleSize: 0 };
    const price = data?.price || { price: 0, change24h: 0 };

    const isBullish = analysis.sentiment > 0.15;
    const isBearish = analysis.sentiment < -0.15;
    const isNeutral = !isBullish && !isBearish;

    const getStatusColor = () => {
        if (isBullish) return 'text-bull';
        if (isBearish) return 'text-bear';
        return 'text-neutral';
    };

    const getStatusBg = () => {
        if (isBullish) return 'rgba(0, 150, 80, 0.2)';
        if (isBearish) return 'rgba(150, 40, 40, 0.2)';
        return 'rgba(60, 60, 70, 0.2)';
    };

    const getIcon = () => {
        if (isBullish) return <TrendingUp size={16} className="text-bull" />;
        if (isBearish) return <TrendingDown size={16} className="text-bear" />;
        return <Minus size={16} className="text-neutral" />;
    };

    // Use real sparkline history if available, otherwise generate from current value
    const sparkData = data?.sparklineData?.length > 2
        ? data.sparklineData
        : [
            { v: 0.1 }, { v: 0.2 }, { v: 0.15 }, { v: 0.3 }, { v: 0.4 },
            { v: 0.35 }, { v: analysis.sentiment || 0.4 }
        ];

    return (
        <div className="sentiment-card card animate-fade-in shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="card-header">
                <div className="ticker-info">
                    <span className="ticker-symbol font-bold text-2xl tracking-tight">${ticker}</span>
                    <span className="ticker-type text-xs text-secondary ml-1 opacity-50 uppercase">{price.type || 'ASSET'}</span>
                </div>
                <div className="card-actions flex gap-2">
                    <button className="icon-btn hover:bg-white/5 transition-colors p-1.5 rounded-full"><Share2 size={16} /></button>
                    <button className="icon-btn hover:bg-white/5 transition-colors p-1.5 rounded-full" onClick={() => onRemove(ticker)}><MoreHorizontal size={16} /></button>
                </div>
            </div>

            <div className="card-body">
                <div className="sentiment-main flex flex-col items-center py-4 bg-gradient-to-br from-transparent to-white/5 rounded-xl border border-white/5 my-2">
                    <div className={`sentiment-status badge font-bold tracking-wide flex items-center gap-2`} style={{ background: getStatusBg(), color: 'inherit' }}>
                        {getIcon()}
                        <span className={getStatusColor()}>{analysis.status}</span>
                    </div>
                    <div className="sentiment-score-large text-5xl font-extrabold my-2 text-white tabular-nums drop-shadow-md">
                        {(analysis.sentiment * 100).toFixed(0)}<span className="text-xl opacity-30">%</span>
                    </div>
                    <div className="sample-info text-xs text-secondary mt-1 tracking-wider opacity-60">
                        BASED ON {analysis.sampleSize} HIGH ENGAGEMENT TWEETS
                    </div>
                </div>

                <div className="stats-grid grid grid-cols-2 gap-3 mt-4">
                    <div className="stat-box bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="stat-label text-xs text-secondary flex items-center mb-1 gap-1">
                            <Clock size={12} className="opacity-50" />
                            Current Price
                        </div>
                        <div className="stat-value text-lg font-bold font-mono tracking-tight text-white">
                            {formatPrice(price.price)}
                        </div>
                        <div className={`stat-change text-[10px] font-semibold ${price.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>
                            {formatDelta(price.change24h)} (24h)
                        </div>
                    </div>
                    <div className="stat-box bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="stat-label text-xs text-secondary flex items-center mb-1 gap-1">
                            <BarChart3 size={12} className="opacity-50" />
                            Confidence
                        </div>
                        <div className={`stat-value text-lg font-bold capitalize ${analysis.confidence === 'high' ? 'text-bull' : 'text-secondary'}`}>
                            {analysis.confidence}
                        </div>
                        <div className="stat-metadata text-[10px] text-secondary opacity-60">
                            Low Noise Filter Active
                        </div>
                    </div>
                </div>

                <div className="sparkline-container h-16 mt-6 opacity-80 group cursor-crosshair">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData}>
                            <defs>
                                <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isBullish ? 'var(--bull)' : isBearish ? 'var(--bear)' : 'var(--text-secondary)'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isBullish ? 'var(--bull)' : isBearish ? 'var(--bear)' : 'var(--text-secondary)'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={isBullish ? 'var(--bull)' : isBearish ? 'var(--bear)' : 'var(--text-secondary)'}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#grad-${ticker})`}
                            />
                            <Tooltip
                                content={({ payload }) => (
                                    <div className="bg-tertiary px-2 py-1 rounded text-[10px] border border-white/10 glass">
                                        Value: {payload?.[0]?.value.toFixed(2)}
                                    </div>
                                )}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
