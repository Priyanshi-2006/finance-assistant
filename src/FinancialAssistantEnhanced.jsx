import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Target, Shield, Upload, FileText, MessageSquare, PieChart, Calendar, CheckCircle, XCircle, AlertTriangle, Sparkles, Download, Plus, Trash2, Eye, EyeOff, RefreshCw, DollarSign, CreditCard, ShoppingBag, Coffee, Car, Home, Heart, Zap, Music, Book, Plane, Gift, Smartphone, X, Send, Settings, Key } from 'lucide-react';

// Utility Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
};

const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] || '';
        });
        return obj;
    });
};

const categorizationRules = {
    'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'food', 'dominos', 'pizza', 'mcdonald', 'kfc', 'starbucks', 'dunkin'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shop', 'mall', 'store', 'retail', 'fashion'],
    'Transportation': ['uber', 'ola', 'rapido', 'petrol', 'fuel', 'metro', 'bus', 'taxi', 'car', 'parking'],
    'Entertainment': ['netflix', 'prime', 'hotstar', 'spotify', 'movie', 'cinema', 'pvr', 'inox', 'gaming', 'steam'],
    'Utilities': ['electricity', 'water', 'gas', 'broadband', 'wifi', 'internet', 'mobile', 'recharge', 'airtel', 'jio'],
    'Healthcare': ['pharmacy', 'hospital', 'doctor', 'clinic', 'medical', 'health', 'apollo', 'medicine', 'practo'],
    'Travel': ['flight', 'hotel', 'makemytrip', 'goibibo', 'booking', 'airbnb', 'train', 'irctc', 'cleartrip'],
    'Education': ['course', 'udemy', 'coursera', 'book', 'education', 'tuition', 'school', 'college'],
    'Rent': ['rent', 'lease', 'housing'],
    'Investment': ['mutual fund', 'stock', 'sip', 'investment', 'zerodha', 'groww'],
    'Salary': ['salary', 'income', 'payroll'],
    'Other': []
};

const categoryIcons = {
    'Food & Dining': Coffee,
    'Shopping': ShoppingBag,
    'Transportation': Car,
    'Entertainment': Music,
    'Utilities': Zap,
    'Healthcare': Heart,
    'Travel': Plane,
    'Education': Book,
    'Rent': Home,
    'Investment': TrendingUp,
    'Salary': DollarSign,
    'Other': CreditCard
};

const categoryColors = {
    'Food & Dining': '#FF6B6B',
    'Shopping': '#4ECDC4',
    'Transportation': '#45B7D1',
    'Entertainment': '#96CEB4',
    'Utilities': '#FFEAA7',
    'Healthcare': '#DFE6E9',
    'Travel': '#74B9FF',
    'Education': '#A29BFE',
    'Rent': '#FD79A8',
    'Investment': '#6C5CE7',
    'Salary': '#00B894',
    'Other': '#B2BEC3'
};

const autoCategorizTransaction = (description) => {
    const desc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(categorizationRules)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
            return category;
        }
    }

    return 'Other';
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            {type === 'success' && <CheckCircle className="w-5 h-5" />}
            {type === 'error' && <XCircle className="w-5 h-5" />}
            <span>{message}</span>
        </div>
    );
};

