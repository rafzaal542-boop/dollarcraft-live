import React from 'react';

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  const formattedProtocolTotal = liveProtocolTotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const countries = [
    { name: 'United States', flag: '🇺🇸' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'United Arab Emirates', flag: '🇦🇪' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Switzerland', flag: '🇨🇭' }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Top Protocol Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6 tracking-wide shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        Smart Daily Micro-Yield Protocol
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mb-6 leading-tight">
        Empower Your Capital with <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400">
          Automated Smart Yields
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-10 font-normal">
        Experience seamless digital asset growth through our high-performance micro-yield distribution framework designed for modern investors.
      </p>

      {/* Get Started Button */}
      <div className="mb-14">
        <button
          onClick={handleGetStartedClick}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Get Started Now →
        </button>
      </div>

      {/* Live Global Protocol Accrual Box */}
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#080c1d]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl mb-12">
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          LIVE GLOBAL PROTOCOL ACCRUAL
        </div>
        <div className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono tracking-tight">
          ${formattedProtocolTotal}
        </div>
      </div>

      {/* Countries & Flags Section */}
      <div className="w-full max-w-5xl mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          Global Investor Network Active Across Regions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {countries.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#080c1d]/60 border border-slate-800/80 shadow-md backdrop-blur-md hover:border-amber-500/40 transition-colors"
            >
              <span className="text-2xl">{c.flag}</span>
              <span className="text-sm font-bold text-gray-200">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}