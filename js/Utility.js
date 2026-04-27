// ════════════════════════════════════════════════════════
//  WAMY — Utility.js
//  Financial calculation formulas
// ════════════════════════════════════════════════════════

window.Utility = {
  /**
   * Calculates the net cost of a transaction including brokerage fees and VAT (10%).
   * Net = (Price × Qty) + Brokerage Fees (incl VAT).
   */
  /**
   * Calculates the net cost of a transaction including brokerage fees and VAT (10%).
   */
  calculateNetCost: function(price, qty, brokerageFeePercentage) {
    const p = price || 0;
    const q = qty || 0;
    const grossAmount = p * q;
    const brokerageFees = grossAmount * brokerageFeePercentage;
    const vat = brokerageFees * 0.10; 
    const bourseAmount = grossAmount * 0.001;
    return {
      grossAmount,
      brokerageFees,
      vat,
      bourseAmount,
      totalFees: brokerageFees + vat + bourseAmount,
      total: grossAmount + brokerageFees + vat + bourseAmount
    };
  },

  /**
   * Converts large numbers into readable compact strings (K, M, B)
   */
  formatCompactNumber: function(num) {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  /**
   * Calculates position percentage in a range [low, high]
   */
  getRangePercentage: function(current, low, high) {
    if (!low || !high || high === low) return 0;
    const pct = ((current - low) / (high - low)) * 100;
    return Math.min(100, Math.max(0, pct));
  },

  /**
   * Automatically calculates the weighted average cost across multiple buy orders.
   */
  calculateDynamicPRU: function(orders) {
    if (!orders || orders.length === 0) return 0;
    let totalCost = 0;
    let totalQty = 0;
    for (const order of orders) {
      totalCost += order.price * order.qty;
      totalQty += order.qty;
    }
    return totalQty === 0 ? 0 : totalCost / totalQty;
  },

  /**
   * Estimates annual returns based on a user-defined investment amount.
   */
  simulateDividendYield: function(investmentAmount, stockDivYield) {
    if (!stockDivYield) return 0;
    const returnRate = stockDivYield / 100;
    return investmentAmount * returnRate;
  }
};
