# Finance Tracker - Quick Start Guide

## ✅ Status: Ready to Use!

Your Financial Assistant app is now running at: **http://localhost:3000**

## What Was Fixed

1. **Critical Bug Fixed**: The `formatCurrency` function was missing `.format(amount)`, which would have caused the app to crash when displaying currency values.

2. **Complete Setup**: Created all necessary configuration files:
   - `package.json` - Dependencies and scripts
   - `vite.config.js` - Build configuration
   - `index.html` - Entry point
   - `src/main.jsx` - React initialization with localStorage support

## How to Use the App

Open **http://localhost:3000** in your browser to access:

### 1. Dashboard
- View financial overview
- See income, expenses, and savings rate
- Access quick actions

### 2. Bank Linking
- Select your bank from the dropdown
- Enter any 6-digit code (demo: "123456")
- Get sample transactions automatically

### 3. Transactions
- Upload your bank CSV file
- Auto-categorize transactions
- Filter by category

### 4. Analysis
- Run AI analysis (requires API key - see below)
- Get spending insights
- View financial personality

### 5. Goals
- Create financial goals
- Track progress
- Update goal amounts

### 6. AI Assistant
- Chat about your finances (requires API key)
- Get personalized advice

## ⚠️ API Key Note

The AI features need an Anthropic API key. To enable:
1. Get an API key from https://console.anthropic.com
2. Add it to the `headers` in lines 314-318 and 430-434:
   ```javascript
   headers: {
       'Content-Type': 'application/json',
       'x-api-key': 'your-api-key-here',  // Add this line
       'anthropic-version': '2023-06-01'   // Add this line
   }
   ```

All other features work without API keys!

## Commands

```bash
npm run dev      # Start development server (already running)
npm run build    # Build for production
npm run preview  # Preview production build
```
