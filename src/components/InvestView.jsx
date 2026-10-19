import React, { useState } from 'react';

export default function InvestView({ onOpenDepositModal }) {
  const [investAmount, setInvestAmount] = useState(100);

  const minAmount = 10;
  const maxAmount = 10000;

  const currentAmount = Math.max(minAmount, Math.min(maxAmount, Number(investAmount) || minAmount));

  // 50% Monthly Profit Calculations
  const monthlyProfit = currentAmount * 0.50;
  const dailyProfit = monthlyProfit / 30;

  const handleAction = (e) => {
    e.preventDefault();
    onOpenDepositModal();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      
      {/* Title Header */}
      <div className="text-center mb-8 space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          Fixed Yield Plan
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Invest & Earn <span className="text-amber-400">50% Monthly</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Flexible start from $10 up to $10,000 USD with daily profit accruals.
        </p>
      </div>

      {/* Main Clean Card */}
      <div className="bg-[#0b1026]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Input Box */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-300 uppercase">
              Investment Amount ($ USD)
            </label>
            <span className="text-[11px] font-semibold text-gray-400">
              Min $10 — Max $10,000
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-amber-400">$</span>
            <input
              type="number"
              min={minAmount}
              max={maxAmount}
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-xl font-bold text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[10, 50, 100, 500, 1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setInvestAmount(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAmount === amt
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Profit Returns Display */}
        <div className="grid grid-cols-2 gap-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase">Daily Profit</span>
            <span className="text-lg font-black text-cyan-400">+${dailyProfit.toFixed(2)} USD</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-semibold block uppercase">Monthly Return (50%)</span>
            <span className="text-lg font-black text-amber-400">+${monthlyProfit.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Action Button connected directly to Deposit */}
        <button
          type="button"
          onClick={handleAction}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider"
        >
          Proceed to Deposit & Invest ${currentAmount} →
        </button>

      </div>
    </div>
  );
}