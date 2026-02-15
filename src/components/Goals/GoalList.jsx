import React from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const GoalList = ({ goals, onAddGoal, onDeleteGoal, onUpdateGoal }) => {
    return (
        <div className="view">
            <div className="hero">
                <h1>Financial Goals</h1>
                <p>Track your progress toward your dreams</p>
            </div>
            <button onClick={onAddGoal} className="btn-primary fab"><Plus /> Add Goal</button>

            {goals.length === 0 ? (
                <div className="card empty">
                    <Target />
                    <p>No goals yet. Create your first goal!</p>
                    <button onClick={onAddGoal} className="btn-primary"><Plus /> Create Goal</button>
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
                                    <button onClick={() => onDeleteGoal(g.id)} className="btn-icon"><Trash2 /></button>
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
                                        if (amt) onUpdateGoal(g.id, parseFloat(amt));
                                    }} className="btn-primary flex-1">Add Progress</button>
                                    <button onClick={() => {
                                        const amt = prompt('Subtract amount (₹):');
                                        if (amt) onUpdateGoal(g.id, -parseFloat(amt));
                                    }} className="btn-secondary flex-1">Subtract</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GoalList;
