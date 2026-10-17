import React, { useState, useEffect } from "react";

export default function AdminPanel({
  usersList = [],
  todayRegisteredUsers = 0,
  internalTransferCount = 0,
  internalTransferEmail = "",
  setInternalTransferEmail = () => {},
  internalTransferAmount = "",
  setInternalTransferAmount = () => {},
  internalTransferError = "",
  internalTransferSuccess = "",
  handleInternalTransferSubmit = () => {},
  formatSignupTimestamp = (ts) => ts,
}) {
  const [slips, setSlips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const loadSlips = () => {
    try {
      const data = JSON.parse(localStorage.getItem("dollarcraft_deposit_slips") || "[]");
      setSlips(data);
    } catch (e) {
      setSlips([]);
    }
  };

  useEffect(() => {
    loadSlips();
    window.addEventListener("dollarcraft:slips-changed", loadSlips);
    return () => window.removeEventListener("dollarcraft:slips-changed", loadSlips);
  }, []);

  const handleDeleteSlip = (id) => {
    const updated = slips.filter((s) => s.id !== id);
    setSlips(updated);
    localStorage.setItem("dollarcraft_deposit_slips", JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#080c1d] border border-amber-500/20 shadow-2xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 uppercase tracking-wider">
            Master Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Dollar Craft Admin Control</h1>
        </div>

        {/* Submitted Deposit Slips Direct Button Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Total Deposit Proofs: <span className="text-white text-sm font-black">{slips.length}</span>
          </div>
        </div>
      </div>

      {/* Internal Transfer Section */}
      <div className="p-6 rounded-3xl bg-[#080c1d] border border-slate-800 shadow-xl">
        <h2 className="text-xl font-black text-white mb-4">Direct User Balance Credit</h2>
        <form onSubmit={handleInternalTransferSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">User Email Address</label>
            <input
              type="email"
              placeholder="user@gmail.com"
              value={internalTransferEmail}
              onChange={(e) => setInternalTransferEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Amount to Add ($ USD)</label>
            <input
              type="number"
              placeholder="100"
              value={internalTransferAmount}
              onChange={(e) => setInternalTransferAmount(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          {internalTransferError && (
            <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {internalTransferError}
            </p>
          )}

          {internalTransferSuccess && (
            <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              {internalTransferSuccess}
            </p>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Credit Balance Now →
          </button>
        </form>
      </div>

      {/* Submitted Bank Deposit Slips Direct Section */}
      <div className="p-6 rounded-3xl bg-[#080c1d] border border-emerald-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
              Live Incoming Payments
            </span>
            <h2 className="text-xl font-black text-white">Submitted User Bank Slips</h2>
          </div>
        </div>

        {slips.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            No bank deposit slips submitted yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slips.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {s.status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white truncate mb-1">{s.userEmail}</p>
                  {s.note && <p className="text-[11px] text-gray-300 italic mb-3">"{s.note}"</p>}

                  {/* Image Preview Box */}
                  <div
                    onClick={() => setSelectedSlip(s)}
                    className="w-full h-32 rounded-xl border border-slate-700 bg-black overflow-hidden cursor-pointer group relative mb-3"
                  >
                    <img
                      src={s.slipImageData}
                      alt="Deposit Slip"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                      View Full Slip 🔍
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSlip(s)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                  >
                    View Slip
                  </button>
                  <button
                    onClick={() => handleDeleteSlip(s.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Viewer Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#080c1d] border border-emerald-500/40 rounded-3xl p-6 max-w-xl w-full text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-slate-800 rounded-full p-2"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-white mb-1">User Bank Deposit Proof</h3>
            <p className="text-xs text-emerald-400 font-bold mb-4">{selectedSlip.userEmail}</p>

            <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-700 bg-black p-2 mb-4">
              <img src={selectedSlip.slipImageData} alt="Full Bank Slip" className="w-full h-auto rounded-lg" />
            </div>

            <div className="flex gap-3">
              <a
                href={selectedSlip.slipImageData}
                download="deposit-slip.png"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 text-center"
              >
                Download Slip Image
              </a>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}