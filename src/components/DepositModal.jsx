import React, { useState, useRef } from 'react';

export default function DepositModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Please select a file smaller than 10MB.");
        return;
      }
      setSelectedSlip(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlip) {
      alert("Please upload your payment bank slip first.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedSlip(null);
      setSlipPreview(null);
      setDepositAmount('');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#070c1e] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] tracking-wider uppercase mb-2">
            Instant Bank Deposit
          </span>
          <h3 className="text-2xl font-black text-white">Deposit Funds via Digitt Bank</h3>
          <p className="text-gray-400 text-xs mt-1">
            Transfer funds to the verified account below and upload your bank receipt slip.
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-[#0a1510] to-[#08121a] border border-emerald-500/40 rounded-2xl p-5 mb-6 text-left shadow-inner">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-black text-lg">
                ⚡
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">DIGITT+</h4>
                <p className="text-[10px] text-emerald-400 font-semibold">SBP LICENSED EMI BANK</p>
              </div>
            </div>
            <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
              OFFICIAL
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">ACCOUNT TITLE</span>
                <span className="font-bold text-white text-xs">Irtaza communication</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('Irtaza communication', 'title')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedField === 'title' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] text-gray-400 block font-medium">OFFICIAL IBAN</span>
                <span className="font-bold text-white text-xs truncate block max-w-[130px]">
                  PK54DGTT00000910000020
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('PK54DGTT00000910000020', 'iban')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {copiedField === 'iban' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div>
            <label className="block text-left text-xs font-semibold text-gray-300 mb-1.5">
              Upload Payment Bank Slip (Screenshot / Receipt)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                selectedSlip
                  ? 'bg-emerald-950/20 border-emerald-500/80 text-emerald-300'
                  : 'bg-black/40 border-white/15 hover:border-emerald-500/50 text-gray-400'
              }`}
            >
              {slipPreview ? (
                <div className="flex items-center gap-3 w-full">
                  <img src={slipPreview} alt="Slip preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-500/50" />
                  <div className="text-left truncate flex-1">
                    <p className="text-xs font-bold text-emerald-300 truncate">{selectedSlip?.name}</p>
                    <p className="text-[10px] text-gray-400">Click to change file</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs font-medium">Click here to upload payment slip image</span>
                  <span className="text-[10px] text-gray-500">(PNG, JPG, JPEG or PDF - Max 10MB)</span>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitted}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-black font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitted ? 'Submitting Deposit Slip...' : 'Submit Deposit Proof →'}
          </button>

          {submitted && (
            <p className="text-xs text-emerald-400 font-bold animate-pulse mt-2">
              ✓ Deposit slip submitted successfully! Verification in progress.
            </p>
          )}
        </form>

      </div>
    </div>
  );
}