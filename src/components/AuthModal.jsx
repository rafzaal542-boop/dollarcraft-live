import React from 'react';
import { User, Mail, Lock, ArrowRight, ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b1026] border border-amber-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative text-left my-auto">
        <button 
          onClick={() => setAuthModalOpen(false)} 
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white bg-white/5 p-1 rounded-lg border border-white/10 text-xs"
        >
          ✕
        </button>

        {isInitializing ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <h3 className="text-sm font-bold text-white">Establishing Secure Node...</h3>
            <p className="text-[10px] text-gray-400">Initializing Dollar Craft protocol</p>
          </div>
        ) : (
          <>
            {/* Top Badge */}
            <div className="flex items-center justify-center mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold tracking-wider uppercase">
                Dollar Craft Secure Gateway
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-black text-white leading-tight">
                {authMode === 'register' ? 'Investor Registration' : 'Investor Sign In'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {authMode === 'register' ? 'Enter details to access the yield network' : 'Access your active dashboard'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-2.5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ali Ameen"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-gray-300 mb-1">Registered Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-300 mb-1">Account Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {authError && <p className="text-[10px] text-rose-400 text-center">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 mt-1"
              >
                {authMode === 'register' ? 'Proceed to Dashboard' : 'Authorize Login'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Footer Switch */}
            <div className="mt-3 text-center">
              {authMode === 'register' ? (
                <p className="text-[10px] text-gray-400">
                  Already have an active account?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold hover:underline">
                    Sign In Here
                  </button>
                </p>
              ) : (
                <p className="text-[10px] text-gray-400">
                  New investor?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-amber-400 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-center gap-1 text-gray-400 text-[9px]">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Dollar Craft Financial Protocol — All rights reserved</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}