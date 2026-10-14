import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-6">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        Smart Daily Micro-Yield Protocol
      </div>

      {/* Main Title (Sized smaller and forced into 2 lines) */}
      <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight max-w-3xl">
        Empower Your Capital with <br />
        <span className="bg-gradient-to-r from-amber-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Automated Smart Yields
        </span>
      </h1>

      {/* Description */}
      <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-300 mb-8 leading-relaxed">
        Experience seamless digital asset growth through our high-performance micro-yield distribution framework designed for modern investors.
      </p>

      {/* Action Button */}
      <div className="w-full max-w-md mb-10">
        <button
          onClick={handleGetStartedClick}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          Get Started Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live Ticker Box */}
      <div className="w-full max-w-lg bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 text-center shadow-lg">
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