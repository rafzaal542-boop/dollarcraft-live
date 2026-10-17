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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#080c1d] border border-slate-800 p-6 sm:p-8 shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full p-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            Instant Bank Deposit
          </span>
          <h2 className="text-2xl font-black text-white">Deposit Funds via Digitt Bank</h2>
          <p className="text-xs text-gray-400 mt-1">
            Transfer funds to the verified account below to activate your deposit.
          </p>
        </div>

        {/* HD DIGITT BANK VIRTUAL CARD */}
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 border border-emerald-500/30 shadow-xl shadow-emerald-950/50 mb-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <span className="font-black text-slate-950 text-sm tracking-tighter">d+</span>
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-none">DIGITT+</h3>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">
                  SBP Licensed EMI Bank
                </span>
              </div>
            </div>

            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200/60 flex items-center justify-center shadow-inner">
              <div className="w-6 h-4 border border-amber-700/50 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                <div className="bg-amber-600/40 rounded-xs"></div>
                <div className="bg-amber-600/40 rounded-xs"></div>
              </div>
            </div>
          </div>

          {/* Account Title Field */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 block mb-0.5">
              Account Title
            </span>
            <div className="flex items-center justify-between bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/20">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-wide">
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

          {/* IBAN Field */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 block mb-0.5">
              Official IBAN / Account Number
            </span>
            <div className="flex items-center justify-between bg-black/30 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-emerald-500/20">
              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-wider break-all">
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

        {/* Form */}
        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <svg className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="text-lg font-bold text-white mb-1">Deposit Request Submitted!</h4>
            <p className="text-xs text-gray-300">
              Your transaction ID has been logged. Admin will verify and credit your balance shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Deposit Amount ($ USD or PKR equivalent)
              </label>
              <input
                type="number"
                placeholder="Enter amount (e.g. 100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Transaction Reference / TRX ID
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit Digitt Bank TRX ID"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-98 transition-all"
            >
              Submit Deposit Proof →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}