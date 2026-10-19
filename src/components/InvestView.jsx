import React, { useState } from 'react';

export default function InvestView({ onOpenDepositModal, isLoggedIn, handleGetStartedClick }) {
  const [investAmount, setInvestAmount] = useState(100);
  const [investedSuccess, setInvestedSuccess] = useState(false);

  const minAmount = 10;
  const maxAmount = 10000;

  const currentAmount = Math.max(minAmount, Math.min(maxAmount, Number(investAmount) || minAmount));

  // 50% Monthly return calculation
  const monthlyProfit = currentAmount * 0.50;
  const dailyProfit = monthlyProfit / 30;
  const yearlyProfit = monthlyProfit * 12;

  const handleInvestSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleGetStartedClick();
      return;
    }
    setInvestedSuccess(true);
    setTimeout(() => {
      setInvestedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-violet-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase shadow-lg">
          🔥 Smart Staking Protocol
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          High-Yield <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">50% Monthly</span> Staking Plan
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto">
          Secure daily accruals with guaranteed 50% monthly profit returns. Minimum start from just $10 USD.
        </p>
      </div>

      {/* Main Investment Calculator Card */}
      <div className="bg-[#0b1026]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Plan Badges & Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                ✓ 50% Return / Month
              </span>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                ⚡ Daily Payouts
              </span>
              <span className="px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold">
                🛡️ Capital Protected
              </span>
            </div>

            {/* Amount Selection Slider & Input */}
            <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Enter Investment Amount ($ USD)
                </label>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  Range: $10 - $10,000
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-amber-400">$</span>
                <input
                  type="number"
                  min={minAmount}
                  max={maxAmount}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-[#050814] border border-amber-500/40 rounded-xl text-2xl font-black text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min={minAmount}
                max={maxAmount}
                step={10}
                value={currentAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
              />

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 50, 100, 500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestAmount(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

            {/* Submit Action */}
            <form onSubmit={handleInvestSubmit}>
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 text-black font-black text-base shadow-xl shadow-amber-500/20 transition-all uppercase tracking-wider"
              >
                {isLoggedIn ? `Confirm & Invest $${currentAmount} USD Now →` : 'Get Started & Invest →'}
              </button>
            </form>

            {investedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center animate-bounce">
                🎉 Investment request for ${currentAmount} initiated! Ensure your Deposit Wallet has sufficient funds.
              </div>
            )}
          </div>

          {/* Right Column: Live Return Calculator Box */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0e1638] to-[#080d24] border border-amber-500/40 p-6 rounded-2xl space-y-5 shadow-inner">
            <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> Live Profit Returns Breakdown
            </h3>

            <div className="space-y-3 divide-y divide-white/10 text-xs">
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 font-semibold">Invested Principal</span>
                <span className="text-white font-black text-sm">${currentAmount.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-semibold">Daily Accrual (~1.66%/day)</span>
                <span className="text-cyan-400 font-black text-sm">+${dailyProfit.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center pt-3 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-amber-300 font-extrabold">Monthly Return (50%)</span>
                <span className="text-amber-400 font-black text-base">+${monthlyProfit.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-semibold">Est. Yearly Earnings</span>
                <span className="text-emerald-400 font-black text-sm">+${yearlyProfit.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenDepositModal}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>➕</span> Need Funds? Deposit to Wallet
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}