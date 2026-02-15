import { FileText, CreditCard, Plus, Download } from 'lucide-react';
import { formatCurrency, categoryIcons, categoryColors } from '../../utils/helpers';
import { exportToCSV } from '../../utils/csvExport';

const TransactionList = ({ transactions, onAddTransaction }) => {
    return (
        <div className="view">
            <div className="hero">
                <h1>Transactions</h1>
                <p>{transactions.length} transactions tracked</p>
            </div>
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 100 }}>
                <button onClick={() => exportToCSV(transactions)} className="btn-secondary" title="Export CSV"><Download /></button>
                <button onClick={onAddTransaction} className="btn-primary"><Plus /> Add Transaction</button>
            </div>

            <div className="card">
                <div className="txn-list">
                    {transactions.length === 0 ? (
                        <div className="empty">
                            <FileText />
                            <p>No transactions yet</p>
                            <button onClick={onAddTransaction} className="btn-primary"><Plus /> Add First Transaction</button>
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
                                        <div className="txn-meta">{t.date} • {t.category}</div>
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
    );
};

export default TransactionList;
