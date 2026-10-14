import React, { useState } from 'react';

export default function AdminPanel({
  usersList,
  todayRegisteredUsers,
  internalTransferCount,
  internalTransferEmail,
  setInternalTransferEmail,
  internalTransferAmount,
  setInternalTransferAmount,
  internalTransferError,
  internalTransferSuccess,
  handleInternalTransferSubmit,
  formatSignupTimestamp
}) {
  const [adminSubTab, setAdminSubTab] = useState('dashboard');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Control Center v2.0</h1>
            <p className="text-gray-300 text-sm mt-1">Global management, live user history, and wallet balancing.</p>
          </div>
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setAdminSubTab('dashboard')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminSubTab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setAdminSubTab('users')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminSubTab === 'users' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:text-white'}`}>Users History</button>
            <button onClick={() => setAdminSubTab('finance')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminSubTab === 'finance' ? 'bg-violet-600 text-white' : 'text-gray-300 hover:text-white'}`}>Finance & Payouts</button>
          </div>
        </div>

        {adminSubTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <span className="text-xs text-violet-400 font-bold block mb-1">TOTAL REGISTERED USERS</span>
                <span className="text-4xl font-black text-white">{usersList.length}</span>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <span className="text-xs text-violet-400 font-bold block mb-1">REGISTERED TODAY</span>
                <span className="text-4xl font-black text-white">{todayRegisteredUsers}</span>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <span className="text-xs text-violet-400 font-bold block mb-1">SUCCESSFUL TRANSFERS</span>
                <span className="text-4xl font-black text-white">{internalTransferCount}</span>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">⚡ Internal Transfer</h3>
              <form onSubmit={handleInternalTransferSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">User Email Address</label>
                  <input
                    type="email"
                    required
                    value={internalTransferEmail}
                    onChange={(e) => setInternalTransferEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Transfer Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={internalTransferAmount}
                    onChange={(e) => setInternalTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                {internalTransferError && <p className="text-xs text-rose-400">{internalTransferError}</p>}
                {internalTransferSuccess && <p className="text-xs text-teal-400">{internalTransferSuccess}</p>}
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm">
                  Transfer Funds
                </button>
              </form>
            </div>
          </div>
        )}

        {adminSubTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Registered Users & Wallets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
                    <th className="py-3 px-4">First Name</th>
                    <th className="py-3 px-4">Last Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Sign-up Time</th>
                    <th className="py-3 px-4">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((u, idx) => (
                    <tr key={u.id || idx} className="hover:bg-white/5 text-sm">
                      <td className="py-4 px-4 font-semibold text-white">{u.firstName || '-'}</td>
                      <td className="py-4 px-4 text-gray-300">{u.lastName || '-'}</td>
                      <td className="py-4 px-4 text-violet-300">{u.email}</td>
                      <td className="py-4 px-4 text-gray-400 font-mono text-xs">{formatSignupTimestamp(u.createdAt)}</td>
                      <td className="py-4 px-4 font-mono text-cyan-400">${((u.balanceCents || 0) / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}