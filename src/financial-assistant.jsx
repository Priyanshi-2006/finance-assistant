import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Target, Shield, Upload, FileText, MessageSquare, PieChart, Calendar, CheckCircle, XCircle, AlertTriangle, Sparkles, Download, Plus, Trash2, Eye, EyeOff, RefreshCw, DollarSign, CreditCard, ShoppingBag, Coffee, Car, Home, Heart, Zap, Music, Book, Plane, Gift, Smartphone, X, Send, Settings, Key } from 'lucide-react';
import './App.css';

// Utility functions
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const autoCategorizTransaction = (description) => {
    const rules = {
        'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'food', 'pizza', 'starbucks'],
        'Shopping': ['amazon', 'flipkart', 'myntra', 'shop', 'mall', 'store'],
        'Transportation': ['uber', 'ola', 'petrol', 'fuel', 'metro', 'bus', 'taxi'],
        'Entertainment': ['netflix', 'prime', 'spotify', 'movie', 'cinema'],
        'Utilities': ['electricity', 'water', 'gas', 'broadband', 'mobile', 'recharge'],
        'Healthcare': ['pharmacy', 'hospital', 'doctor', 'clinic', 'medical'],
        'Travel': ['flight', 'hotel', 'train'],
        'Education': ['course', 'book', 'tuition', 'school'],
        'Rent': ['rent', 'lease'],
        'Investment': ['mutual fund', 'stock', 'sip'],
        'Salary': ['salary', 'income', 'payroll'],
    };

    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(rules)) {
        if (keywords.some(kw => desc.includes(kw))) return category;
    }
    return 'Other';
};

const categoryIcons = {
    'Food & Dining': Coffee, 'Shopping': ShoppingBag, 'Transportation': Car,
    'Entertainment': Music, 'Utilities': Zap, 'Healthcare': Heart, 'Travel': Plane,
    'Education': Book, 'Rent': Home, 'Investment': TrendingUp, 'Salary': DollarSign, 'Other': CreditCard
};

const categoryColors = {
    'Food & Dining': '#FF6B6B', 'Shopping': '#4ECDC4', 'Transportation': '#45B7D1',
    'Entertainment': '#96CEB4', 'Utilities': '#FFEAA7', 'Healthcare': '#DFE6E9',
    'Travel': '#74B9FF', 'Education': '#A29BFE', 'Rent': '#FD79A8',
    'Investment': '#6C5CE7', 'Salary': '#00B894', 'Other': '#B2BEC3'
};

