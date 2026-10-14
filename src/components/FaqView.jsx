import React from 'react';

export default function FaqView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-3xl font-black text-white mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-300 text-sm">Find answers to common questions about accounts, deposits, and yields.</p>
        <div className="space-y-4 text-gray-300 text-sm">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-1">How do I start investing?</h4>
            <p>Register an account, select the Super DC Plan in the Invest tab, and deposit funds to earn daily compounding yields.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-1">What is the minimum withdrawal amount?</h4>
            <p>The minimum withdrawal limit is $10 USD, processed securely through our global gateways.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold text-white mb-1">How is the 50% monthly return calculated?</h4>
            <p>Returns accrue continuously at a daily compound rate distributed evenly throughout the month.</p>
          </div>
        </div>
      </div>
    </div>
  );
}