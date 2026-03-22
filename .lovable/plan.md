
# FinanceAI — Smart Financial Advisor MVP

## Overview
A premium-looking AI-powered financial advisor app with a beautiful dashboard and conversational chat interface, using mock data to demonstrate the intelligence layer.

## Pages & Features

### 1. Dashboard (Home)
- **Financial Health Score** — animated circular gauge (0-100) with color-coded rating
- **Spending Overview** — donut chart showing category breakdown (Food, Transport, Entertainment, Bills, etc.)
- **Monthly Trend** — area chart showing income vs. expenses over 6 months
- **Quick Stats Cards** — total balance, monthly spending, savings rate, predicted end-of-month balance
- **Smart Alerts Feed** — 3-4 AI-generated insights like "You're spending 28% more on food than your baseline" or "At current rate, you'll save $420 this month"

### 2. AI Chat Advisor
- Full-screen conversational interface with sleek message bubbles
- Users can ask questions like "Can I afford a new laptop?", "How am I doing this month?", "Where can I cut spending?"
- AI responds with personalized advice based on mock financial profile
- Suggested quick-action chips: "Monthly summary", "Spending tips", "Savings plan"
- Streaming responses with markdown rendering
- Powered by Lovable AI (Gemini) via edge function

### 3. Transactions View
- Scrollable list of mock transactions with category icons, amounts, and dates
- Category filter tabs (All, Food, Transport, Entertainment, Bills, etc.)
- Search bar
- Each transaction shows auto-categorization tag

### 4. Goals & Budget
- Visual savings goal cards with progress bars (e.g., "Emergency Fund — 64% complete")
- Auto-generated budget recommendations based on spending patterns
- Simple goal creation modal

## Design
- Dark theme with accent gradients (deep navy/purple with teal/green accents)
- Glass-morphism cards with subtle blur effects
- Smooth animations and transitions
- Clean typography, lots of whitespace
- Mobile-responsive

## Navigation
- Bottom tab bar on mobile / sidebar on desktop
- Tabs: Dashboard, Chat, Transactions, Goals

## Backend
- Lovable Cloud for edge functions
- Lovable AI for the chat advisor (Gemini model)
- Mock data generated in-app (no database needed initially)

## Mock Data
- 3 months of realistic transactions across 6-8 categories
- Pre-calculated financial health score
- Simulated behavioral patterns for the AI to reference
