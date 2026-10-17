import React, { useState, useEffect } from "react";

export default function DepositModal({ isOpen, onClose, currentUserEmail }) {
  const [copiedField, setCopiedField] = useState(null);
  const [userEmailInput, setUserEmailInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [senderNote, setSenderNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (currentUserEmail) {
      setUserEmailInput(currentUserEmail);
    }
  }, [currentUserEmail]);

  if (!isOpen) return null;

  const isGuest = !currentUserEmail || currentUserEmail === "Guest Investor" || currentUserEmail === "LoggedIn User";

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filePreview || isGuest) return;

    const finalEmail = userEmailInput.trim() || currentUserEmail;

    // Save submitted slip for Admin Panel
    const newSubmission = {
      id: "slip-" + Date.now(),
      userEmail: finalEmail,
      slipImageData: filePreview,
      note: senderNote,
      submittedAt: new Date().toISOString(),
      status: "Pending Verification",
    };

    try {
      const existingSlips = JSON.parse(localStorage.getItem("dollarcraft_deposit_slips") || "[]");
      localStorage.setItem("dollarcraft_deposit_slips", JSON.stringify([newSubmission, ...existingSlips]));
      window.dispatchEvent(new Event("dollarcraft:slips-changed"));
    } catch (err) {
      console.error("Failed to save deposit slip:", err);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedFile(null);
      setFilePreview(null);
      setSenderNote("");
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#070b19] border border-slate-800 p-5 sm:p-7 shadow-2xl text-white overflow-hidden my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full p-2 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            INSTANT BANK DEPOSIT PROOF
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deposit Funds via Digitt Bank
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Transfer funds to the verified account below and upload your transaction receipt.
          </p>
        </div>

        {/* Digitt+ Virtual Card */}
        <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#030712] p-4 sm:p-5 border border-emerald-500/30 shadow-xl mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center flex-shrink-0">
                <img 
                  src="https://raw.githubusercontent.com/rafzaal542-boop/dollarcraft-live/main/public/digitt-logo.png" 
                  alt="Digitt+ Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M350 50 L230 240 L310 230 L160 460 L220 270 L140 280 Z' fill='%201e1e1e'/></svg>";
                  }}
                />
              </div>

              <div>
                <h3 className="font-black text-white text-lg leading-none tracking-wide">DIGITT+</h3>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5 block">
                  SBP LICENSED EMI BANK
                </span>
              </div>
            </div>

            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200/60 flex items-center justify-center shadow-inner">
              <div className="w-6 h-4 border border-amber-800/50 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                <div className="bg-amber-700/40 rounded-xs"></div>
                <div className="bg-amber-700/40 rounded-xs"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* Security Check: If Guest / Not Signed In */}
        {isGuest ? (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <svg className="w-10 h-10 text-amber-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="text-base font-black text-white">Authentication Required</h4>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              You must be signed in or registered to your account to upload and submit deposit proofs. Please login first.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md mt-2"
            >
              Close & Login / Register
            </button>
          </div>
        ) : submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <svg className="w-10 h-10 text-emerald-400 mx-auto mb-1.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="text-base font-bold text-white mb-0.5">Bank Slip Uploaded Successfully!</h4>
            <p className="text-xs text-gray-300">
              Your transaction proof along with your email ({userEmailInput}) has been sent directly to the Admin Panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registered User Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Registered User Email (Auto-filled)
              </label>
              <input
                type="email"
                value={userEmailInput}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-emerald-400 font-bold text-sm cursor-not-allowed shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Upload Bank Transfer Receipt / Slip Screenshot
              </label>
              
              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-900/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {filePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={filePreview}
                      alt="Deposit Slip Preview"
                      className="max-h-36 rounded-lg object-contain border border-emerald-500/40 shadow-md"
                    />
                    <span className="text-xs font-bold text-emerald-400">
                      ✓ {selectedFile?.name || "Slip Image Selected"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <svg className="w-8 h-8 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-bold text-white mb-0.5">Click or Drag & Drop Bank Slip Image</p>
                    <p className="text-[10px] text-gray-400">Supports PNG, JPG, JPEG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Optional Sender Note / Depositor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sent via Digitt App by Irtaza"
                value={senderNote}
                onChange={(e) => setSenderNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={!filePreview}
              className={`w-full py-3.5 rounded-xl text-slate-950 font-black text-sm shadow-xl transition-all ${
                filePreview
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:scale-[1.01] active:scale-98 cursor-pointer"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Deposit Proof to Admin →
            </button>
          </form>
        )}

      </div>
    </div>
  );
}