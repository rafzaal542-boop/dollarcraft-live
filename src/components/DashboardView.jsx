import React from 'react';

export default function DashboardView({
  userName,
  userFirstName,
  totalBalanceCents,
  setWithdrawalModalOpen
}) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-[#0b1026]/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-2">Welcome, {userName || userFirstName || 'Investor'}!</h2>
        <p className="text-gray-300 text-sm">Manage your deposits, earnings, and active positions.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-amber-400 font-semibold block mb-1">TOTAL BALANCE</span>
            <span className="text-3xl font-black text-cyan-400">${(totalBalanceCents / 100).toFixed(2)}</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">DEPOSIT WALLET</span>
            <span className="text-2xl font-bold text-white">${(totalBalanceCents / 100).toFixed(2)}</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">EARNING WALLET</span>
            <span className="text-2xl font-bold text-white">$0.0000</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">REFERRAL WALLET</span>
            <span className="text-2xl font-bold text-white">$0.00</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={() => setWithdrawalModalOpen(true)} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all">
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );
}