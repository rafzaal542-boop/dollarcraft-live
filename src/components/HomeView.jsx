import React from 'react';

export default function HomeView({ liveProtocolTotal, handleGetStartedClick, globalHubs }) {
  return (
    <div className="space-y-14">
      <section className="text-center pt-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-semibold mb-6 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping"></span>
          ⚡ Live Yield Protocol Active — Start Earning Today
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Micro-Yields, <br />
          <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Earn Real Daily Money
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
          Join thousands of users earning daily returns through our secure automated protocol. Boost your capital with our powerful 50% monthly compounding framework.
        </p>

        <div className="flex items-center justify-center">
          <button onClick={handleGetStartedClick} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-base shadow-2xl shadow-violet-500/40 transition-all transform hover:scale-105">
            Get Started →
          </button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl">
          <span className="text-xs font-extrabold text-violet-400 uppercase tracking-widest block mb-2">
            🟢 SIMULATED GLOBAL ACCRUAL TICKER
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono tracking-tight">
            ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-sm text-gray-300 mt-2">Illustrative ticker calculated from a shared timestamp; not a live account balance.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">🏛 REGISTERED & OPERATING GLOBAL HUBS</h3>
              <p className="text-gray-300 text-sm mt-0.5">Fully compliant operations with Tier-1 local regulatory frameworks.</p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">7 ACTIVE HUBS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {globalHubs.map((hub, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center hover:border-violet-500/50 transition-all flex flex-col items-center">
                <img src={`https://flagcdn.com/96x72/${hub.code}.png`} alt={hub.name} className="w-12 h-9 object-cover rounded shadow mb-2.5 border border-white/20" />
                <h4 className="font-bold text-white text-sm">{hub.name}</h4>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase block mt-1">COMPLIANT</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}