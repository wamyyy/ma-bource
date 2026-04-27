// ════════════════════════════════════════════════════════
//  WAMY — Stock.js
//  Data Model: Encapsulates all stock data and computations
// ════════════════════════════════════════════════════════
import { AVATAR_BG, SECTOR_LABELS, SECTOR_COLORS } from './Constants.js';

export class Stock {
  constructor(data) {
    this.rank      = data.rank;
    this.name      = (data.name || '').trim();
    this.ticker    = (data.ticker || '').trim();
    this.sector    = data.sector;
    this.price     = data.price ?? (data.CoursDeReferance ?? 0);
    this.change    = data.change ?? 0;
    this.vol       = data.vol;
    
    // Live Market Data Fields
    this.high      = data.high ?? (data.PlusHaut ?? 0);
    this.low       = data.low ?? (data.PlusBas ?? 0);
    this.open      = data.open ?? (data.Ouverture ?? 0);
    this.volume    = data.volume ?? (data.Volumes ?? 0);
    this.bid       = data.bid ?? (data.MeilleurDemande ?? 0);
    this.ask       = data.ask ?? (data.MeilleurOffre ?? 0);
    this.refPrice  = data.refPrice ?? (data.CoursDeReferance ?? 0);

    this.ytd       = data.ytd;
    this.cap       = data.cap;
    this.div       = data.div;
    this.divYield  = data.divYield;
    this.divFreq   = data.divFreq;
    this.divDate   = data.divDate;
    this.domain    = data.domain;
  }

  /** Updates stock data from a raw JSON object */
  update(newData) {
    if (!newData) return;
    this.price    = newData.Cours ?? (newData.CoursDeReferance ?? this.price);
    this.change   = newData.Variation ?? this.change;
    this.high     = newData.PlusHaut ?? this.high;
    this.low      = newData.PlusBas ?? this.low;
    this.open     = newData.Ouverture ?? this.open;
    this.volume   = newData.Volumes ?? this.volume;
    this.bid      = newData.MeilleurDemande ?? this.bid;
    this.ask      = newData.MeilleurOffre ?? this.ask;
    this.refPrice = newData.CoursDeReferance ?? this.refPrice;
    this.div      = newData.Dividend ?? this.div;
    this.divYield = newData.Yield    ?? this.divYield;
  }

  /** Returns price formatted in MAD via Intl.NumberFormat */
  formatPrice() {
    if (!this.price) return '—';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.price) + ' MAD';
  }

  /** Returns 'up', 'down', or 'neutral' */
  getTrend() {
    if (this.change > 0)  return 'up';
    if (this.change < 0)  return 'down';
    return 'neutral';
  }

  /** Returns true if the stock is suspended trading */
  isSuspended() {
    return this.ticker === 'SAM';
  }

  /** Returns the sector display label */
  getSectorLabel() {
    return SECTOR_LABELS[this.sector] || this.sector;
  }

  /** Returns the sector CSS color class */
  getSectorColor() {
    return SECTOR_COLORS[this.sector] || 'c1';
  }

  /** Returns the full avatar img URL for use as a logo */
  getLogoUrl(size = 128) {
    const bg      = AVATAR_BG[this.sector] || '15803d';
    const letters = this.ticker.replace(/[^A-Z0-9]/g, '').slice(0, 3)
                    || this.ticker.slice(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(letters)}&background=${bg}&color=ffffff&size=${size}&bold=true&font-size=0.4`;
  }

  /** Returns the HTML string for the stock avatar/logo block */
  getLogoHTML(size = 34) {
    const br    = size <= 28 ? '8px' : '9px';
    const color = this.getSectorColor();
    const url   = this.getLogoUrl(128);
    return `<div class="stock-avatar logo-wrap ${color}" style="width:${size}px;height:${size}px;border-radius:${br};">
      <img src="${url}" class="company-logo avatar-visible" alt="${this.ticker}" loading="lazy">
    </div>`;
  }

  /** Returns a 0-100 Financial Health Score */
  getHealthScore() {
    let score = 50; // Baseline
    // YTD performance: -15% to +15% mapped to 0-30 pts
    const ytdScore = Math.max(0, Math.min(30, ((this.ytd || 0) + 15) * 1));
    score += ytdScore - 15;
    // Dividend yield: 0-10% mapped to 0-25 pts
    const yieldScore = Math.min(25, ((this.divYield || 0) / 10) * 25);
    score += yieldScore;
    // Market cap proxy: if cap is a number, use it (simplified)
    const capStr = String(this.cap || '0').replace(/[^0-9.]/g, '');
    const capVal = parseFloat(capStr) || 0;
    if (capVal > 50000) score += 10;
    else if (capVal > 10000) score += 5;
    // Clamp
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /** Returns a CSS color string based on health score */
  getHealthColor() {
    const s = this.getHealthScore();
    if (s >= 65) return '#22c55e';
    if (s >= 40) return '#eab308';
    return '#ef4444';
  }
}
