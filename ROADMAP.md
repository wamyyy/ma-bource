# WAMY Frontend Improvement Roadmap

## 1. Purpose & Scope
This document defines the complete frontend improvement roadmap for WAMY, the Casablanca Stock Exchange (Bourse de Casablanca) mobile PWA. It covers all planned UX enhancements, new features, data integrations, and infrastructure upgrades required to position WAMY as the premium fintech application in the Moroccan market.

Strategic Goal
Transform WAMY from a real-time stock viewer into a full-featured, premium investment companion app — competing with Bloomberg, Robinhood, and Boursorama at a fraction of the complexity, tailored for the Moroccan investor.

### 1.1 Target Audience
    • Retail investors on the Casablanca Stock Exchange (CSE)
    • Active traders monitoring daily price movements
    • Dividend-focused income investors
    • Financial professionals seeking a mobile-first reference tool

### 1.2 Current State Summary
WAMY currently ships as a PWA with the following pages: Marche (market), Search, Outils (tools), Dividendes, Portfolio, and Favoris. Core features include:
    • Real-time stock list with sector filtering and sorting
    • MASI index card with mini sparkline chart
    • Horizontal market widgets (gainers, losers, most active)
    • Simulated portfolio with P&L tracking (localStorage)
    • Dividend yield rankings with sortable table
    • Watchlist (star-based, persisted in localStorage)
    • Brokerage fee calculator in Outils tab
    • PWA install support via Service Worker

### 1.3 Out of Scope
    • Backend API development or server infrastructure (handled separately)
    • Native iOS/Android app development
    • Regulatory or compliance features (KYC, AML)
    • Real money trading execution

## 2. Priority & Effort Framework
All features in this SOP are classified by priority and implementation effort using the following scales:

Level	Label	Meaning	Target Timeline
P0	Critical / Quick Win	High impact, low effort. Ship immediately. These define the gap between a prototype and a real product.	0–4 weeks
P1	High Priority	Significant UX or monetization impact. Core premium features.	1–3 months
P2	Medium Priority	Meaningful improvements that add polish and depth.	3–6 months
P3	Backlog	Nice-to-have or exploratory. Schedule when bandwidth allows.	6+ months

### 2.1 Effort Scale
Rating	Estimate	Typical Work
Low	< 1 week	CSS/JS additions, UI component tweaks, localStorage logic
Medium	1–3 weeks	New page sections, third-party library integration, modal flows
High	1–2 months	New data layer, API integration, real-time pipeline, auth system

## 3. Full Feature Roadmap

| P  | Feature | Description | Impact | Effort |
|----|---------|-------------|--------|--------|
| P0 | Price Alerts | Push notifications when a stock crosses a user-defined price threshold. In-app badge on the favorites star. | Critical | Low |
| P0 | Interactive Charts | Replace sparklines with TradingView Lightweight Charts (candlestick). Time ranges: 1D / 1W / 1M / YTD. Pinch-to-zoom. | Critical | Medium |
| P0 | Offline Mode Polish | Enhance Service Worker to cache full market data. Show “last updated” timestamp and graceful offline banner. | High | Low |
| P1 | Market Heatmap | Treemap visualization of all CSE stocks colored by % change. Grouped by sector. Tap a cell to open the stock modal. | High | Medium |
| P1 | Advanced Screener | Multi-filter panel: sector + P/E ratio + dividend yield + monthly variation + min volume. Save presets. | High | Medium |
| P1 | Portfolio Analytics | Donut chart for sector allocation, P&L timeline sparkline, volatility estimate, best/worst performer auto-highlight. | High | Medium |
| P1 | News Feed per Stock | Inside each stock modal, add a “News” tab powered by CSE RSS + Google News filtered by company name. | High | Low |
| P1 | PDF Portfolio Export | One-tap export of full portfolio summary: positions, P&L, dividend income forecast, allocation pie. Shareable PDF. | Medium | Medium |
| P2 | Dividend Calendar | Visual calendar showing upcoming ex-dividend and payment dates for all watched and held stocks. | Medium | Medium |
| P2 | Investor Leaderboard | Opt-in anonymous monthly ranking of best-performing portfolios. Gamification to drive engagement and retention. | Medium | Low |
| P2 | Advanced Calculator | Expand Outils tab: tax on dividends (IR Maroc 15%), break-even price calculator, compound return estimator. | Medium | Low |
| P2 | Customizable Home Screen | Let users pin their favorite widgets to the top of the Marche page. | Medium | Medium |
| P2 | Comparison Tool | Side-by-side comparison of 2–3 stocks: price history overlay, fundamental metrics table, dividend yield diff. | Medium | High |
| P3 | WebSocket Live Data | Replace current polling with WebSocket or Server-Sent Events for true real-time price updates without refresh. | Critical | High |
| P3 | Cloud Auth & Sync | Replace localStorage with Supabase (free tier). Portfolio + watchlist synced across devices. Auth via Google or OTP. | Critical | High |
| P3 | Backtesting Tool | Simulate historical portfolio performance: pick stocks + dates + weights, see returns. | High | High |
| P3 | Social Watchlists | Share a watchlist link publicly. Others can import it in one tap. No social feed — just shareable curated lists. | Low | Medium |

