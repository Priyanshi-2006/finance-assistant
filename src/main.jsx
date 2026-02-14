import React from 'react'
import ReactDOM from 'react-dom/client'
import FinancialAssistant from './financial-assistant.jsx'

// Add storage API for persistence
window.storage = {
    get: async (key, _encrypted) => {
        try {
            const value = localStorage.getItem(key);
            return value ? { value } : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },
    set: async (key, value, _encrypted) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <FinancialAssistant />
    </React.StrictMode>,
)
