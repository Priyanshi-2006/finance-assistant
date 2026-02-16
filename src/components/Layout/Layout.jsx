import React from 'react';
import { Shield, PieChart, FileText, Sparkles, Target, MessageSquare, Settings, RefreshCw, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ currentView, setView, setShowSettings, children }) => {
    const { logout } = useAuth();

    return (
        <div className="app">
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
                        { id: 'budget', icon: Target, label: 'Budget' },
                        { id: 'recurring', icon: RefreshCw, label: 'Recurring' },
                        { id: 'bills', icon: Bell, label: 'Bills' },
                        { id: 'analysis', icon: Sparkles, label: 'Analysis' },
                        { id: 'goals', icon: Target, label: 'Goals' },
                        { id: 'assistant', icon: MessageSquare, label: 'Assistant' }
                    ].map(item => (
                        <button key={item.id} className={currentView === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
                            <item.icon />
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <button onClick={() => setShowSettings(true)}><Settings /><span>Settings</span></button>
                    <button onClick={logout} className="logout-btn"><LogOut /><span>Logout</span></button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main">
                {children}
            </main>
        </div>
    );
};

export default Layout;
