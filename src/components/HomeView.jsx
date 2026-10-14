import React from 'react';
import { Cpu, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-8 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        AI-Powered Yield Returns
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl">
        Invest in the Future of <br />
        <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
          AI Computing & Yields
        </span>
      </h1>

      {/* Description */}
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-12 leading-relaxed">
        Join thousands of investors earning daily returns from our advanced infrastructure powering next-gen automated financial models.
      </p>

      {/* 3 Premium Feature Cards (Like GPT32 style) */}
      <div className="w-full max-w-xl space-y-3 mb-10 text-left">
        <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl hover:border-violet-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Enterprise GPU Infrastructure</h4>
            <p className="text-xs text-gray-400">High-performance automated calculation centers</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl hover:border-violet-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Automated Daily Returns</h4>
            <p className="text-xs text-gray-400">Profits credited and compounded every 24 hours</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl hover:border-violet-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">5-Level Referral Program</h4>
            <p className="text-xs text-gray-400">Earn up to 15% bonus rewards from your network</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xl space-y-4">
        <button
          onClick={handleGetStartedClick}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          Get Started Now <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleGetStartedClick}
          className="w-full py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:bg-slate-800 text-gray-300 hover:text-white font-bold text-sm transition-all"
        >
          Already have an account? Login
        </button>
      </div>

      {/* Live Ticker Box */}
      <div className="mt-12 w-full max-w-xl bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-center">
        <span className="text-[10px] uppercase tracking-widest text-violet-400 font-bold block mb-1">
          🟢 LIVE GLOBAL PROTOCOL ACCRUAL
        </span>
        <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
          ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}