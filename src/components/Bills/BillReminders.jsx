import React, { useState } from 'react';
import { Bell, Plus, Calendar, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const BillReminders = ({ bills, setBills }) => {
    const [showModal, setShowModal] = useState(false);
    const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setBills([...bills, { ...newBill, id: Date.now(), paid: false, amount: parseFloat(newBill.amount) }]);
        setShowModal(false);
        setNewBill({ name: '', amount: '', dueDate: '' });
    };

    const togglePaid = (id) => {
        setBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
    };

    const deleteBill = (id) => {
        setBills(bills.filter(b => b.id !== id));
    };

    const getUrgency = (date) => {
        const today = new Date();
        const due = new Date(date);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: '#ef4444', text: 'Overdue', icon: AlertCircle };
        if (diffDays <= 3) return { color: '#ef4444', text: `${diffDays} days left`, icon: AlertCircle };
        if (diffDays <= 7) return { color: '#f59e0b', text: `${diffDays} days left`, icon: Bell };
        return { color: '#10b981', text: `${diffDays} days left`, icon: Calendar };
    };

    const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return (
        <div className="view">
            <div className="hero">
                <h1>Bill Reminders</h1>
                <p>Never miss a payment again</p>
            </div>

            <button onClick={() => setShowModal(true)} className="btn-primary fab"><Plus /> Add Bill</button>

            <div className="card">
                {bills.length === 0 ? (
                    <div className="empty">
                        <Bell />
                        <p>No bills tracked.</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary">Add First Bill</button>
                    </div>
                ) : (
                    <div className="space-y">
                        {sortedBills.map(bill => {
                            const status = getUrgency(bill.dueDate);
                            const StatusIcon = status.icon;

                            return (
                                <div key={bill.id} className="txn-item" style={{ opacity: bill.paid ? 0.6 : 1 }}>
                                    <div className="txn-icon" style={{ background: bill.paid ? '#10b98120' : status.color + '20' }}>
                                        {bill.paid ? <CheckCircle style={{ color: '#10b981' }} /> : <StatusIcon style={{ color: status.color }} />}
                                    </div>
                                    <div className="txn-details">
                                        <div className="txn-desc" style={{ textDecoration: bill.paid ? 'line-through' : 'none' }}>{bill.name}</div>
                                        <div className="txn-meta">
                                            {formatCurrency(bill.amount)} • {bill.dueDate}
                                        </div>
                                    </div>
                                    <div className="flex gap">
                                        {!bill.paid && (
                                            <div className="badge" style={{ background: status.color, fontSize: '12px' }}>
                                                {status.text}
                                            </div>
                                        )}
                                        <button onClick={() => togglePaid(bill.id)} className="btn-icon">
                                            {bill.paid ? <XCircle /> : <CheckCircle />}
                                        </button>
                                        <button onClick={() => deleteBill(bill.id)} className="btn-icon"><Trash2 /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-header">Add Bill</h2>
                        <form className="modal-body" onSubmit={handleAdd}>
                            <label>Description</label>
                            <input value={newBill.name} onChange={e => setNewBill({ ...newBill, name: e.target.value })} required placeholder="Electricity Bill" />

                            <label>Amount (₹)</label>
                            <input type="number" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} required placeholder="1500" />

                            <label>Due Date</label>
                            <input type="date" value={newBill.dueDate} onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })} required />

                            <button type="submit" className="btn-primary">Add Bill</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillReminders;
