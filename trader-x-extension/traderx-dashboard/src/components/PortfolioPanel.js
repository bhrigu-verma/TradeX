/* src/components/PortfolioPanel.js */
'use client';
import { useState } from 'react';
import { DollarSign, Percent, Briefcase, Activity, ArrowUp, ArrowDown, History, BarChart2, X } from 'lucide-react';
import { formatCount, formatDelta, formatPrice } from '@/app/formatters';

export default function PortfolioPanel({ portfolio = { positions: [], summary: {} }, onClosePosition }) {
    const { positions, summary } = portfolio;
    const [closingId, setClosingId] = useState(null);
    const [closePrice, setClosePrice] = useState('');

    const handleClose = () => {
        if (closingId && closePrice && onClosePosition) {
            onClosePosition(closingId, parseFloat(closePrice));
            setClosingId(null);
            setClosePrice('');
        }
    };

    return (
        <div className="portfolio-panel card glass animate-fade-in mb-8 shadow-xl">
            <div className="panel-header border-b border-white/5 pb-4 mb-6 flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="briefcase-glow flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500">
                        <Briefcase size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Active Portfolio</h2>
                        <p className="text-[10px] text-secondary tracking-widest uppercase opacity-40">Portfolio Segment: 04 Global Multi-Asset</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn hover:bg-white/5 p-1 rounded-md transition-colors"><Activity size={18} /></button>
                </div>
            </div>

            <div className="summary-tiles grid grid-cols-1 md:grid-cols-4 gap-4 px-4 mb-8">
                <div className="tile bg-gradient-to-br from-white/5 to-transparent p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="tile-label text-[10px] text-secondary tracking-widest uppercase flex items-center gap-1 mb-2">
                        <DollarSign size={10} /> Market Value
                    </div>
                    <div className="tile-value text-2xl font-bold font-mono tracking-tighter text-white">
                        {formatPrice(summary.totalCost + summary.totalPnL || 0)}
                    </div>
                    <div className="tile-meta text-[10px] text-neutral mt-2">
                        <span className="opacity-40">TOTAL ALLOC:</span> <span className="font-mono">{formatPrice(summary.totalCost || 0)}</span>
                    </div>
                </div>

                <div className="tile bg-gradient-to-br from-white/5 to-transparent p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="tile-label text-[10px] text-secondary tracking-widest uppercase flex items-center gap-1 mb-2">
                        <BarChart2 size={10} /> Real-Time P&L
                    </div>
                    <div className={`tile-value text-2xl font-bold font-mono tracking-tighter ${summary.totalPnL >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {summary.totalPnL >= 0 ? '+' : ''}{formatPrice(summary.totalPnL || 0)}
                    </div>
                    <div className={`tile-meta text-[10px] mt-2 font-bold`}>
                        <span className={summary.totalPnLPct >= 0 ? 'text-bull' : 'text-bear'}>
                            {summary.totalPnLPct >= 0 ? '▲' : '▼'} {formatDelta(Math.abs(summary.totalPnLPct || 0), false)} (TOTAL)
                        </span>
                    </div>
                </div>

                <div className="tile bg-gradient-to-br from-white/5 to-transparent p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="tile-label text-[10px] text-secondary tracking-widest uppercase flex items-center gap-1 mb-2">
                        <Activity size={10} /> Active Exposure
                    </div>
                    <div className="tile-value text-2xl font-bold font-mono tracking-tighter text-white">
                        {formatCount(positions.length)} <span className="text-xs opacity-40">POSITIONS</span>
                    </div>
                    <div className="tile-meta text-[10px] text-neutral mt-2">
                        <span className="opacity-40">DIVERSIFICATION:</span> <span className="font-mono text-blue-400">OPTIMAL</span>
                    </div>
                </div>

                <div className="tile bg-gradient-to-br from-white/5 to-transparent p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="tile-label text-[10px] text-secondary tracking-widest uppercase flex items-center gap-1 mb-2">
                        <History size={10} /> Performance Track
                    </div>
                    <div className="tile-value text-2xl font-bold font-mono tracking-tighter text-white">
                        +12.4% <span className="text-xs opacity-40">30D</span>
                    </div>
                    <div className="tile-meta text-[10px] text-neutral mt-2">
                        <span className="opacity-40">ALPHA VS SPX:</span> <span className="font-mono text-gold">+4.2%</span>
                    </div>
                </div>
            </div>

            <div className="positions-list px-4 mb-4">
                <div className="table-header flex text-[10px] text-secondary tracking-widest uppercase opacity-40 font-bold border-b border-white/5 pb-2 mb-2">
                    <div className="w-1/5">Ticker/Side</div>
                    <div className="w-1/5">Entry/Current</div>
                    <div className="w-1/5">Quantity</div>
                    <div className="w-1/5">Profit/Loss</div>
                    <div className="w-1/5 text-right">Action</div>
                </div>

                <div className="positions-container space-y-2 max-h-64 overflow-y-auto pr-2">
                    {positions.length === 0 ? (
                        <div className="empty-positions p-12 text-center opacity-30 grayscale saturate-0 italic text-sm">
                            No active exposure in current segment.
                        </div>
                    ) : (
                        positions.map((pos, idx) => (
                            <div key={idx} className="position-item flex items-center py-3 border-b border-white/5 hover:bg-white/[0.02] transition-all rounded px-2">
                                <div className="w-1/5">
                                    <div className="font-bold text-sm tracking-tight">${pos.ticker}</div>
                                    <div className={`text-[10px] font-bold ${pos.side === 'long' ? 'text-bull' : 'text-bear'}`}>
                                        {pos.side.toUpperCase()}
                                    </div>
                                </div>
                                <div className="w-1/5">
                                    <div className="text-xs font-mono opacity-60">{formatPrice(pos.entry_price || 0)}</div>
                                    <div className="text-sm font-bold font-mono tracking-tight">{pos.currentPrice ? formatPrice(pos.currentPrice) : '--'}</div>
                                </div>
                                <div className="w-1/5">
                                    <div className="text-sm font-bold font-mono opacity-80">{pos.quantity}</div>
                                    <div className="text-[10px] text-secondary opacity-40">VAL: {formatPrice(pos.quantity * (pos.currentPrice || pos.entry_price || 0))}</div>
                                </div>
                                <div className="w-1/5">
                                    <div className={`text-sm font-bold font-mono ${pos.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                                        {formatPrice(pos.pnl || 0)}
                                    </div>
                                    <div className={`text-[10px] font-bold ${pos.pnlPct >= 0 ? 'text-bull' : 'text-bear'}`}>
                                        {pos.pnlPct >= 0 ? '▲' : '▼'} {formatDelta(Math.abs(pos.pnlPct || 0), false)}
                                    </div>
                                </div>
                                <div className="w-1/5 text-right">
                                    <button
                                        className="close-pos-btn"
                                        onClick={() => { setClosingId(pos.id); setClosePrice(pos.currentPrice?.toString() || ''); }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Close Position Modal */}
            {closingId && (
                <div className="close-modal-overlay" onClick={() => setClosingId(null)}>
                    <div className="close-modal" onClick={e => e.stopPropagation()}>
                        <div className="close-modal-header">
                            <h3>Close Position</h3>
                            <button className="modal-x" onClick={() => setClosingId(null)}><X size={16} /></button>
                        </div>
                        <div className="close-modal-body">
                            <label>Close Price</label>
                            <input
                                type="number"
                                value={closePrice}
                                onChange={e => setClosePrice(e.target.value)}
                                placeholder="Enter close price"
                                step="0.01"
                            />
                        </div>
                        <div className="close-modal-actions">
                            <button className="btn-cancel" onClick={() => setClosingId(null)}>Cancel</button>
                            <button className="btn-confirm" onClick={handleClose} disabled={!closePrice}>Confirm Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
