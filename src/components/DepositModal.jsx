import React, { useState } from "react";

export default function DepositModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null);
  const [amount, setAmount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const bankDetails = {
    bankName: "Digitt Bank (Digitt+ EMI)",
    accountTitle: "Irtaza communication",
    iban: "PK54DGTT0000091000002022",
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !trxId) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount("");
      setTrxId("");
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      {/* Expanded Container Width (max-w-2xl) to eliminate vertical scrollbars */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#070b19] border border-slate-800 p-5 sm:p-7 shadow-2xl text-white overflow-hidden my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full p-2 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            INSTANT BANK DEPOSIT
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deposit Funds via Digitt Bank
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Transfer funds to the verified account below to activate your deposit.
          </p>
        </div>

        {/* WIDE DIGITT+ BANK VIRTUAL CARD */}
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#030712] p-4 sm:p-5 border border-emerald-500/30 shadow-xl mb-5">
          
          {/* Card Top Row: Exact Digitt Lightning Logo & Microchip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Exact Lightning Bolt Logo Container */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 500 500" fill="none">
                  {/* Top Black Lightning Segment */}
                  <path d="M160 50 L350 50 L270 200 L330 190 L160 50 Z" fill="#1e1e1e" />
                  {/* Bottom Emerald Lightning Segment */}
                  <path d="M160 270 L220 260 L150 450 L330 200 L250 210 L160 270 Z" fill="#00695c" />
                </svg>
              </div>

              <div>
                <h3 className="font-black text-white text-lg leading-none tracking-wide">DIGITT+</h3>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5 block">
                  SBP LICENSED EMI BANK
                </span>
              </div>
            </div>

            {/* Microchip Graphic */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200/60 flex items-center justify-center shadow-inner">
              <div className="w-6 h-4 border border-amber-800/50 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                <div className="bg-amber-700/40 rounded-xs"></div>
                <div className="bg-amber-700/40 rounded-xs"></div>
              </div>
            </div>
          </div>

          {/* Account Title & IBAN Grid (Horizontal Wide Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Account Title */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-1">
                Account Title
              </span>
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-500/25">
                <span className="font-extrabold text-white text-sm tracking-wide truncate">
                  {bankDetails.accountTitle}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.accountTitle, "title")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold ml-2 underline flex-shrink-0"
                >
                  {copiedField === "title" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Official IBAN */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80 block mb-1">
                Official IBAN
              </span>
              <div className="flex items-center justify-between bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-500/25">
                <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-tight truncate">
                  {bankDetails.iban}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.iban, "iban")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold ml-2 underline flex-shrink-0"
                >
                  {copiedField === "iban" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Deposit Confirmation Form */}
        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <svg className="w-10 h-10 text-emerald-400 mx-auto mb-1.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="text-base font-bold text-white mb-0.5">Deposit Request Submitted!</h4>
            <p className="text-xs text-gray-300">
              Your transaction ID has been logged. Admin will verify and credit your balance shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Deposit Amount ($ USD or PKR equivalent)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Transaction Reference / TRX ID
                </label>
                <input
                  type="text"
                  placeholder="Enter 12-digit Digitt Bank TRX ID"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-98 transition-all mt-1"
            >
              Submit Deposit Proof →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}