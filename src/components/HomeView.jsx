import React from "react";

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  const countries = [
    {
      name: "United States",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
          <path fill="#bd3d44" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 276.9h640M0 350.8h640M0 424.6h640"/>
          <path fill="#192f5d" d="M0 0h288v258.5H0z"/>
        </svg>
      ),
    },
    {
      name: "United Kingdom",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
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
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
          <path fill="#d80a1d" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="M160 0h320v480H160z"/>
          <path fill="#d80a1d" d="M320 72l20 54 52-22-18 52 56 12-42 36 32 46-54-10-6 56-30-44-30 44-6-56-54 10 32-46-42-36 56-12-18-52 52 22z"/>
        </svg>
      ),
    },
    {
      name: "Australia",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
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
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
          <path fill="#000" d="M0 0h640v160H0z"/>
          <path fill="#dd0000" d="M0 160h640v160H0z"/>
          <path fill="#ffce00" d="M0 320h640v160H0z"/>
        </svg>
      ),
    },
    {
      name: "Japan",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <circle cx="320" cy="240" r="140" fill="#bc002d"/>
        </svg>
      ),
    },
    {
      name: "Singapore",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
          <path fill="#ef3340" d="M0 0h640v240H0z"/>
          <path fill="#fff" d="M0 240h640v240H0z"/>
          <circle cx="120" cy="120" r="70" fill="#fff"/>
          <circle cx="145" cy="120" r="65" fill="#ef3340"/>
        </svg>
      ),
    },
    {
      name: "United Arab Emirates",
      svg: (
        <svg className="w-7 h-5 rounded shadow-sm" viewBox="0 0 640 480">
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
      <div className="w-full max-w-xl p-6 rounded-2xl bg-[#080c1d]/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl mb-12">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          LIVE GLOBAL PROTOCOL ACCRUAL
        </div>
        <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">
          ${Number(liveProtocolTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Active Global Investment Hubs */}
      <div className="w-full max-w-5xl mt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          Active Global Investment Hubs
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {countries.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#080c1d]/70 border border-slate-800/80 shadow-lg backdrop-blur-md hover:border-amber-500/40 transition-all duration-200"
            >
              <div className="flex-shrink-0">{c.svg}</div>
              <span className="text-sm font-bold text-gray-200 tracking-wide text-left">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}