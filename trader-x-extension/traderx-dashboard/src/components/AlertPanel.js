/* src/components/AlertPanel.js */
'use client';
import { Bell, Zap, AlertTriangle, ArrowUpRight, CheckCircle2, MoreVertical, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AlertPanel({ history = [] }) {
    const getIcon = (type) => {
        switch (type) {
            case 'divergence': return <Zap size={16} className="text-bull" />;
            case 'volume_spike': return <AlertTriangle size={16} className="text-yellow-400" />;
            case 'tracked_account_tweet': return <Zap size={16} className="text-blue-400" />;
            default: return <Bell size={16} className="text-secondary" />;
        }
    };

    const getAlertTag = (type) => {
        const labels = {
            'divergence': 'Sentiment/Price Divergence',
            'volume_spike': 'Volume Anomalous Spike',
            'tracked_account_tweet': 'Influencer Activity',
            'sentiment_flip': 'Macro Sentiment Shift'
        };
        return labels[type] || 'System Alert';
    };

    return (
        <div className="alert-panel card glass animate-fade-in h-[calc(100vh-160px)] flex flex-col">
            <div className="panel-header border-b border-white/5 pb-4 mb-4 flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="bell-glow flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500">
                        <Bell size={18} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Enterprise Signal Stream</h2>
                        <p className="text-[10px] text-secondary tracking-widest uppercase opacity-40">Intelligence Node #402 — Tokyo Server</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn hover:bg-white/5 p-1 rounded-md transition-colors"><CheckCircle2 size={16} /></button>
                </div>
            </div>

            <div className="alerts-scroll flex-1 overflow-y-auto px-1 space-y-4">
                {history.length === 0 ? (
                    <div className="empty-state p-12 text-center flex flex-col items-center justify-center opacity-30 grayscale saturate-0 animate-pulse">
                        <div className="mb-4 p-4 rounded-full border border-dashed border-white/20"><Zap size={48} /></div>
                        <p className="font-mono text-sm">NO SIGNALS DETECTED IN LAST 24H</p>
                    </div>
                ) : (
                    history.map((alert, idx) => (
                        <div key={idx} className="alert-item group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/[0.07] hover:border-white/10 transition-all duration-200 cursor-pointer relative overflow-hidden">
                            <div className="alert-left flex gap-3">
                                <div className="alert-type-icon">{getIcon(alert.type)}</div>
                                <div className="alert-content flex-1">
                                    <div className="alert-title flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm tracking-tight text-white mb-0.5">
                                            ${alert.ticker} <span className="text-[10px] text-secondary bg-white/10 px-1.5 py-0.5 rounded ml-1 font-mono">{getAlertTag(alert.type)}</span>
                                        </span>
                                        <span className="alert-time text-[10px] font-mono opacity-50 block mt-1">
                                            {formatDistanceToNow(new Date(alert.created_at * 1000))} ago
                                        </span>
                                    </div>
                                    <p className="alert-message text-xs text-secondary leading-relaxed opacity-80">
                                        {alert.alert_name}: Divergence detected between sentiment and price movement. Potential reversal signal.
                                    </p>
                                    <div className="alert-meta flex gap-4 mt-3 pt-2 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="meta-item text-[10px] font-mono">
                                            <span className="text-secondary mr-1">TTR:</span> <span className="text-white">5s</span>
                                        </div>
                                        <div className="meta-item text-[10px] font-mono">
                                            <span className="text-secondary mr-1">CONF:</span> <span className="text-bull">94%</span>
                                        </div>
                                        <div className="meta-item text-[10px] font-mono">
                                            <span className="text-secondary mr-1">ACT:</span> <span className="text-blue-400">TradeView →</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert-glow absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-bull/50 to-transparent"></div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
        .alert-panel {
          min-width: 400px;
        }

        .alerts-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .bell-glow {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
        }

        .alert-item {
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>
        </div>
    );
}
