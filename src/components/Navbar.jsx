import React from 'react';

export default function Navbar({
  activeView,
  setActiveTab,
  isLoggedIn,
  isAdminUser,
  canAccessAdmin,
  handleGetStartedClick,
  requestLogout
}) {
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090d23]/90 border-b border-amber-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 flex items-center justify-center font-black text-base shadow-md text-white">
              DC
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-amber-200 to-cyan-400 bg-clip-text text-transparent">
              Dollar Craft
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-300">
            <button onClick={() => setActiveTab('home')} className={`transition-colors py-1 ${activeView === 'home' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-amber-300'}`}>Home</button>
            {isLoggedIn && (
              <>
                {!canAccessAdmin && (
                  <button onClick={() => setActiveTab('dashboard')} className={`transition-colors py-1 ${activeView === 'dashboard' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-amber-300'}`}>Dashboard</button>
                )}
                <button onClick={() => setActiveTab('plans')} className={`transition-colors py-1 ${activeView === 'plans' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-amber-300'}`}>Invest</button>
              </>
            )}
            <button onClick={() => setActiveTab('contact')} className={`transition-colors py-1 ${activeView === 'contact' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'hover:text-amber-300'}`}>FAQ</button>
            
            {isAdminUser && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${activeView === 'admin' ? 'bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10'}`}>Admin Panel</button>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <button onClick={handleGetStartedClick} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all">
                  My Dashboard
                </button>
                <button onClick={requestLogout} className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-400/30 font-bold text-sm transition-all">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={handleGetStartedClick} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all">
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}