import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(100);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleAccountPickerOpen, setGoogleAccountPickerOpen] = useState(false);

  // Help Center Chat State & Loading Spinner
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'agent', text: '👋 Welcome! Select language / Zuban muntakhib karein:' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const chatMessagesEndRef = useRef(null);

  const GOOGLE_CLIENT_ID = "510350063620-fbhcbnd8o83fu15md09dd48qvp1i3vai.apps.googleusercontent.com";

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [chatOpen, messages, setIsLoading]);

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleGoogleSignInClick = () => {
    // Open realistic Google Account Chooser popup simulation
    setAuthModalOpen(false);
    setGoogleAccountPickerOpen(true);
  };

  const handleAccountSelect = (emailName) => {
    setIsLoading(true);
    setGoogleAccountPickerOpen(false);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
      setActiveTab('dashboard');
    }, 1000);
  };

  const handleSelectLanguage = (lang) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedLanguage(lang);
      let replyText = `You selected English. How can we help?`;
      if (lang === 'Urdu') {
        replyText = `Aapne Urdu select ki hai. Neeche option select karein:`;
      } else if (lang === 'Spanish') {
        replyText = `Has seleccionado Español. ¿Cómo ayudamos?`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: `Language: ${lang}` },
        { sender: 'agent', text: replyText }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleSelectIssue = (issueType) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedIssue(issueType);
      let issueReply = '';

      if (issueType === 'slip') {
        issueReply = selectedLanguage === 'Urdu' 
          ? '📄 Apni transaction slip ya screenshot upload karein.'
          : selectedLanguage === 'Spanish'
          ? '📄 Sube tu comprobante de transacción.'
          : '📄 Please upload your transaction slip below.';
      } else if (issueType === 'problem') {
        issueReply = selectedLanguage === 'Urdu'
          ? '⚠️ Kya mushkil pesh aa rahi hai? Yahan message likhein.'
          : selectedLanguage === 'Spanish'
          ? '⚠️ ¿Qué problema tienes? Escribe aquí.'
          : '⚠️ What problem are you facing? Type below.';
      } else if (issueType === 'blocked') {
        issueReply = selectedLanguage === 'Urdu'
          ? '🔒 Apna registered email aur account ID share karein.'
          : selectedLanguage === 'Spanish'
          ? '🔒 Comparte tu correo e ID de cuenta.'
          : '🔒 Share your registered email and ID.';
      }

      const issueLabels = {
        slip: { English: 'Transaction Slip', Urdu: 'Transaction Slip', Spanish: 'Comprobante' },
        problem: { English: 'Facing Problem', Urdu: 'Mushkil', Spanish: 'Problema' },
        blocked: { English: 'Account Blocked', Urdu: 'Account Blocked', Spanish: 'Cuenta Bloqueada' }
      };

      const labelText = issueLabels[issueType][selectedLanguage || 'English'];

      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: labelText },
        { sender: 'agent', text: issueReply }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedFile) return;

    let userText = inputMessage;
    if (attachedFile) {
      userText += ` [File: ${attachedFile.name}]`;
    }

    const newMsg = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setAttachedFile(null);
    setIsLoading(true);

    setTimeout(() => {
      let agentReply = '✅ Thank you! Request logged successfully.';
      if (selectedLanguage === 'Urdu') {
        agentReply = '✅ Shukriya! Request register ho chuki hai.';
      } else if (selectedLanguage === 'Spanish') {
        agentReply = '✅ ¡Gracias! Solicitud registrada.';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: agentReply }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(680409813.2402);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveProtocolTotal((prev) => prev + 0.1234);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const dailyReturnRate = 0.50 / 30;
  const estimatedDailyProfit = investAmount * dailyReturnRate;
  const [liveEarnings, setLiveEarnings] = useState(0.0045);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveEarnings((prev) => prev + 0.0001);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const globalHubs = [
    { name: 'USA', code: 'us' },
    { name: 'Canada', code: 'ca' },
    { name: 'Australia', code: 'au' },
    { name: 'UK', code: 'gb' },
    { name: 'UAE', code: 'ae' },
    { name: 'Singapore', code: 'sg' },
    { name: 'Europe', code: 'eu' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090d23] via-[#050814] to-[#03050a] text-white font-sans text-xs sm:text-sm selection:bg-violet-500 selection:text-white relative overflow-x-hidden">
      {/* Pro ARY Style 3D Multi-Axis Tumbling Animation CSS */}
      <style>{`
        @keyframes aryChannel3d {
          0% {
            transform: perspective(800px) rotateX(25deg) rotateY(0deg) rotateZ(0deg) scale(1);
          }
          25% {
            transform: perspective(800px) rotateX(-25deg) rotateY(90deg) rotateZ(15deg) scale(1.08);
          }
          50% {
            transform: perspective(800px) rotateX(25deg) rotateY(180deg) rotateZ(0deg) scale(1);
          }
          75% {
            transform: perspective(800px) rotateX(-25deg) rotateY(270deg) rotateZ(-15deg) scale(1.08);
          }
          100% {
            transform: perspective(800px) rotateX(25deg) rotateY(360deg) rotateZ(0deg) scale(1);
          }
        }
        .animate-ary-3d {
          animation: aryChannel3d 4s cubic-bezier(0.37, 0, 0.63, 1) infinite;
          transform-style: preserve-3d;
        }
      `}</style>

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090d23]/90 border-b border-violet-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-sm shadow-md shadow-violet-500/30 text-white">
                DC
              </div>
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-violet-200 to-cyan-400 bg-clip-text text-transparent">
                Dollar Craft
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-gray-300">
              <button onClick={() => setActiveTab('home')} className={`transition-colors py-1 ${activeTab === 'home' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Home</button>
              {isLoggedIn && (
                <>
                  <button onClick={() => setActiveTab('dashboard')} className={`transition-colors py-1 ${activeTab === 'dashboard' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Dashboard</button>
                  <button onClick={() => setActiveTab('plans')} className={`transition-colors py-1 ${activeTab === 'plans' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Invest</button>
                </>
              )}
              <button onClick={() => setActiveTab('contact')} className={`transition-colors py-1 ${activeTab === 'contact' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>FAQ</button>
              {isLoggedIn && (
                <button onClick={() => setActiveTab('admin')} className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-violet-300 font-bold hover:bg-white/10 transition-all ${activeTab === 'admin' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow' : ''}`}>Admin Panel</button>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button onClick={handleGetStartedClick} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-violet-500/30 transition-all">
                {isLoggedIn ? 'My Dashboard' : 'Get Started'}
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 p-1.5 rounded-lg bg-white/5 border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#090d23]/95 backdrop-blur-2xl border-b border-violet-500/20 px-4 pt-2 pb-4 space-y-2 text-xs">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded-md text-gray-200">Home</button>
            {isLoggedIn && (
              <>
                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded-md text-gray-200">Dashboard</button>
                <button onClick={() => { setActiveTab('plans'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded-md text-gray-200">Invest</button>
              </>
            )}
            <button onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded-md text-violet-400 font-bold">FAQ</button>
            {isLoggedIn && (
              <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded-md text-gray-200">Admin Panel</button>
            )}
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="py-8 relative z-10">
        
        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-10 max-w-6xl mx-auto px-4">
            <section className="text-center pt-4">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6 shadow-md">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
                ⚡ Live Yield Protocol Active — Start Earning Today
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                Micro-Yields, <br />
                <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Earn Real Daily Money
                </span>
              </h1>

              <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-300 mb-8 leading-relaxed">
                Join thousands of users earning daily returns through our secure automated protocol. Boost your capital with our powerful 50% monthly compounding framework.
              </p>

              {/* Only Top and Bottom Get Started Buttons */}
              <div className="flex items-center justify-center">
                <button onClick={handleGetStartedClick} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-xl shadow-violet-500/40 transition-all transform hover:scale-105">
                  Get Started →
                </button>
              </div>
            </section>

            {/* Live Ticker Banner */}
            <section className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 border border-violet-500/30 rounded-2xl p-5 shadow-xl text-center relative overflow-hidden backdrop-blur-xl">
                <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest block mb-1">
                  🟢 LIVE GLOBAL ACCRUAL TICKER (26-DECIMAL TICK)
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">
                  ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </h2>
                <p className="text-[11px] text-gray-300 mt-1">Compound capital flowing in real-time across active investor vaults.</p>
              </div>
            </section>

            {/* Global Hubs */}
            <section className="max-w-6xl mx-auto">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">🏛 REGISTERED & OPERATING GLOBAL HUBS</h3>
                    <p className="text-gray-300 text-xs">Fully compliant operations with Tier-1 local regulatory frameworks.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-bold">7 ACTIVE HUBS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {globalHubs.map((hub, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-3 text-center hover:border-violet-500/50 transition-all flex flex-col items-center">
                      <img src={`https://flagcdn.com/96x72/${hub.code}.png`} alt={hub.name} className="w-10 h-7 object-cover rounded shadow mb-1.5 border border-white/20" />
                      <h4 className="font-bold text-white text-xs">{hub.name}</h4>
                      <span className="text-[9px] text-cyan-400 font-semibold uppercase block mt-0.5">COMPLIANT</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. INVEST TAB */}
        {activeTab === 'plans' && (
          <section className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-white mb-1">Exclusive Super DC Investment Plan</h2>
              <p className="text-xs text-gray-300">Minimum $50, Maximum $10,000 — Daily Earning & 50% Monthly Return.</p>
            </div>
            <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 p-6 shadow-xl">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-cyan-400 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase shadow">VIP Premium</div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-6">
                <div>
                  <span className="text-violet-400 font-semibold text-xs uppercase">Flagship Protocol</span>
                  <h3 className="text-xl font-black text-white mt-0.5">SUPER DC PLAN</h3>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">50%</span>
                  <span className="text-gray-300 block text-xs">Monthly Return (~1.66% Daily)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <span className="text-gray-300 text-[10px] uppercase block mb-1">Minimum Investment</span>
                  <span className="text-lg font-bold text-white">$50 USD</span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <span className="text-gray-300 text-[10px] uppercase block mb-1">Maximum Investment</span>
                  <span className="text-lg font-bold text-white">$10,000 USD</span>
                </div>
              </div>
              <div className="bg-violet-950/20 border border-violet-500/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-gray-200">Investment Amount ($):</label>
                  <span className="text-cyan-400 font-bold text-sm">${investAmount}</span>
                </div>
                <input type="range" min="50" max="10000" step="50" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="w-full h-1.5 bg-slate-700 rounded-lg accent-cyan-400 mb-4 cursor-pointer" />
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-violet-500/20">
                  <div>
                    <span className="text-gray-300 text-[10px] block">Estimated Daily Profit</span>
                    <span className="text-sm font-extrabold text-cyan-400">+${estimatedDailyProfit.toFixed(2)} / day</span>
                  </div>
                  <div>
                    <span className="text-gray-300 text-[10px] block">Monthly Return (50%)</span>
                    <span className="text-sm font-extrabold text-white">+${(investAmount * 0.50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-violet-500/30 transition-all">Confirm Super DC Investment</button>
            </div>
          </section>
        )}

        {/* 3. CUSTOMER DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <section className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Customer Dashboard</h2>
                <p className="text-gray-300 text-xs">Manage your deposits, earnings, referral wallet, and active positions.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
                🟢 Live Sync Active
              </span>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-violet-950/30 to-slate-900 border border-violet-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block mb-1">💰 Total Balance</span>
                <h1 className="text-3xl font-black text-cyan-400 font-mono">$1,250.00</h1>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => setActiveTab('plans')} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-md shadow-violet-500/30 transition-all">
                  + Deposit
                </button>
                <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all">
                  ↑ Withdraw
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Deposit Wallet</span>
                <h3 className="text-lg font-black text-white font-mono">$500.00</h3>
              </div>
              <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Earning Wallet</span>
                <h3 className="text-lg font-black text-cyan-400 font-mono">+${liveEarnings.toFixed(4)}</h3>
              </div>
              <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Referral Wallet</span>
                <h3 className="text-lg font-black text-white font-mono">$250.00</h3>
              </div>
              <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block mb-1">Rewards Wallet</span>
                <h3 className="text-lg font-black text-white font-mono">$100.00</h3>
              </div>
            </div>
          </section>
        )}

        {/* 4. FAQ TAB */}
        {activeTab === 'contact' && (
          <section className="max-w-4xl mx-auto px-4">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white text-xl font-black shadow-md shadow-violet-500/30">
                  ❓
                </div>
                <div>
                  <span className="text-violet-400 text-[10px] font-bold uppercase tracking-widest">HELP & SUPPORT</span>
                  <h2 className="text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-black/50 border border-violet-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-1">How does the Super DC daily micro-yield work?</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">Our high-precision protocol automatically compounds daily capital growth, providing approximately 50% monthly returns calculated with 26-decimal sub-second precision.</p>
                </div>
                <div className="bg-black/50 border border-violet-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-1">What is the minimum and maximum investment?</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">The minimum investment amount is $50 USD, and the maximum cap per Super DC plan position is $10,000 USD.</p>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-cyan-950/40 border border-violet-500/30 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-violet-400 tracking-widest uppercase block mb-0.5">🏛️ REGISTERED CORPORATE HEADQUARTERS</span>
                  <h4 className="text-sm font-bold text-white">Dollar Craft Pte Ltd</h4>
                  <p className="text-[11px] text-gray-300">70 Bendemeer Road, #03-07, Luzerne, Singapore 339940</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
                  VERIFIED HQ
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 5. ADMIN PANEL TAB */}
        {activeTab === 'admin' && (
          <section className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">Admin Control Center</h2>
                <p className="text-gray-300 text-xs">Manage users, deposits, daily ROI payouts, and configurations.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-violet-500/20">
                <button onClick={() => setAdminSubTab('dashboard')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${adminSubTab === 'dashboard' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-300 hover:text-white'}`}>Dashboard</button>
                <button onClick={() => setAdminSubTab('users')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${adminSubTab === 'users' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-300 hover:text-white'}`}>Users</button>
                <button onClick={() => setAdminSubTab('finance')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${adminSubTab === 'finance' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-300 hover:text-white'}`}>Finance</button>
                <button onClick={() => setAdminSubTab('settings')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${adminSubTab === 'settings' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-300 hover:text-white'}`}>Settings</button>
              </div>
            </div>

            {adminSubTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                    <span className="text-gray-300 text-[10px] uppercase">Total Users</span>
                    <h3 className="text-2xl font-bold text-white mt-0.5">1,248</h3>
                  </div>
                  <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                    <span className="text-gray-300 text-[10px] uppercase">Active Capital</span>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">$45,200</h3>
                  </div>
                  <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                    <span className="text-gray-300 text-[10px] uppercase">Pending Withdrawals</span>
                    <h3 className="text-2xl font-bold text-amber-400 mt-1">12</h3>
                  </div>
                  <div className="bg-slate-900/80 border border-violet-500/20 rounded-xl p-4">
                    <span className="text-gray-300 text-[10px] uppercase">Daily ROI Payout</span>
                    <h3 className="text-2xl font-bold text-cyan-400 mt-1">$750</h3>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      {/* GOOGLE SIGN IN MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-[#0c1329] to-black border border-violet-500/40 rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)] text-white relative">
            
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
              ✕
            </button>

            <div className="text-center mb-6 pt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-lg shadow-lg shadow-violet-500/30 text-white mx-auto mb-3">
                DC
              </div>
              <h3 className="text-lg font-black text-white">Welcome to Dollar Craft</h3>
              <p className="text-xs text-gray-400 mt-1">Sign in with Google to access your account & start earning.</p>
            </div>

            <button 
              onClick={handleGoogleSignInClick}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {/* Official Google Colored Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.2v3.15C3.21 21.32 7.29 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.2C.44 8.13 0 9.83 0 12s.44 3.87 1.2 5.39l4.07-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.29 0 3.21 2.68 1.2 6.61l4.07 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-[10px] text-gray-500 text-center mt-5">
              By signing in, you agree to Dollar Craft Terms & Conditions and Privacy Policy.
            </p>

          </div>
        </div>
      )}

      {/* REALISTIC GOOGLE ACCOUNT CHOOSER POPUP */}
      {googleAccountPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.2v3.15C3.21 21.32 7.29 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.2C.44 8.13 0 9.83 0 12s.44 3.87 1.2 5.39l4.07-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.29 0 3.21 2.68 1.2 6.61l4.07 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                <span className="font-bold text-base text-gray-800">Sign in with Google</span>
              </div>
              <button onClick={() => setGoogleAccountPickerOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-sm">✕</button>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-lg text-gray-900">Choose an account</h4>
              <p className="text-xs text-gray-500">to continue to <span className="font-semibold text-gray-700">Dollar Craft</span> (Client ID: dollarcraft)</p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-gray-600">Connecting securely to Google...</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <div onClick={() => handleAccountSelect('user@gmail.com')} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">
                    U
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-bold text-sm text-gray-900 truncate">User Account</h5>
                    <p className="text-xs text-gray-500 truncate">user.dollarcraft@gmail.com</p>
                  </div>
                </div>

                <div onClick={() => handleAccountSelect('admin@gmail.com')} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-600 text-white font-black flex items-center justify-center text-sm shadow">
                    A
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-bold text-sm text-gray-900 truncate">Admin Vault</h5>
                    <p className="text-xs text-gray-500 truncate">admin.dollarcraft@gmail.com</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500">
              To continue, Google will share your name, email address, and profile picture with Dollar Craft.
            </div>

          </div>
        </div>
      )}

      {/* FIXED BOTTOM-RIGHT HELP CENTER WITH PRO ARY STYLE 3D TUMBLING LOGO */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto flex flex-col items-end">
        {chatOpen && (
          <div className="mb-2 w-[280px] h-[360px] bg-gradient-to-b from-slate-900 via-[#0c1329] to-black backdrop-blur-3xl border border-violet-500/40 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white relative">
            
            {/* Header: Help Center */}
            <div className="bg-gradient-to-r from-violet-900/60 via-slate-900 to-cyan-950/60 px-3 py-2 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center font-black text-black shadow-md text-[9px]">
                  AI
                </div>
                <div>
                  <h4 className="font-extrabold text-[11px] text-violet-300">Help Center</h4>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white px-1.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] transition-all">
                ✕
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-black/50 text-[9px]">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl px-2.5 py-1.5 leading-tight ${msg.sender === 'user' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-br-none shadow' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/10'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Smooth Loading Spinner */}
              {isLoading && (
                <div className="flex justify-start items-center gap-1 py-0.5">
                  <div className="bg-white/10 border border-white/10 rounded-xl px-2 py-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-[8px] text-violet-300">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Full Language Names Buttons */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[8px] text-violet-400 font-bold text-center block uppercase tracking-wider">
                  {selectedLanguage ? 'Language:' : 'Select Language:'}
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button onClick={() => handleSelectLanguage('English')} disabled={isLoading} className={`py-1.5 px-1 rounded-lg border text-[9px] font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'English' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    English
                  </button>
                  <button onClick={() => handleSelectLanguage('Urdu')} disabled={isLoading} className={`py-1.5 px-1 rounded-lg border text-[9px] font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'Urdu' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    اردو
                  </button>
                  <button onClick={() => handleSelectLanguage('Spanish')} disabled={isLoading} className={`py-1.5 px-1 rounded-lg border text-[9px] font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'Spanish' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    Español
                  </button>
                </div>
              </div>

              {/* Issue Options */}
              {selectedLanguage && (
                <div className="flex flex-col gap-1 pt-1.5 border-t border-white/10 mt-1">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleSelectIssue('slip')} disabled={isLoading} className="py-1.5 px-2 rounded-lg bg-violet-500/20 hover:bg-violet-500 hover:text-white border border-violet-500/40 text-violet-300 font-bold text-[9px] text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>📄 Transaction Slip</span>
                      <span>→</span>
                    </button>
                    <button onClick={() => handleSelectIssue('problem')} disabled={isLoading} className="py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-500/40 text-cyan-300 font-bold text-[9px] text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>⚠️ Facing Problem</span>
                      <span>→</span>
                    </button>
                    <button onClick={() => handleSelectIssue('blocked')} disabled={isLoading} className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-400 hover:text-black border border-amber-500/40 text-amber-300 font-bold text-[9px] text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>🔒 Account Blocked</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Input & Attachment Footer */}
            <form onSubmit={handleSendMessage} className="p-2 bg-slate-950 border-t border-white/10 space-y-1">
              {attachedFile && (
                <div className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded-lg text-[8px] border border-white/10">
                  <span className="truncate text-violet-300">📎 {attachedFile.name}</span>
                  <button type="button" onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-400">✕</button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <label className="cursor-pointer p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 text-xs transition-all" title="Attach">
                  📎
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    disabled={isLoading}
                    onChange={(e) => setAttachedFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <input 
                  type="text" 
                  placeholder={!selectedLanguage ? "Select language first..." : "Type message..."} 
                  value={inputMessage} 
                  disabled={!selectedLanguage || isLoading}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-black/70 border border-white/15 rounded-lg px-2.5 py-1 text-[9px] text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                />

                <button 
                  type="submit" 
                  disabled={!selectedLanguage || isLoading}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-black text-[9px] shadow transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ARY Digital Style Pro 3D Multi-Axis Tumbling Logo Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.9)] transform hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white/60 animate-ary-3d cursor-pointer"
          title="Open Help Center"
        >
          {/* Professional Headset Support Icon */}
          <svg className="w-7 h-7 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.08L2.25 20.75c-.32.32.09.73.41.41l3.67-1.12C7.91 20.89 9.89 21.5 12 21.5c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17.5c-1.84 0-3.52-.57-4.92-1.54l-.27-.19-2.28.7.7-2.28-.19-.27C4.07 14.72 3.5 13.04 3.5 11.2c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5-3.81 8.5-8.5 8.5zm4.25-6.75c-.41 0-.75-.34-.75-.75 0-1.24-1.01-2.25-2.25-2.25-.41 0-.75-.34-.75-.75s.34-.75.75-7.5c2.07 0 3.75 1.68 3.75 3.75 0 .41-.34.75-.75.75z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}