export default function FinancialAssistant() {
    // State
    const [view, setView] = useState('dashboard');
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '');
    const [apiProvider, setApiProvider] = useState('groq');
    const [loading, setLoading] = useState(true);

    // Modals
    const [showExpense, setShowExpense] = useState(false);
    const [showGoal, setShowGoal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalysisLoading, setShowAnalysisLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    // Forms
    const [expense, setExpense] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'debit', category: 'Other' });
    const [goal, setGoal] = useState({ name: '', targetAmount: '', deadline: '', emoji: '🎯' });
    const [chatInput, setChatInput] = useState('');
    const [toast, setToast] = useState(null);

    // Load data
    useEffect(() => {
        (async () => {
            const load = async (key, setter, defaultValue = null) => {
                try {
                    const result = await window.storage.get(key, false);
                    if (result?.value && result.value !== '""' && result.value !== 'null') {
                        setter(JSON.parse(result.value));
                    } else if (defaultValue !== null) {
                        setter(defaultValue);
                    }
                } catch (e) { }
            };

            await Promise.all([
                load('transactions', setTransactions),
                load('goals', setGoals),
                load('analysis', setAnalysis),
                load('chatHistory', setChatHistory),
                load('apiKey', setApiKey, import.meta.env.VITE_GROQ_API_KEY || ''),
                load('apiProvider', setApiProvider, 'groq'),
            ]);
            setLoading(false);
        })();
    }, []);

    // Save functions
    const save = async (key, value, setter) => {
        await window.storage.set(key, JSON.stringify(value), false);
        setter(value);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Add expense
    const addExpense = async (e) => {
        e.preventDefault();
        if (!expense.description || !expense.amount) return showToast('Fill all fields', 'error');

        const newTxn = {
            ...expense,
            amount: expense.type === 'credit' ? parseFloat(expense.amount) : -parseFloat(expense.amount),
            id: Date.now()
        };

        await save('transactions', [...transactions, newTxn], setTransactions);
        showToast('Transaction added!');
        setShowExpense(false);
        setExpense({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'debit', category: 'Other' });
    };

    // Add goal
    const addGoal = async (e) => {
        e.preventDefault();
        if (!goal.name || !goal.targetAmount || !goal.deadline) return showToast('Fill all fields', 'error');

        const newGoal = { ...goal, id: Date.now(), currentAmount: 0, targetAmount: parseFloat(goal.targetAmount) };
        await save('goals', [...goals, newGoal], setGoals);
        showToast('Goal created!');
        setShowGoal(false);
        setGoal({ name: '', targetAmount: '', deadline: '', emoji: '🎯' });
    };

    // Update goal
    const updateGoal = async (id, amount) => {
        const updated = goals.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + parseFloat(amount)) } : g);
        await save('goals', updated, setGoals);
        showToast('Goal updated!');
    };

    // Delete goal
    const deleteGoal = async (id) => {
        await save('goals', goals.filter(g => g.id !== id), setGoals);
        showToast('Goal deleted');
    };

    // AI API call helper
    const callAI = async (prompt, isChat = false) => {
        try {
            if (apiProvider === 'anthropic') {
                const res = await fetch('/api/anthropic/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                    body: JSON.stringify({ model: 'claude-3-5-sonnet-20240620', max_tokens: isChat ? 1500 : 2000, messages: [{ role: 'user', content: prompt }] })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || `Anthropic Error: ${res.status}`);
                return data.content[0].text;
            } else if (apiProvider === 'gemini') {
                const res = await fetch(`/api/gemini/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || `Gemini Error: ${res.status}`);
                return data.candidates[0].content.parts[0].text;
            } else if (apiProvider === 'groq') {
                const res = await fetch('/api/groq/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: isChat ? 1500 : 2000 })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || `Groq Error: ${res.status}`);
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error('AI Call failed:', error);
            throw error;
        }
    };

    // Run AI Analysis
    const runAnalysis = async () => {
        if (!transactions.length) return showToast('No transactions to analyze', 'error');
        if (!apiKey) {
            showToast('Set API key in settings', 'error');
            return setShowSettings(true);
        }

        setShowAnalysisLoading(true);
        const income = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const expense = Math.abs(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0));
        const categorySpending = {};
        transactions.filter(t => t.type === 'debit').forEach(t => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
        });

        const prompt = `Analyze financial data and return ONLY valid JSON:
Income: ₹${income}
Expenses: ₹${expense}
Savings: ${((income - expense) / income * 100).toFixed(1)}%

Categories:
${Object.entries(categorySpending).map(([c, a]) => `${c}: ₹${a}`).join('\n')}

Return JSON with: {"personality": "Saver/Spender/Balanced", "topCategories": [{"category": "name", "amount": 1000, "insight": "text"}], "anomalies": ["text"], "recommendations": ["tip1", "tip2", "tip3"], "savingsPotential": 5000, "healthScore": 75}`;

        try {
            const responseText = await callAI(prompt);
            let result = JSON.parse(responseText.match(/\{[\s\S]*\}/)[0]);
            result = { ...result, income, expense, savingsRate: ((income - expense) / income * 100).toFixed(1), categorySpending };

            await save('analysis', result, setAnalysis);
            showToast('Analysis complete!');
        } catch (err) {
            console.error('Detailed Analysis Error:', err);
            showToast(`Analysis failed: ${err.message}`, 'error');
        } finally {
            setShowAnalysisLoading(false);
        }
    };

    // Chat
    const sendChat = async () => {
        if (!chatInput.trim()) return;
        if (!apiKey) {
            showToast('Set API key in settings', 'error');
            return setShowSettings(true);
        }

        const msg = chatInput.trim();
        setChatInput('');
        const newHistory = [...chatHistory, { role: 'user', content: msg }];
        setChatHistory(newHistory);
        setChatLoading(true);

        const context = `Financial context: ${transactions.length} transactions, ${goals.length} goals${analysis ? `, ${analysis.personality} personality, ₹${analysis.income} income, ₹${analysis.expense} expenses, ${analysis.savingsRate}% savings` : ''}. Question: ${msg}`;

        try {
            const reply = await callAI(context, true);
            const updated = [...newHistory, { role: 'assistant', content: reply }];
            setChatHistory(updated);
            await save('chatHistory', updated, setChatHistory);
        } catch (err) {
            setChatHistory([...newHistory, { role: 'assistant', content: 'Error. Check API key.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const stats = {
        income: transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
        expense: Math.abs(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0))
    };
    stats.balance = stats.income - stats.expense;
    stats.savingsRate = stats.income > 0 ? ((stats.balance / stats.income) * 100).toFixed(1) : 0;

    if (loading) return <div className="loading"><RefreshCw className="spinner" /><p>Loading...</p></div>;

    return (
        <div className="app">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.type === 'success' ? <CheckCircle /> : <XCircle />}<span>{toast.msg}</span></div>}

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal" onClick={() => setShowSettings(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Settings /> Settings</h2>
                            <button onClick={() => setShowSettings(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <label>AI Provider</label>
                            <select value={apiProvider} onChange={e => setApiProvider(e.target.value)}>
                                <option value="gemini">🆓 Google Gemini (Free)</option>
                                <option value="groq">🆓 Groq (Free & Fast)</option>
                                <option value="anthropic">💳 Anthropic Claude</option>
                            </select>

                            <label>API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={apiProvider === 'gemini' ? 'AIza...' : apiProvider === 'groq' ? 'gsk_...' : 'sk-ant-...'}
                            />

                            {apiProvider === 'gemini' && (
                                <p className="help">Get FREE key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a></p>
                            )}
                            {apiProvider === 'groq' && (
                                <p className="help">Get FREE key at <a href="https://console.groq.com" target="_blank" rel="noopener">Groq Console</a></p>
                            )}
                            {apiProvider === 'anthropic' && (
                                <p className="help">Get key at <a href="https://console.anthropic.com" target="_blank" rel="noopener">Anthropic Console</a> (requires payment)</p>
                            )}

                            <button className="btn-primary" onClick={async () => {
                                await save('apiKey', apiKey, setApiKey);
                                await save('apiProvider', apiProvider, setApiProvider);
                                showToast('Settings saved!');
                                setShowSettings(false);
                            }}>Save Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showExpense && (
                <div className="modal" onClick={() => setShowExpense(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Plus /> Add Transaction</h2>
                            <button onClick={() => setShowExpense(false)}><X /></button>
                        </div>
                        <form className="modal-body" onSubmit={addExpense}>
                            <label>Date</label>
                            <input type="date" value={expense.date} onChange={e => setExpense({ ...expense, date: e.target.value })} required />

                            <label>Description</label>
                            <input type="text" value={expense.description} onChange={e => setExpense({ ...expense, description: e.target.value })} placeholder="e.g., Coffee at Starbucks" required />

                            <label>Amount (₹)</label>
                            <input type="number" value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })} placeholder="100" required />

                            <label>Type</label>
                            <select value={expense.type} onChange={e => setExpense({ ...expense, type: e.target.value })}>
                                <option value="debit">Expense</option>
                                <option value="credit">Income</option>
                            </select>

                            <label>Category</label>
                            <select value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })}>
                                {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <button type="submit" className="btn-primary">Add Transaction</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {showGoal && (
                <div className="modal" onClick={() => setShowGoal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Target /> Create Goal</h2>
                            <button onClick={() => setShowGoal(false)}><X /></button>
                        </div>
                        <form className="modal-body" onSubmit={addGoal}>
                            <label>Goal Name</label>
                            <input type="text" value={goal.name} onChange={e => setGoal({ ...goal, name: e.target.value })} placeholder="e.g., New Laptop" required />

                            <label>Target Amount (₹)</label>
                            <input type="number" value={goal.targetAmount} onChange={e => setGoal({ ...goal, targetAmount: e.target.value })} placeholder="50000" required />

                            <label>Deadline</label>
                            <input type="date" value={goal.deadline} onChange={e => setGoal({ ...goal, deadline: e.target.value })} required />

                            <label>Emoji</label>
                            <input type="text" value={goal.emoji} onChange={e => setGoal({ ...goal, emoji: e.target.value })} maxLength="2" />

                            <button type="submit" className="btn-primary">Create Goal</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="nav">
                <div className="nav-brand">
                    <Shield />
                    <div>
                        <h1>FinanceAI</h1>
                        <p>Privacy-First Assistant</p>
                    </div>
                </div>
                <div className="nav-links">
                    {[
                        { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
                        { id: 'transactions', icon: FileText, label: 'Transactions' },
                        { id: 'analysis', icon: Sparkles, label: 'Analysis' },
                        { id: 'goals', icon: Target, label: 'Goals' },
                        { id: 'assistant', icon: MessageSquare, label: 'Assistant' }
                    ].map(item => (
                        <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
                            <item.icon />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <button onClick={() => setShowSettings(true)}><Settings /><span>Settings</span></button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main">
                {view === 'dashboard' && (
                    <div className="view">
                        <div className="hero">
                            <h1>Financial Overview</h1>
                            <p>Your complete financial picture at a glance</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#10b98120' }}><TrendingUp style={{ color: '#10b981' }} /></div>
                                <div>
                                    <div className="stat-value">{formatCurrency(stats.income)}</div>
                                    <div className="stat-label">Total Income</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#ef444420' }}><TrendingDown style={{ color: '#ef4444' }} /></div>
                                <div>
                                    <div className="stat-value">{formatCurrency(stats.expense)}</div>
                                    <div className="stat-label">Total Expenses</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: '#3b82f620' }}><DollarSign style={{ color: '#3b82f6' }} /></div>
                                <div>
                                    <div className="stat-value">{stats.savingsRate}%</div>
                                    <div className="stat-label">Savings Rate • {formatCurrency(stats.balance)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="card">
                                <h3><Sparkles className="icon-yellow" /> AI Analysis</h3>
                                {analysis ? (
                                    <div className="space-y">
                                        <div className="badge">{analysis.personality}</div>
                                        <div className="progress-bar">
                                            <div style={{ width: `${analysis.healthScore}%` }} className="progress-fill"></div>
                                        </div>
                                        <p className="small">Health Score: {analysis.healthScore}/100</p>
                                        <button onClick={runAnalysis} disabled={showAnalysisLoading} className="btn-secondary w-full">
                                            {showAnalysisLoading ? <RefreshCw className="spinner-sm" /> : <RefreshCw />} Refresh
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y">
                                        <p>Get AI-powered insights about your spending habits</p>
                                        <button onClick={runAnalysis} disabled={showAnalysisLoading || !transactions.length} className="btn-primary w-full">
                                            {showAnalysisLoading ? <RefreshCw className="spinner-sm" /> : <Sparkles />} Run Analysis
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="card">
                                <h3><Target className="icon-green" /> Goals ({goals.length})</h3>
                                {goals.length > 0 ? (
                                    <div className="space-y">
                                        {goals.slice(0, 2).map(g => {
                                            const progress = (g.currentAmount / g.targetAmount * 100).toFixed(0);
                                            return (
                                                <div key={g.id}>
                                                    <div className="flex-between">
                                                        <span>{g.emoji} {g.name}</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div style={{ width: `${Math.min(progress, 100)}%` }} className="progress-fill"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button onClick={() => setView('goals')} className="btn-secondary w-full">View All</button>
                                    </div>
                                ) : (
                                    <div className="space-y">
                                        <p>Set financial goals and track your progress</p>
                                        <button onClick={() => setShowGoal(true)} className="btn-primary w-full"><Plus /> Create Goal</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {transactions.length > 0 && (
                            <div className="card">
                                <div className="flex-between">
                                    <h3><FileText /> Recent Transactions</h3>
                                    <button onClick={() => setView('transactions')} className="btn-link">View All →</button>
                                </div>
                                <div className="txn-list">
                                    {transactions.slice(-5).reverse().map((t, i) => {
                                        const Icon = categoryIcons[t.category] || CreditCard;
                                        return (
                                            <div key={i} className="txn-item">
                                                <div className="txn-icon" style={{ background: categoryColors[t.category] + '20' }}>
                                                    <Icon style={{ color: categoryColors[t.category] }} />
                                                </div>
                                                <div className="txn-details">
                                                    <div className="txn-desc">{t.description}</div>
                                                    <div className="txn-meta">{t.date} • {t.category}</div>
                                                </div>
                                                <div className={t.type === 'credit' ? 'txn-amount-credit' : 'txn-amount-debit'}>
                                                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'transactions' && (
                    <div className="view">
                        <div className="hero">
                            <h1>Transactions</h1>
                            <p>{transactions.length} transactions tracked</p>
                        </div>
                        <button onClick={() => setShowExpense(true)} className="btn-primary fab"><Plus /> Add Transaction</button>

                        <div className="card">
                            <div className="txn-list">
                                {transactions.length === 0 ? (
                                    <div className="empty">
                                        <FileText />
                                        <p>No transactions yet</p>
                                        <button onClick={() => setShowExpense(true)} className="btn-primary"><Plus /> Add First Transaction</button>
                                    </div>
                                ) : (
                                    transactions.slice().reverse().map((t, i) => {
                                        const Icon = categoryIcons[t.category] || CreditCard;
                                        return (
                                            <div key={i} className="txn-item">
                                                <div className="txn-icon" style={{ background: categoryColors[t.category] + '20' }}>
                                                    <Icon style={{ color: categoryColors[t.category] }} />
                                                </div>
                                                <div className="txn-details">
                                                    <div className="txn-desc">{t.description}</div>
                                                    <div className="txn-meta">{t.date} •{t.category}</div>
                                                </div>
                                                <div className={t.type === 'credit' ? 'txn-amount-credit' : 'txn-amount-debit'}>
                                                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'analysis' && (
                    <div className="view">
                        <div className="hero">
                            <h1>AI Analysis</h1>
                            <p>Deep insights powered by Claude AI</p>
                        </div>

                        {!analysis ? (
                            <div className="card empty">
                                <Sparkles />
                                <p>Run AI analysis to get personalized insights</p>
                                <button onClick={runAnalysis} disabled={showAnalysisLoading || !transactions.length} className="btn-primary">
                                    {showAnalysisLoading ? <RefreshCw className="spinner-sm" /> : <Sparkles />} Run Analysis
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

                                <button onClick={runAnalysis} disabled={showAnalysisLoading} className="btn-secondary">
                                    {showAnalysisLoading ? <RefreshCw className="spinner-sm" /> : <RefreshCw />} Refresh Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'goals' && (
                    <div className="view">
                        <div className="hero">
                            <h1>Financial Goals</h1>
                            <p>Track your progress toward your dreams</p>
                        </div>
                        <button onClick={() => setShowGoal(true)} className="btn-primary fab"><Plus /> Add Goal</button>

                        {goals.length === 0 ? (
                            <div className="card empty">
                                <Target />
                                <p>No goals yet. Create your first goal!</p>
                                <button onClick={() => setShowGoal(true)} className="btn-primary"><Plus /> Create Goal</button>
                            </div>
                        ) : (
                            <div className="space-y">
                                {goals.map(g => {
                                    const progress = (g.currentAmount / g.targetAmount * 100).toFixed(0);
                                    const remaining = g.targetAmount - g.currentAmount;
                                    return (
                                        <div key={g.id} className="card">
                                            <div className="flex-between">
                                                <h3>{g.emoji} {g.name}</h3>
                                                <button onClick={() => deleteGoal(g.id)} className="btn-icon"><Trash2 /></button>
                                            </div>
                                            <div className="progress-bar-lg">
                                                <div style={{ width: `${Math.min(progress, 100)}%` }} className="progress-fill"></div>
                                            </div>
                                            <div className="flex-between">
                                                <span>{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <p className="small">Deadline: {g.deadline} • Remaining: {formatCurrency(remaining)}</p>
                                            <div className="flex gap">
                                                <button onClick={() => {
                                                    const amt = prompt('Add amount (₹):');
                                                    if (amt) updateGoal(g.id, parseFloat(amt));
                                                }} className="btn-primary flex-1">Add Progress</button>
                                                <button onClick={() => {
                                                    const amt = prompt('Subtract amount (₹):');
                                                    if (amt) updateGoal(g.id, -parseFloat(amt));
                                                }} className="btn-secondary flex-1">Subtract</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {view === 'assistant' && (
                    <div className="view">
                        <div className="hero">
                            <h1>AI Assistant</h1>
                            <p>Get personalized financial advice</p>
                        </div>

                        <div className="chat-container">
                            <div className="chat-messages">
                                {chatHistory.length === 0 ? (
                                    <div className="chat-empty">
                                        <MessageSquare />
                                        <p>Ask me anything about your finances!</p>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`chat-message chat-${msg.role}`}>
                                            <div className="chat-bubble">{msg.content}</div>
                                        </div>
                                    ))
                                )}
                                {chatLoading && (
                                    <div className="chat-message chat-assistant">
                                        <div className="chat-bubble"><RefreshCw className="spinner-sm" /> Thinking...</div>
                                    </div>
                                )}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && sendChat()}
                                    placeholder="Ask about your finances..."
                                />
                                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="btn-primary">
                                    <Send />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
