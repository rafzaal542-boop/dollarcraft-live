import React from 'react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthModal({
  authModalOpen,
  setAuthModalOpen,
  authMode,
  setAuthMode,
  fullName,
  setFullName,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  authError,
  handleAuthSubmit,
  isInitializing
}) {
  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-950 border border-violet-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
        <button 
          onClick={() => setAuthModalOpen(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-1.5 rounded-lg border border-white/10"
        >
          ✕
        </button>

        {isInitializing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <h3 className="text-lg font-bold text-white">Preparing Secure Session...</h3>
            <p className="text-xs text-gray-400">Connecting to encrypted yield gateway</p>
          </div>
        ) : (
          <>
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center text-xs font-bold shadow-md">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold">Personal</span>
              </div>
              <div className="w-8 h-0.5 bg-white/10"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-gray-500 flex items-center justify-center text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-gray-500 font-semibold">Security</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-white mb-0.5">
                {authMode === 'register' ? 'Personal Info' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-gray-400">Step 1 of 3 — Secure Account Setup</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && <p className="text-xs text-rose-400 text-center">{authError}</p>}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 mt-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Footer Login/Register Switch */}
            <div className="mt-5 text-center">
              {authMode === 'register' ? (
                <p className="text-xs text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-cyan-400 font-bold hover:underline">
                    Login
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-cyan-400 font-bold hover:underline">
                    Register
                  </button>
                </p>
              )}
            </div>

            {/* Security Badge */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-gray-400 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your data is secured with 256-bit encryption</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}