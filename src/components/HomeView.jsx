import React from 'react';
import { Cpu, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-8 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        Smart Daily Micro-Yield Protocol
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl">
        Empower Your Capital with <br />
        <span className="bg-gradient-to-r from-amber-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Automated Smart Yields
        </span>
      </h1>

      {/* Description */}
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-12 leading-relaxed">
        Experience seamless digital asset growth through our high-performance micro-yield distribution framework designed for modern investors.
      </p>

      {/* 3 Modern Feature Cards */}
      <div className="w-full max-w-xl space-y-3 mb-10 text-left">
        <div className="flex items-center gap-4 bg-[#0b1026]/90 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Real-Time Compound Yields</h4>
            <p className="text-xs text-gray-400">Continuous micro-accruals distributed directly to your wallet balance</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#0b1026]/90 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Automated Smart Engine</h4>
            <p className="text-xs text-gray-400">Advanced algorithmic trade execution with zero manual intervention</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#0b1026]/90 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base">Instant Global Payouts</h4>
            <p className="text-xs text-gray-400">Secure and lightning-fast withdrawal processing across global channels</p>
          </div>
        </div>
      </div>

      {/* Action Button (Login button removed) */}
      <div className="w-full max-w-xl">
        <button
          onClick={handleGetStartedClick}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          Get Started Now <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Live Ticker Box */}
      <div className="mt-12 w-full max-w-xl bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 text-center shadow-lg">
        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-1">
          🟢 LIVE GLOBAL PROTOCOL ACCRUAL
        </span>
        <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
          ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}