// Main App Component
export default function FinancialAssistant() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [bankLinked, setBankLinked] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [bankName, setBankName] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    // New state for enhanced features
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [toast, setToast] = useState(null);

    // Expense form state
    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'debit',
        category: 'Other'
    });

    // Goal form state
    const [goalForm, setGoalForm] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        emoji: '🎯'
    });

    // Load data from persistent storage
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);

            // Load API key
            try {
                const keyResult = await window.storage.get('apiKey', false);
                if (keyResult?.value) {
                    setApiKey(keyResult.value);
                }
            } catch (e) {
                console.log('No API key found');
            }

            // Load transactions
            try {
                const txnResult = await window.storage.get('transactions', false);
                if (txnResult?.value) {
                    setTransactions(JSON.parse(txnResult.value));
                }
            } catch (e) {
                console.log('No transactions found');
            }

            // Load goals
            try {
                const goalsResult = await window.storage.get('goals', false);
                if (goalsResult?.value) {
                    setGoals(JSON.parse(goalsResult.value));
                }
            } catch (e) {
                console.log('No goals found');
            }

            // Load user data
            try {
                const userResult = await window.storage.get('userData', false);
                if (userResult?.value) {
                    const user = JSON.parse(userResult.value);
                    setUserData(user);
                    setBankLinked(user.bankLinked || false);
                }
            } catch (e) {
                console.log('No user data found');
            }

            // Load analysis
            try {
                const analysisResult = await window.storage.get('analysis', false);
                if (analysisResult?.value) {
                    setAnalysis(JSON.parse(analysisResult.value));
                }
            } catch (e) {
                console.log('No analysis found');
            }

            // Load chat history
            try {
                const chatResult = await window.storage.get('chatHistory', false);
                if (chatResult?.value) {
                    setChatHistory(JSON.parse(chatResult.value));
                }
            } catch (e) {
                console.log('No chat history found');
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveTransactions = async (txns) => {
        try {
            await window.storage.set('transactions', JSON.stringify(txns), false);
            setTransactions(txns);
        } catch (error) {
            console.error('Error saving transactions:', error);
        }
    };

    const saveGoals = async (newGoals) => {
        try {
            await window.storage.set('goals', JSON.stringify(newGoals), false);
            setGoals(newGoals);
        } catch (error) {
            console.error('Error saving goals:', error);
        }
    };

    const saveUserData = async (data) => {
        try {
            await window.storage.set('userData', JSON.stringify(data), false);
            setUserData(data);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const saveAnalysis = async (analysisData) => {
        try {
            await window.storage.set('analysis', JSON.stringify(analysisData), false);
            setAnalysis(analysisData);
        } catch (error) {
            console.error('Error saving analysis:', error);
        }
    };

    const saveApiKey = async (key) => {
        try {
            await window.storage.set('apiKey', key, false);
            setApiKey(key);
        } catch (error) {
            console.error('Error saving API key:', error);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Add manual expense
    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!expenseForm.description || !expenseForm.amount) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const newTransaction = {
            date: expenseForm.date,
            description: expenseForm.description,
            amount: expenseForm.type === 'credit' ? parseFloat(expenseForm.amount) : -parseFloat(expenseForm.amount),
            type: expenseForm.type,
            category: expenseForm.category
        };

        await saveTransactions([...transactions, newTransaction]);
        showToast('Transaction added successfully!');
        setShowAddExpense(false);
        setExpenseForm({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            type: 'debit',
            category: 'Other'
        });
    };

    // Bank Linking Simulation
    const handleBankLinking = () => {
        if (!bankName) {
            showToast('Please select your bank', 'error');
            return;
        }
        setShowOTP(true);
    };

    const verifyOTP = async () => {
        if (otp === '123456' || otp.length === 6) {
            const newUserData = {
                ...userData,
                bankLinked: true,
                bankName: bankName,
                linkedDate: new Date().toISOString(),
                accountNumber: `XXXX${Math.floor(Math.random() * 10000)}`
            };
            await saveUserData(newUserData);
            setBankLinked(true);
            setShowOTP(false);
            setOtp('');
            showToast('Bank linked successfully!');

            // Generate sample transactions after linking
            generateSampleTransactions();
        } else {
            showToast('Invalid OTP. Try 123456 or any 6-digit code.', 'error');
        }
    };

    // Generate realistic sample transactions
    const generateSampleTransactions = async () => {
        const sampleTxns = [
            { date: '2025-02-01', description: 'Salary Credit - Tech Corp', amount: 85000, type: 'credit', category: 'Salary' },
            { date: '2025-02-02', description: 'Rent Payment - Landlord', amount: -18000, type: 'debit', category: 'Rent' },
            { date: '2025-02-03', description: 'Swiggy - Dinner Order', amount: -450, type: 'debit', category: 'Food & Dining' },
            { date: '2025-02-04', description: 'Amazon - Electronics', amount: -2499, type: 'debit', category: 'Shopping' },
            { date: '2025-02-05', description: 'Uber - Ride to Office', amount: -180, type: 'debit', category: 'Transportation' },
            { date: '2025-02-05', description: 'Netflix Subscription', amount: -649, type: 'debit', category: 'Entertainment' },
            { date: '2025-02-06', description: 'Zomato - Lunch', amount: -320, type: 'debit', category: 'Food & Dining' },
            { date: '2025-02-07', description: 'Petrol Pump', amount: -1500, type: 'debit', category: 'Transportation' },
            { date: '2025-02-08', description: 'Myntra - Clothing', amount: -3200, type: 'debit', category: 'Shopping' },
            { date: '2025-02-09', description: 'Apollo Pharmacy', amount: -850, type: 'debit', category: 'Healthcare' },
            { date: '2025-02-10', description: 'Electricity Bill', amount: -1200, type: 'debit', category: 'Utilities' },
            { date: '2025-02-11', description: 'Starbucks Coffee', amount: -420, type: 'debit', category: 'Food & Dining' },
            { date: '2025-02-12', description: 'Ola Cab', amount: -250, type: 'debit', category: 'Transportation' },
            { date: '2025-02-13', description: 'Flipkart - Books', amount: -899, type: 'debit', category: 'Education' },
            { date: '2025-02-14', description: 'Restaurant - Date Night', amount: -2800, type: 'debit', category: 'Food & Dining' },
        ];

        await saveTransactions(sampleTxns);
        showToast('Sample transactions loaded!');
    };

    // CSV Upload Handler
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const parsed = parseCSV(text);

                const newTransactions = parsed.map(row => ({
                    date: row.Date || row.date || row.DATE,
                    description: row.Description || row.description || row.Narration || row.narration,
                    amount: parseFloat(row.Amount || row.amount || row.AMOUNT || 0),
                    type: (row.Type || row.type || 'debit').toLowerCase(),
                    category: autoCategorizTransaction(row.Description || row.description || row.Narration || '')
                })).filter(txn => txn.date && txn.description);

                await saveTransactions([...transactions, ...newTransactions]);
                showToast(`Successfully imported ${newTransactions.length} transactions`);
            } catch (error) {
                showToast('Error parsing CSV file', 'error');
            }
        };
        reader.readAsText(file);
    };

    // AI Analysis Function with API Key
    const runAIAnalysis = async () => {
        if (transactions.length === 0) {
            showToast('No transactions to analyze. Please add some first.', 'error');
            return;
        }

        if (!apiKey) {
            showToast('Please configure your API key in settings', 'error');
            setShowSettings(true);
            return;
        }

        setAnalysisLoading(true);

        try {
            const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = Math.abs(transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0));

            const categorySpending = {};
            transactions.filter(t => t.type === 'debit').forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
            });

            const prompt = `You are a financial advisor. Analyze this data and provide detailed insights in JSON format.

Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpense}
Savings Rate: ${((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)}%

Category Breakdown:
${Object.entries(categorySpending).map(([cat, amt]) => `- ${cat}: ₹${amt} (${(amt / totalExpense * 100).toFixed(1)}%)`).join('\n')}

Provide a JSON response with:
{
  "personality": "Financial personality (Saver/Spender/Balanced/Impulsive)",
  "topCategories": [{"category": "name", "amount": 1000, "analysis": "brief analysis"}],
  "anomalies": ["Unusual pattern 1", "Unusual pattern 2"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "savingsPotential": 5000,
  "healthScore": 75
}`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const analysisText = data.content[0].text;

            // Try to parse JSON from response
            let analysisResult;
            try {
                const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
                analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } catch { }

            if (!analysisResult) {
                // Fallback to basic analysis
                analysisResult = {
                    personality: 'Balanced',
                    topCategories: Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, amt]) => ({
                        category: cat,
                        amount: amt,
                        analysis: `You spent ${(amt / totalExpense * 100).toFixed(1)}% of your budget here`
                    })),
                    anomalies: ['API response was not in expected format'],
                    recommendations: [analysisText.substring(0, 200)],
                    savingsPotential: Math.floor(totalExpense * 0.15),
                    healthScore: Math.min(100, Math.floor((totalIncome - totalExpense) / totalIncome * 150))
                };
            }

            await saveAnalysis({
                ...analysisResult,
                total                Income,
                totalExpense,
                savingsRate: ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1),
                categorySpending,
                lastUpdated: new Date().toISOString()
            });

            showToast('Analysis completed successfully!');
        } catch (error) {
            console.error('Analysis error:', error);
            showToast('Error running analysis. Check your API key.', 'error');
        } finally {
            setAnalysisLoading(false);
        }
    };

    // Goal Management with Modal
    const handleAddGoal = async (e) => {
        e.preventDefault();

        if (!goalForm.name || !goalForm.targetAmount || !goalForm.deadline) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        const newGoal = {
            id: Date.now(),
            name: goalForm.name,
            emoji: goalForm.emoji,
            targetAmount: parseFloat(goalForm.targetAmount),
            currentAmount: 0,
            deadline: goalForm.deadline,
            createdDate: new Date().toISOString()
        };

        await saveGoals([...goals, newGoal]);
        showToast('Goal created successfully!');
        setShowAddGoal(false);
        setGoalForm({
            name: '',
            targetAmount: '',
            deadline: '',
            emoji: '🎯'
        });
    };

    const updateGoalProgress = async (goalId, amount) => {
        const updated = goals.map(g =>
            g.id === goalId
                ? { ...g, currentAmount: Math.max(0, g.currentAmount + parseFloat(amount)) }
                : g
        );
        await saveGoals(updated);
        showToast('Goal progress updated!');
    };

    const deleteGoal = async (goalId) => {
        await saveGoals(goals.filter(g => g.id !== goalId));
        showToast('Goal deleted');
    };

    // AI Chat Assistant with API
    const handleChat = async () => {
        if (!chatInput.trim()) return;

        if (!apiKey) {
            showToast('Please configure your API key in settings', 'error');
            setShowSettings(true);
            return;
        }

        const userMessage = chatInput.trim();
        setChatInput('');
        const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
        setChatHistory(newHistory);
        setChatLoading(true);

        try {
            const context = `You are a helpful financial assistant. The user has:
- ${transactions.length} transactions
- Bank linked: ${bankLinked ? 'Yes' : 'No'}
- ${goals.length} active goals
${analysis ? `- Financial personality: ${analysis.personality}
- Monthly income: ₹${analysis.totalIncome}
- Monthly expenses: ₹${analysis.totalExpense}
- Savings rate: ${analysis.savingsRate}%` : ''}

User question: ${userMessage}

Provide helpful, specific, and actionable financial advice.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1500,
                    messages: newHistory.slice(-10),
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const assistantMessage = data.content[0].text;

            const updatedHistory = [
                ...newHistory,
                { role: 'assistant', content: assistantMessage }
            ];
            setChatHistory(updatedHistory);

            // Save chat history
            await window.storage.set('chatHistory', JSON.stringify(updatedHistory), false);
        } catch (error) {
            console.error('Chat error:', error);
            setChatHistory([
                ...newHistory,
                { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API key in settings.' }
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    // Continue in next part due to size...
    return (
        <div className="min-h-screen gradient-bg">
            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Loading */}
            {loading && (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading your financial data...</p>
                    </div>
                </div>
            )}

            {!loading && <div>Main content here</div>}
        </div>
    );
}
