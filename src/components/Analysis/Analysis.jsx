import React from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const Analysis = ({ analysis, transactions, runAnalysis, isLoading }) => {
    return (
        <div className="view">
            <div className="hero">
                <h1>AI Analysis</h1>
                <p>Deep insights powered by AI</p>
            </div>

            {!analysis ? (
                <div className="card empty">
                    <Sparkles />
                    <p>Run AI analysis to get personalized insights</p>
                    <button onClick={runAnalysis} disabled={isLoading || !transactions.length} className="btn-primary">
                        {isLoading ? <RefreshCw className="spinner-sm" /> : <Sparkles />} Run Analysis
                    </button>
                </div>
            ) : (
                <div className="space-y">
                    <div className="stats-grid">
                        <div className="card">
                            <h4>Personality</h4>
                            <div className="badge-lg">{analysis.personality}</div>
                        </div>
                        <div className="card">
                            <h4>Health Score</h4>
                            <div className="score">{analysis.healthScore}/100</div>
                            <div className="progress-bar">
                                <div style={{ width: `${analysis.healthScore}%` }} className="progress-fill"></div>
                            </div>
                        </div>
                        <div className="card">
                            <h4>Savings Potential</h4>
                            <div className="score">{formatCurrency(analysis.savingsPotential)}</div>
                            <p className="small">Additional monthly savings possible</p>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Top Spending Categories</h3>
                        <div className="space-y">
                            {analysis.topCategories?.map((cat, i) => (
                                <div key={i}>
                                    <div className="flex-between">
                                        <span>{cat.category}</span>
                                        <span>{formatCurrency(cat.amount)}</span>
                                    </div>
                                    <p className="small">{cat.insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3><AlertTriangle className="icon-yellow" /> Anomalies Detected</h3>
                        <ul>
                            {analysis.anomalies?.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>

                    <div className="card">
                        <h3><CheckCircle className="icon-green" /> Recommendations</h3>
                        <ul>
                            {analysis.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>

                    <button onClick={runAnalysis} disabled={isLoading} className="btn-secondary">
                        {isLoading ? <RefreshCw className="spinner-sm" /> : <RefreshCw />} Refresh Analysis
                    </button>
                </div>
            )}
        </div>
    );
};

export default Analysis;
