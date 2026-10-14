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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0b1026] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left">
        <button 
          onClick={() => setAuthModalOpen(false)} 
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 p-2 rounded-xl border border-white/10"
        >
          ✕
        </button>

        {isInitializing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <h3 className="text-lg font-bold text-white">Establishing Secure Node...</h3>
            <p className="text-xs text-gray-400">Initializing Dollar Craft encryption protocol</p>
          </div>
        ) : (
          <>
            {/* Unique Badge */}
            <div className="flex items-center justify-center mb-6">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wider uppercase">
                Dollar Craft Secure Gateway
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-white mb-1">
                {authMode === 'register' ? 'Investor Registration' : 'Investor Sign In'}
              </h3>
              <p className="text-xs text-gray-400">
                {authMode === 'register' ? 'Enter your credentials to join the micro-yield network' : 'Access your active yield dashboard'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Legal Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-gray-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ali Ameen"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Account Password</label>
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
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && <p className="text-xs text-rose-400 text-center">{authError}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {authMode === 'register' ? 'Proceed to Dashboard' : 'Authorize Login'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Footer Switch */}
            <div className="mt-5 text-center">
              {authMode === 'register' ? (
                <p className="text-xs text-gray-400">
                  Already have an active account?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-amber-400 font-bold hover:underline">
                    Sign In Here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  New investor?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-amber-400 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-gray-400 text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Dollar Craft Financial Protocol — All rights reserved</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}