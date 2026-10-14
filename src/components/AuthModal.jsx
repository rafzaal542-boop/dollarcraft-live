import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthModal({
  authModalOpen,
  setAuthModalOpen,
  authMode,
  setAuthMode,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  authError,
  handleAuthSubmit
}) {
  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">✕</button>
        <h3 className="text-2xl font-black text-white mb-2">{authMode === 'register' ? 'Create Account' : 'Welcome Back'}</h3>
        <p className="text-gray-400 text-xs mb-6">{authMode === 'register' ? 'Register to start earning daily micro-yields.' : 'Sign in to access your dashboard.'}</p>

        <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/10">
          <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authMode === 'register' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}>Register</button>
          <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${authMode === 'login' ? 'bg-violet-600 text-white' : 'text-gray-400'}`}>Sign In</button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authError && <p className="text-xs text-rose-400">{authError}</p>}

          <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg hover:opacity-90 transition-all">
            {authMode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}