import React, { useRef } from 'react';

export default function DashboardView({
  userName,
  userFirstName,
  totalBalanceCents,
  setWithdrawalModalOpen,
  currentUserData,
  onImageUpload
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentAvatar = currentUserData?.profilePic;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-[#0b1026]/90 border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
        
        {/* Hidden File Input for Gallery Selection */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header Section with Profile Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile picture from gallery"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-dashed border-amber-400/60 flex items-center justify-center text-gray-400 group-hover:border-amber-400 group-hover:scale-105 transition-all">
                  <svg className="w-8 h-8 text-amber-400/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-amber-300 font-bold">Gallery</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white mb-1">
                Welcome, {userName || userFirstName || 'Investor'}!
              </h2>
              <p className="text-gray-300 text-sm">Manage your deposits, earnings, and active positions.</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Picture
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-amber-400 font-semibold block mb-1">TOTAL BALANCE</span>
            <span className="text-3xl font-black text-cyan-400">${(totalBalanceCents / 100).toFixed(2)}</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">DEPOSIT WALLET</span>
            <span className="text-2xl font-bold text-white">${(totalBalanceCents / 100).toFixed(2)}</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">EARNING WALLET</span>
            <span className="text-2xl font-bold text-white">$0.0000</span>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
            <span className="text-xs text-gray-400 block mb-1">REFERRAL WALLET</span>
            <span className="text-2xl font-bold text-white">$0.00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setWithdrawalModalOpen(true)}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            Withdraw Funds
          </button>
        </div>

      </div>
    </div>
  );
}