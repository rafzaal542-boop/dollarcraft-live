import React from "react";

export default function HomeView({ liveProtocolTotal, handleGetStartedClick }) {
  const countries = [
    { name: "United States", code: "US", flagUrl: "https://flagcdn.com/w40/us.png" },
    { name: "United Kingdom", code: "GB", flagUrl: "https://flagcdn.com/w40/gb.png" },
    { name: "Canada", code: "CA", flagUrl: "https://flagcdn.com/w40/ca.png" },
    { name: "Australia", code: "AU", flagUrl: "https://flagcdn.com/w40/au.png" },
    { name: "Germany", code: "DE", flagUrl: "https://flagcdn.com/w40/de.png" },
    { name: "Japan", code: "JP", flagUrl: "https://flagcdn.com/w40/jp.png" },
    { name: "Singapore", code: "SG", flagUrl: "https://flagcdn.com/w40/sg.png" },
    { name: "United Arab Emirates", code: "AE", flagUrl: "https://flagcdn.com/w40/ae.png" },
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

      {/* Active Global Investment Hubs with Real Flags */}
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
              <img
                src={c.flagUrl}
                alt={`${c.name} flag`}
                className="w-7 h-5 object-cover rounded shadow-sm border border-slate-700"
              />
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