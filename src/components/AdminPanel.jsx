import React, { useState } from 'react';
import { Users, DollarSign, ArrowRightLeft, ShieldCheck, Search, RefreshCw } from 'lucide-react';

export default function AdminPanel({
  usersList = [],
  todayRegisteredUsers = 0,
  internalTransferCount = 0,
  internalTransferEmail,
  setInternalTransferEmail,
  internalTransferAmount,
  setInternalTransferAmount,
  internalTransferError,
  internalTransferSuccess,
  handleInternalTransferSubmit,
  formatSignupTimestamp
}) {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Search filter for live users
  const filteredUsers = usersList.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b1026]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
            Admin Control Center v2.0
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync (2s)
            </span>
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm">Global management, live user history, and wallet balancing.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'users' ? 'bg-gradient-to-r from-amber-500 to-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Users History ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'finance' ? 'bg-gradient-to-r from-amber-500 to-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Finance & Payouts
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b1026]/80 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">TOTAL REGISTERED</span>
            <span className="text-2xl font-black text-white">{usersList.length} Accounts</span>
          </div>
        </div>

        <div className="bg-[#0b1026]/80 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">TODAY'S NEW SIGNUPS</span>
            <span className="text-2xl font-black text-amber-400">{todayRegisteredUsers} Users</span>
          </div>
        </div>

        <div className="bg-[#0b1026]/80 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold block">TRANSFERS EXECUTED</span>
            <span className="text-2xl font-black text-cyan-400">{internalTransferCount} Transactions</span>
          </div>
        </div>
      </div>

      {/* Users History Table View */}
      {activeTab === 'users' && (
        <div className="bg-[#0b1026]/90 border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-extrabold text-white">Registered Users & Wallets</h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user email or name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">First Name</th>
                  <th className="py-3 px-3">Last Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Sign-Up Time</th>
                  <th className="py-3 px-3 text-right">Total Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-white">{u.firstName || u.name?.split(' ')[0] || 'N/A'}</td>
                      <td className="py-3.5 px-3 text-gray-300">{u.lastName || u.name?.split(' ').slice(1).join(' ') || '—'}</td>
                      <td className="py-3.5 px-3 font-mono text-cyan-400">{u.email}</td>
                      <td className="py-3.5 px-3 text-gray-400 font-mono text-[11px]">
                        {formatSignupTimestamp ? formatSignupTimestamp(u.createdAt) : u.createdAt}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-400 font-mono text-sm">
                        ${((u.balanceCents || 0) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 italic">
                      No matching user records found in live database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Finance & Internal Transfer View */}
      {activeTab === 'finance' && (
        <div className="bg-[#0b1026]/90 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-extrabold text-white">Internal Wallet Balance Transfer</h3>
          <p className="text-xs text-gray-400">Instantly credit user deposit balances across global accounts.</p>

          <form onSubmit={handleInternalTransferSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target User Email</label>
              <input
                type="email"
                required
                value={internalTransferEmail}
                onChange={(e) => setInternalTransferEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={internalTransferAmount}
                onChange={(e) => setInternalTransferAmount(e.target.value)}
                placeholder="100.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {internalTransferError && <p className="text-xs text-rose-400 font-semibold">{internalTransferError}</p>}
            {internalTransferSuccess && <p className="text-xs text-emerald-400 font-semibold">{internalTransferSuccess}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              Execute Instant Credit Transfer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}