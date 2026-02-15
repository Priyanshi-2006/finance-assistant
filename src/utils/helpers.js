import { Coffee, ShoppingBag, Car, Music, Zap, Heart, Plane, Book, Home, TrendingUp, DollarSign, CreditCard } from 'lucide-react';

export const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const autoCategorizTransaction = (description) => {
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

export const categoryIcons = {
    'Food & Dining': Coffee, 'Shopping': ShoppingBag, 'Transportation': Car,
    'Entertainment': Music, 'Utilities': Zap, 'Healthcare': Heart, 'Travel': Plane,
    'Education': Book, 'Rent': Home, 'Investment': TrendingUp, 'Salary': DollarSign, 'Other': CreditCard
};

export const categoryColors = {
    'Food & Dining': '#FF6B6B', 'Shopping': '#4ECDC4', 'Transportation': '#45B7D1',
    'Entertainment': '#96CEB4', 'Utilities': '#FFEAA7', 'Healthcare': '#DFE6E9',
    'Travel': '#74B9FF', 'Education': '#A29BFE', 'Rent': '#FD79A8',
    'Investment': '#6C5CE7', 'Salary': '#00B894', 'Other': '#B2BEC3'
};
