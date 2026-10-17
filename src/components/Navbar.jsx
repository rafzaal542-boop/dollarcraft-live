import React from "react";

export default function Navbar({ activeTab, setActiveTab, onOpenDepositModal }) {
  return (
    <nav className="w-full bg-[#050814]/90 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-xl px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080c1d] rounded-[10px] flex items-center justify-center font-black text-white text-lg tracking-wider">
              DC
            </div>
          </div>
          <span className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
            Dollar Craft
          </span>
        </div>

        {/* Navigation Links & Deposit Button */}
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab("home")}
            className={`text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "home" ? "text-amber-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Home
          </button>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "dashboard" ? "text-amber-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("invest")}
            className={`text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "invest" ? "text-amber-400" : "text-gray-400 hover:text-white"
            }`}
          >
            Invest
          </button>

          {/* Deposit Button (Highlight Button next to Invest) */}
          <button
            onClick={onOpenDepositModal}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "faq" ? "text-amber-400" : "text-gray-400 hover:text-white"
            }`}
          >
            FAQ
          </button>
        </div>

      </div>
    </nav>
  );
}