import React from "react";

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  const countries = [
    {
      name: "United States",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#bd3d44" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 276.9h640M0 350.8h640M0 424.6h640"/>
          <path fill="#192f5d" d="M0 0h288v258.5H0z"/>
        </svg>
      ),
    },
    {
      name: "United Kingdom",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M640 0 0 480"/>
          <path stroke="#C8102E" strokeWidth="40" d="m0 0 640 480M640 0 0 480"/>
          <path stroke="#fff" strokeWidth="100" d="M320 0v480M0 240h640"/>
          <path stroke="#C8102E" strokeWidth="60" d="M320 0v480M0 240h640"/>
        </svg>
      ),
    },
    {
      name: "Canada",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#d80a1d" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="M160 0h320v480H160z"/>
          <path fill="#d80a1d" d="M320 72l20 54 52-22-18 52 56 12-42 36 32 46-54-10-6 56-30-44-30 44-6-56-54 10 32-46-42-36 56-12-18-52 52 22z"/>
        </svg>
      ),
    },
    {
      name: "Australia",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#00008b" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="m160 360 12 26 28-6-18 22 22 18-28 2 2 28-22-18-18 22 2-28-28-2 22-18-18-22 28 6z"/>
          <path stroke="#fff" strokeWidth="30" d="m0 0 320 240M320 0 0 240"/>
          <path stroke="#dc143c" strokeWidth="20" d="m0 0 320 240M320 0 0 240"/>
          <path stroke="#fff" strokeWidth="50" d="M160 0v240M0 120h320"/>
          <path stroke="#dc143c" strokeWidth="30" d="M160 0v240M0 120h320"/>
        </svg>
      ),
    },
    {
      name: "Germany",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#000" d="M0 0h640v160H0z"/>
          <path fill="#dd0000" d="M0 160h640v160H0z"/>
          <path fill="#ffce00" d="M0 320h640v160H0z"/>
        </svg>
      ),
    },
    {
      name: "Japan",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <circle cx="320" cy="240" r="140" fill="#bc002d"/>
        </svg>
      ),
    },
    {
      name: "UAE",
      svg: (
        <svg className="w-7 h-5 rounded border border-slate-700/80 shadow-sm flex-shrink-0" viewBox="0 0 640 480">
          <path fill="#007a3d" d="M0 0h640v160H0z"/>
          <path fill="#fff" d="M0 160h640v160H0z"/>
          <path fill="#000" d="M0 320h640v160H0z"/>
          <path fill="#ff0000" d="M0 0h180v480H0z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6 shadow-inner">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        Smart Daily Micro-Yield Protocol
      </div>

      {/* Main Hero Heading */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mb-4">
        Empower Your Capital with{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-400">
          Automated Smart Yields
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm sm:text-base max-w-xl mb-8">
        Experience seamless digital asset growth through our high-performance micro-yield distribution framework designed for modern investors.
      </p>

      {/* CTA Button */}
      <button
        onClick={handleGetStartedClick}
        className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 mb-12 flex items-center gap-2"
      >
        Get Started Now →
      </button>

      {/* Live Global Protocol Accrual Box */}
      <div className="w-full max-w-xl p-6 rounded-2xl bg-[#080c1d]/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl mb-10">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          LIVE GLOBAL PROTOCOL ACCRUAL
        </div>
        <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">
          ${Number(liveProtocolTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Section Header with Gol Official Bank Thappa Badge */}
      <div className="w-full max-w-6xl mt-2 mb-6 px-2 flex flex-row items-center justify-between gap-4">
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
            Global Compliance & Licensing
          </p>
          <h2 className="text-base sm:text-xl font-extrabold text-white">
            Registered & Operating Across 7 Global Jurisdictions
          </h2>
        </div>

        {/* Gol Official Bank/UK Government Stamp (Thappa) */}
        <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-emerald-500 bg-white text-slate-950 flex flex-col items-center justify-center p-1 shadow-2xl shadow-emerald-500/20 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300">
          <div className="w-full h-full rounded-full border border-emerald-600 border-double p-0.5 flex flex-col items-center justify-center text-center">
            <svg className="w-4 h-4 text-emerald-600 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[7px] sm:text-[8px] font-black leading-tight uppercase text-emerald-900 tracking-tighter">
              REGISTERED
            </span>
            <span className="text-[8px] sm:text-[9px] font-black leading-none uppercase text-emerald-600">
              IN UK
            </span>
            <span className="text-[5px] font-extrabold uppercase text-gray-500 tracking-tighter mt-0.5">
              OFFICIAL SEAL
            </span>
          </div>
        </div>
      </div>

      {/* 7 Countries Grid - Wider & Single Line */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-7 gap-2.5">
          {countries.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-2 px-2 py-3 rounded-xl bg-[#080c1d]/90 border border-slate-800/90 shadow-md backdrop-blur-md hover:border-amber-500/50 transition-all duration-200"
            >
              {c.svg}
              <span className="text-xs font-extrabold text-gray-100 tracking-tight text-left">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}