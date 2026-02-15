import React, { useState } from 'react';
import { RefreshCw, Plus, Trash2, Calendar } from 'lucide-react';
import { formatCurrency, categoryColors } from '../../utils/helpers';

const RecurringManager = ({ recurring, setRecurring }) => {
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        description: '', amount: '', type: 'debit', category: 'Other', frequency: 'monthly', nextDueDate: ''
    });

    const handleAdd = (e) => {
        e.preventDefault();
        setRecurring([...recurring, { ...newItem, id: Date.now(), amount: parseFloat(newItem.amount) }]);
        setShowModal(false);
        setNewItem({ description: '', amount: '', type: 'debit', category: 'Other', frequency: 'monthly', nextDueDate: '' });
    };

    const handleDelete = (id) => {
        setRecurring(recurring.filter(i => i.id !== id));
    };

    return (
        <div className="view">
            <div className="hero">
                <h1>Recurring Transactions</h1>
                <p>Manage subscriptions, rent, and regular payments</p>
            </div>

            <button onClick={() => setShowModal(true)} className="btn-primary fab"><Plus /> Add Recurring</button>

            <div className="card">
                {recurring.length === 0 ? (
                    <div className="empty">
                        <RefreshCw />
                        <p>No recurring transactions set.</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary">Add First One</button>
                    </div>
                ) : (
                    <div className="space-y">
                        {recurring.map(item => (
                            <div key={item.id} className="txn-item">
                                <div className="txn-icon" style={{ background: categoryColors[item.category] + '20' }}>
                                    <RefreshCw style={{ color: categoryColors[item.category] }} size={20} />
                                </div>
                                <div className="txn-details">
                                    <div className="txn-desc">{item.description}</div>
                                    <div className="txn-meta">
                                        {formatCurrency(item.amount)} • {item.frequency} • Next: {item.nextDueDate}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="btn-icon"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-header">Add Recurring Transaction</h2>
                        <form className="modal-body" onSubmit={handleAdd}>
                            <label>Description</label>
                            <input value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} required placeholder="Netflix" />

                            <label>Amount (₹)</label>
                            <input type="number" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} required placeholder="199" />

                            <label>Type</label>
                            <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
                                <option value="debit">Expense</option>
                                <option value="credit">Income</option>
                            </select>

                            <label>Category</label>
                            <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <label>Frequency</label>
                            <select value={newItem.frequency} onChange={e => setNewItem({ ...newItem, frequency: e.target.value })}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>

                            <label>Next Due Date</label>
                            <input type="date" value={newItem.nextDueDate} onChange={e => setNewItem({ ...newItem, nextDueDate: e.target.value })} required />

                            <button type="submit" className="btn-primary">Add</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringManager;