## 4. Detailed Feature Specifications

### 4.1 Price Alerts (P0)
**Objective**: Allow users to set price thresholds on any stock. Trigger a push notification and in-app visual cue when the price crosses the defined level.
**UI Changes**:
- Add a bell icon button to each stock row card (next to the star)
- Alert modal: input fields for upper and lower price bounds, optional note
- Alert badge on stock row when an alert is active
- Alerts management screen accessible from user profile or Outils tab
**Technical Implementation**:
- Use the Web Push API with the existing Service Worker (sw.js)
- Store alert configs in localStorage keyed by ticker: `wamy_alerts_{ticker}`
- Polling loop (every 60 seconds) in the SW background sync to compare prices
- On trigger: show Notification via `self.registration.showNotification()`
- On notification click: open app directly to the stock modal

### 4.2 Interactive Charts (P0)
**Objective**: Replace the static sparkline SVGs with fully interactive candlestick/line charts using TradingView Lightweight Charts.
**UI Changes**:
- Stock modal: replace the static chart area with a chart canvas
- Time range pill selector: 1D | 1W | 1M | YTD | MAX
- Toggle between Line and Candlestick view
- Crosshair tooltip showing OHLC and volume on tap
**Technical Implementation**:
- Import via CDN: `cdn.jsdelivr.net/npm/lightweight-charts/dist/lightweight-charts.standalone.production.js`
- Create a dedicated `ChartController` class in `js/ChartController.js`
- Lazy-initialize: only create chart instance when modal opens to save memory

### 4.3 Market Heatmap (P1)
**Objective**: Provide a macro view of the entire CSE market in a single glance using a color-coded treemap.
**UI Changes**:
- New section on the Marche page: 'Market Heatmap'
- Full-width treemap: cells sized by market cap, colored by % change
- Sector grouping toggle: view by individual stocks or aggregated by sector
**Technical Implementation**:
- Use D3.js treemap layout
- SVG rendering for performance on mobile

### 4.4 Cloud Auth & Sync (P3)
**Objective**: Migrate user data (portfolio, watchlist, alerts) from localStorage to Supabase.
**Technical Implementation**:
- Create a Supabase project (tables: users, portfolios, watchlists, alerts)
- Authentication: Google OAuth or Magic link via email
- DataService: local-first with Supabase sync on change (offline-safe)

## 5. UX Design Principles
- **Mobile First**: 375px wide screen focus. No horizontal scroll. Touch targets 44x44px.
- **Dark Mode Native**: WAMY's dark green theme is primary. Use CSS variables.
- **Instant Feedback**: < 100ms response visually/haptically.
- **Data Density**: Compact cards, badges, sparklines.
- **Graceful Degradation**: Offline/error fallbacks.
- **Performance Budget**: Interactive in < 2s on 4G. Added features < 50KB JS limit.
- **Accessibility**: Aria-labels and color-blind safe palettes.

## 6. Testing & QA Standards
- Must be tested on Android Chrome, iPhone Safari, and Desktop Chrome.
- Lighthouse score: Performance ≥ 85 on mobile.
- FCP < 1.5s, TTI < 3s, CLS < 0.1.

## 7. Release & Deployment Process
Follow strict branch naming `feature/[name]`. PR requirement, SEMVER (MAJOR.MINOR.PATCH) rules applied.
