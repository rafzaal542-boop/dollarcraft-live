import React, { useState, useEffect, useRef } from 'react';

const GLOBAL_ACCRUAL_BASE = 1_068_566_700;
const GLOBAL_ACCRUAL_STARTED_AT = Date.parse('2026-10-08T06:39:27.411Z');
const GLOBAL_ACCRUAL_PER_SECOND = 2000 / 3600;
const USERS_STORAGE_KEY = 'dollarcraft-users';
const SESSION_STORAGE_KEY = 'dollarcraft-session';
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';

const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  return fullName.trim().split(/\s+/).filter(Boolean)[0] || '';
};

const getGlobalAccrualTotal = (now = Date.now()) =>
  GLOBAL_ACCRUAL_BASE +
  (Math.max(0, now - GLOBAL_ACCRUAL_STARTED_AT) / 1000) *
    GLOBAL_ACCRUAL_PER_SECOND;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(100);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [internalTransferEmail, setInternalTransferEmail] = useState('');
  const [internalTransferAmount, setInternalTransferAmount] = useState('');
  const [internalTransferError, setInternalTransferError] = useState('');
  const [internalTransferSuccess, setInternalTransferSuccess] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      return Boolean(savedSession.userEmail);
    } catch {
      return false;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'login' or 'register'
  const [usersList, setUsersList] = useState(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const parsedUsers = savedUsers ? JSON.parse(savedUsers) : [];
      return Array.isArray(parsedUsers)
        ? parsedUsers.filter(
            (user) =>
              user &&
              typeof user.email === 'string' &&
              typeof user.password === 'string' &&
              typeof user.name === 'string'
          ).map((user) => ({
            ...user,
            balanceCents:
              Number.isSafeInteger(user.balanceCents) && user.balanceCents >= 0
                ? user.balanceCents
                : 0
          }))
        : [];
    } catch (error) {
      console.error('Unable to load registered accounts.', error);
      return [];
    }
  });
  
  // Form States for Manual Auth
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [userEmail, setUserEmail] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      return savedSession.userEmail || '';
    } catch {
      return '';
    }
  });
  const [userName, setUserName] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      return savedSession.userName || '';
    } catch {
      return '';
    }
  });
  const [userFirstName, setUserFirstName] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      return savedSession.userFirstName || '';
    } catch {
      return '';
    }
  });
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

  const currentUser = usersList.find(
    (user) => user.email.toLowerCase() === userEmail.toLowerCase()
  );
  const totalBalanceCents = currentUser?.balanceCents ?? 0;
  const persistUsers = (updatedUsers) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsersList(updatedUsers);
      return true;
    } catch (error) {
      console.error('Unable to save registered accounts.', error);
      return false;
    }
  };

  // Admin Metrics & History
  const [totalVisitsToday, setTotalVisitsToday] = useState(0);
  const [activeVaultCapital, setActiveVaultCapital] = useState(0);
  const [dailyRoiPool, setDailyRoiPool] = useState(0);
  const [platformFee, setPlatformFee] = useState('2.5');
  const [roiRate, setRoiRate] = useState('1.66');

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

  const requestLogout = () => {
    setMobileMenuOpen(false);
    setLogoutConfirmationOpen(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Unable to clear the saved session.', error);
      alert('Unable to securely end your session. Please check your browser storage and try again.');
      return;
    }

    setIsLoggedIn(false);
    setUserEmail('');
    setUserName('');
    setUserFirstName('');
    setActiveTab('home');
    setAdminSubTab('dashboard');
    setMobileMenuOpen(false);
    setAuthModalOpen(false);
    setWithdrawalModalOpen(false);
    setWithdrawalAmount('');
    setWithdrawalError('');
    setWithdrawalSuccess(false);
    setInternalTransferEmail('');
    setInternalTransferAmount('');
    setInternalTransferError('');
    setInternalTransferSuccess('');
    setLogoutConfirmationOpen(false);
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawalAmount);
    const amountCents = Math.round(amount * 100);

    if (!Number.isFinite(amount) || amount < 10) {
      setWithdrawalError('Minimum withdrawal amount is $10 USD');
      setWithdrawalSuccess(false);
      return;
    }

    if (!Number.isSafeInteger(amountCents) || Math.abs(amount * 100 - amountCents) > 1e-7) {
      setWithdrawalError('Enter a valid amount in cents.');
      setWithdrawalSuccess(false);
      return;
    }

    if (!currentUser) {
      setWithdrawalError('Unable to find your account. Please sign in again.');
      setWithdrawalSuccess(false);
      return;
    }

    if (amountCents > totalBalanceCents) {
      setWithdrawalError(
        `Insufficient balance. Available balance: $${(totalBalanceCents / 100).toFixed(2)} USD`
      );
      setWithdrawalSuccess(false);
      return;
    }

    const updatedUsers = usersList.map((user) =>
      user.email.toLowerCase() === currentUser.email.toLowerCase()
        ? { ...user, balanceCents: user.balanceCents - amountCents }
        : user
    );
    if (!persistUsers(updatedUsers)) {
      setWithdrawalError('Unable to update your balance. Please try again.');
      setWithdrawalSuccess(false);
      return;
    }

    setWithdrawalError('');
    setWithdrawalSuccess(true);
  };

  const handleInternalTransferSubmit = (e) => {
    e.preventDefault();
    setInternalTransferError('');
    setInternalTransferSuccess('');

    if (userEmail.toLowerCase() !== ADMIN_EMAIL) {
      setInternalTransferError('Only the administrator can make internal transfers.');
      return;
    }

    const recipientEmail = internalTransferEmail.trim().toLowerCase();
    const amount = Number(internalTransferAmount);
    const amountCents = Math.round(amount * 100);
    const recipient = usersList.find(
      (user) => user.email.toLowerCase() === recipientEmail
    );

    if (!recipient) {
      setInternalTransferError('Select or enter the email of a registered user.');
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(amountCents) ||
      Math.abs(amount * 100 - amountCents) > 1e-7
    ) {
      setInternalTransferError('Enter a valid transfer amount in cents.');
      return;
    }

    const updatedBalanceCents = recipient.balanceCents + amountCents;
    if (!Number.isSafeInteger(updatedBalanceCents)) {
      setInternalTransferError('The resulting balance is too large to store accurately.');
      return;
    }

    const updatedUsers = usersList.map((user) =>
      user.email.toLowerCase() === recipientEmail
        ? { ...user, balanceCents: updatedBalanceCents }
        : user
    );
    if (!persistUsers(updatedUsers)) {
      setInternalTransferError('Unable to save the transfer. Please try again.');
      return;
    }

    setInternalTransferSuccess(
      `$${(amountCents / 100).toFixed(2)} USD transferred to ${recipient.email}.`
    );
    setInternalTransferAmount('');
  };

  const closeWithdrawalModal = () => {
    setWithdrawalModalOpen(false);
    setWithdrawalAmount('');
    setWithdrawalError('');
    setWithdrawalSuccess(false);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    const sessionPayload = {
      userEmail,
      userName,
      userFirstName,
      loggedInAt: Date.now()
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
  }, [isLoggedIn, userEmail, userName, userFirstName]);

  // Manual Authentication Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const finalEmail = emailInput.trim().toLowerCase();
    const finalPassword = passwordInput;
    const finalName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!finalEmail || !finalPassword || (authMode === 'register' && (!firstName.trim() || !lastName.trim()))) {
      alert('Please fill in all required fields.');
      return;
    }

    const account = usersList.find(
      (user) => user.email.toLowerCase() === finalEmail
    );

    if (authMode === 'login') {
      if (finalEmail === ADMIN_EMAIL) {
        if (account && account.password !== finalPassword) {
          alert('Incorrect email or password. Please try again.');
          return;
        }

      } else if (!account) {
        alert('Account not found. Please register first.');
        return;
      } else if (account.password !== finalPassword) {
        alert('Incorrect email or password. Please try again.');
        return;
      }
    } else if (account) {
      alert('An account with this email already exists. Please sign in.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      let signedInName = finalName;
      let signedInFirstName = finalName ? getFirstName(finalName) : '';

      if (authMode === 'register') {
        const newAccount = {
          email: finalEmail,
          password: finalPassword,
          name: finalName,
          firstName: signedInFirstName,
          balanceCents: 0,
          lastSignInAt: Date.now()
        };
        const updatedUsers = [...usersList, newAccount];
        if (!persistUsers(updatedUsers)) {
          alert('Unable to save your account. Please check your browser storage and try again.');
          setIsLoading(false);
          return;
        }
      } else {
        const storedFirstName = account?.firstName || getFirstName(account?.name || '');
        signedInName = finalEmail === ADMIN_EMAIL
          ? 'Alexander Smith (Admin)'
          : account.name;
        signedInFirstName = finalEmail === ADMIN_EMAIL ? 'Alexander' : storedFirstName;
        const signedInAccount = {
          ...(account || {
            email: finalEmail,
            password: finalPassword,
            name: signedInName,
            firstName: signedInFirstName,
            balanceCents: 0
          }),
          lastSignInAt: Date.now()
        };
        const updatedUsers = account
          ? usersList.map((user) =>
              user.email.toLowerCase() === finalEmail ? signedInAccount : user
            )
          : [...usersList, signedInAccount];
        if (!persistUsers(updatedUsers)) {
          alert('Unable to update your sign-in record. Please check your browser storage and try again.');
          setIsLoading(false);
          return;
        }
      }

      setUserEmail(finalEmail);
      setUserName(signedInName);
      setUserFirstName(signedInFirstName);
      setIsLoggedIn(true);
      setAuthModalOpen(false);
      setIsLoading(false);
      setActiveTab('dashboard');

      setTotalVisitsToday((prev) => prev + 1);
    }, 800);
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

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(getGlobalAccrualTotal);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveProtocolTotal(getGlobalAccrualTotal());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const dailyReturnRate = 0.50 / 30;
  const estimatedDailyProfit = investAmount * dailyReturnRate;
  const [liveEarnings, setLiveEarnings] = useState(0.0000);

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
    <div className="min-h-screen bg-gradient-to-b from-[#090d23] via-[#050814] to-[#03050a] text-white font-sans text-sm sm:text-base selection:bg-violet-500 selection:text-white relative overflow-x-hidden">
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
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090d23]/90 border-b border-violet-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-base shadow-md shadow-violet-500/30 text-white">
                DC
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-violet-200 to-cyan-400 bg-clip-text text-transparent">
                Dollar Craft
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-300">
              <button onClick={() => setActiveTab('home')} className={`transition-colors py-1 ${activeTab === 'home' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Home</button>
              {isLoggedIn && (
                <>
                  <button onClick={() => setActiveTab('dashboard')} className={`transition-colors py-1 ${activeTab === 'dashboard' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Dashboard</button>
                  <button onClick={() => setActiveTab('plans')} className={`transition-colors py-1 ${activeTab === 'plans' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Invest</button>
                </>
              )}
              <button onClick={() => setActiveTab('contact')} className={`transition-colors py-1 ${activeTab === 'contact' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>FAQ</button>
              
              {/* ADMIN PANEL VISIBLE ONLY FOR dollarcraft3@gmail.com */}
              {isLoggedIn && userEmail === 'dollarcraft3@gmail.com' && (
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-violet-300 font-bold hover:bg-white/10 transition-all ${activeTab === 'admin' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow' : ''}`}>Admin Panel</button>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <button onClick={handleGetStartedClick} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-violet-500/30 transition-all">
                    My Dashboard
                  </button>
                  <button
                    onClick={requestLogout}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:border-rose-300/50 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5m0 0-5-5m5 5H3" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={handleGetStartedClick} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-violet-500/30 transition-all">
                  Get Started
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 p-2 rounded-xl bg-white/5 border border-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#090d23]/95 backdrop-blur-2xl border-b border-violet-500/20 px-6 pt-3 pb-6 space-y-3 text-sm font-semibold">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg text-gray-200">Home</button>
            {isLoggedIn && (
              <>
                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg text-gray-200">Dashboard</button>
                <button onClick={() => { setActiveTab('plans'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg text-gray-200">Invest</button>
              </>
            )}
            <button onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg text-violet-400 font-bold">FAQ</button>
            
            {isLoggedIn && userEmail === 'dollarcraft3@gmail.com' && (
              <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 rounded-lg text-gray-200">Admin Panel</button>
            )}
            {isLoggedIn && (
              <button
                onClick={requestLogout}
                className="block w-full text-left px-4 py-2 rounded-lg text-rose-200 hover:bg-rose-500/10 font-bold transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="py-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-14">
            <section className="text-center pt-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-semibold mb-6 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping"></span>
                ⚡ Live Yield Protocol Active — Start Earning Today
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                Micro-Yields, <br />
                <span className="bg-gradient-to-r from-violet-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Earn Real Daily Money
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-10 leading-relaxed">
                Join thousands of users earning daily returns through our secure automated protocol. Boost your capital with our powerful 50% monthly compounding framework.
              </p>

              <div className="flex items-center justify-center">
                <button onClick={handleGetStartedClick} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-base shadow-2xl shadow-violet-500/40 transition-all transform hover:scale-105">
                  Get Started →
                </button>
              </div>
            </section>

            <section className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl">
                <span className="text-xs font-extrabold text-violet-400 uppercase tracking-widest block mb-2">
                  🟢 SIMULATED GLOBAL ACCRUAL TICKER
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono tracking-tight">
                  ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm text-gray-300 mt-2">Illustrative ticker calculated from a shared timestamp; not a live account balance.</p>
              </div>
            </section>

            <section className="max-w-6xl mx-auto">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">🏛 REGISTERED & OPERATING GLOBAL HUBS</h3>
                    <p className="text-gray-300 text-sm mt-0.5">Fully compliant operations with Tier-1 local regulatory frameworks.</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">7 ACTIVE HUBS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {globalHubs.map((hub, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center hover:border-violet-500/50 transition-all flex flex-col items-center">
                      <img src={`https://flagcdn.com/96x72/${hub.code}.png`} alt={hub.name} className="w-12 h-9 object-cover rounded shadow mb-2.5 border border-white/20" />
                      <h4 className="font-bold text-white text-sm">{hub.name}</h4>
                      <span className="text-[10px] text-cyan-400 font-semibold uppercase block mt-1">COMPLIANT</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. INVEST TAB */}
        {activeTab === 'plans' && (
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white mb-2">Exclusive Super DC Investment Plan</h2>
              <p className="text-sm text-gray-300">Minimum $50, Maximum $10,000 — Daily Earning & 50% Monthly Return.</p>
            </div>
            <div className="relative rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 p-8 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-cyan-400 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl uppercase shadow">VIP Premium</div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-8">
                <div>
                  <span className="text-violet-400 font-semibold text-xs uppercase tracking-wider">Flagship Protocol</span>
                  <h3 className="text-2xl font-black text-white mt-1">SUPER DC PLAN</h3>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">50%</span>
                  <span className="text-gray-300 block text-sm mt-0.5">Monthly Return (~1.66% Daily)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <span className="text-gray-300 text-xs uppercase block mb-1.5 font-semibold">Minimum Investment</span>
                  <span className="text-xl font-bold text-white">$50 USD</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <span className="text-gray-300 text-xs uppercase block mb-1.5 font-semibold">Maximum Investment</span>
                  <span className="text-xl font-bold text-white">$10,000 USD</span>
                </div>
              </div>
              <div className="bg-violet-950/20 border border-violet-500/30 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold text-gray-200">Investment Amount ($):</label>
                  <span className="text-cyan-400 font-bold text-lg font-mono">${investAmount}</span>
                </div>
                <input type="range" min="50" max="10000" step="50" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg accent-cyan-400 mb-6 cursor-pointer" />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-500/20 text-sm">
                  <div>
                    <span className="text-gray-300 text-xs block mb-1">Estimated Daily Profit</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono">+${estimatedDailyProfit.toFixed(2)} / day</span>
                  </div>
                  <div>
                    <span className="text-gray-300 text-xs block mb-1">Monthly Return (50%)</span>
                    <span className="text-base font-extrabold text-white font-mono">+${(investAmount * 0.50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-base shadow-xl shadow-violet-500/40 transition-all">Confirm Super DC Investment</button>
            </div>
          </section>
        )}

        {/* 3. CUSTOMER DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <section className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white">
                  {userFirstName ? `Welcome, ${userFirstName}!` : 'Customer Dashboard'}
                </h2>
                <p className="text-sm text-gray-300 mt-1">Manage your deposits, earnings, referral wallet, and active positions.</p>
              </div>
              <span className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">
                🟢 Live Sync Active ({userFirstName || userName || userEmail || 'Active User'})
              </span>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-violet-950/30 to-slate-900 border border-violet-500/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest block mb-2">💰 TOTAL BALANCE</span>
                <h1 className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono">
                  ${(totalBalanceCents / 100).toFixed(2)}
                </h1>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={() => setActiveTab('plans')} className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-xl shadow-violet-500/30 transition-all">
                  + Deposit
                </button>
                <button onClick={() => setActiveTab('plans')} className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 font-bold text-sm border border-cyan-400/25 transition-all">
                  Invest
                </button>
                <button
                  onClick={() => setWithdrawalModalOpen(true)}
                  className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all"
                >
                  ↑ Withdraw
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Deposit Wallet</span>
                <h3 className="text-2xl font-black text-white font-mono">$0.00</h3>
              </div>
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Earning Wallet</span>
                <h3 className="text-2xl font-black text-cyan-400 font-mono">$0.0000</h3>
              </div>
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Referral Wallet</span>
                <h3 className="text-2xl font-black text-white font-mono">$0.00</h3>
              </div>
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Rewards Wallet</span>
                <h3 className="text-2xl font-black text-white font-mono">$0.00</h3>
              </div>
            </div>
          </section>
        )}

        {/* 4. FAQ TAB */}
        {activeTab === 'contact' && (
          <section className="max-w-4xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-violet-500/30">
                  ❓
                </div>
                <div>
                  <span className="text-violet-400 text-xs font-bold uppercase tracking-widest">HELP & SUPPORT</span>
                  <h2 className="text-3xl font-black text-white tracking-tight mt-0.5">Frequently Asked Questions</h2>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-black/50 border border-violet-500/20 rounded-2xl p-6">
                  <h4 className="text-base font-bold text-white mb-2">How does the Super DC daily micro-yield work?</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">Our high-precision protocol automatically compounds daily capital growth, providing approximately 50% monthly returns calculated with 26-decimal sub-second precision.</p>
                </div>
                <div className="bg-black/50 border border-violet-500/20 rounded-2xl p-6">
                  <h4 className="text-base font-bold text-white mb-2">What is the minimum and maximum investment?</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">The minimum investment amount is $50 USD, and the maximum cap per Super DC plan position is $10,000 USD.</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-cyan-950/40 border border-violet-500/30 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-violet-400 tracking-widest uppercase block mb-1">🏛️ REGISTERED CORPORATE HEADQUARTERS</span>
                  <h4 className="text-base font-bold text-white">Dollar Craft Pte Ltd</h4>
                  <p className="text-xs text-gray-300 mt-0.5">70 Bendemeer Road, #03-07, Luzerne, Singapore 339940</p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">
                  VERIFIED HQ
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 5. BRAND NEW REFRESHED ADMIN PANEL TAB (dollarcraft3@gmail.com ONLY) */}
        {activeTab === 'admin' && userEmail === 'dollarcraft3@gmail.com' && (
          <section className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60 p-8 rounded-3xl border border-violet-500/30 shadow-2xl">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-extrabold uppercase">SUPER ADMIN SECURE</span>
                  <span className="text-sm text-gray-400 font-mono">({userEmail})</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Admin Control Center v2.0 (Manual Auth)</h2>
                <p className="text-gray-300 text-sm mt-1">Manual Sign-In tracking and live user history active.</p>
              </div>
              
              <div className="flex flex-wrap gap-2 bg-black/60 p-2 rounded-2xl border border-violet-500/30">
                <button onClick={() => setAdminSubTab('dashboard')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'dashboard' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}>📊 Dashboard</button>
                <button onClick={() => setAdminSubTab('users')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'users' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}>👥 Users History</button>
                <button onClick={() => setAdminSubTab('finance')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'finance' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}>💳 Finance & Payouts</button>
                <button onClick={() => setAdminSubTab('settings')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${adminSubTab === 'settings' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}>⚙️ Settings</button>
              </div>
            </div>

            {/* ADMIN SUB-TAB 1: DASHBOARD OVERVIEW */}
            {adminSubTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">TODAY'S USERS / VISITS</span>
                    <h3 className="text-4xl font-black text-white font-mono">{totalVisitsToday}</h3>
                    <span className="text-xs text-emerald-400 font-semibold mt-2 block">✓ Fresh tracking active</span>
                  </div>
                  <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">ACTIVE VAULT CAPITAL</span>
                    <h3 className="text-4xl font-black text-cyan-400 font-mono">${activeVaultCapital.toFixed(2)}</h3>
                    <span className="text-xs text-cyan-300 font-semibold mt-2 block">⚡ Zeroed & Fresh</span>
                  </div>
                  <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">PENDING WITHDRAWALS</span>
                    <h3 className="text-4xl font-black text-amber-400 font-mono">0 Requests</h3>
                    <span className="text-xs text-amber-300 font-semibold mt-2 block">✓ Cleared & Fresh</span>
                  </div>
                  <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-6 shadow-xl">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">DAILY ROI PAYOUT POOL</span>
                    <h3 className="text-4xl font-black text-teal-400 font-mono">${dailyRoiPool.toFixed(2)}</h3>
                    <span className="text-xs text-teal-300 font-semibold mt-2 block">✓ Zeroed & Fresh</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-3">📈 Protocol Performance & Yield Inflow</h3>
                    <div className="h-56 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center p-6">
                      <div className="w-full space-y-4">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Super DC Vault Liquidity</span>
                          <span className="text-cyan-400 font-bold">0.0% (Zeroed & Fresh)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full w-[0%]"></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-300 pt-3">
                          <span>Global Hub Sync Speed</span>
                          <span className="text-emerald-400 font-bold">0.012ms (Optimal)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full w-[100%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white mb-3">⚡ Quick Admin Actions</h3>
                      <p className="text-gray-400 text-sm mb-6">Manage customer balances and platform metrics.</p>
                    </div>
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => document.getElementById('internal-transfer-card')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-violet-500/30 transition-all"
                      >
                        ↔️ Internal Transfer
                      </button>
                      <button onClick={() => { setTotalVisitsToday(0); setActiveVaultCapital(0); setDailyRoiPool(0); alert('All admin metrics & history reset successfully!'); }} className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow transition-all">
                        Reset All Metrics to 0
                      </button>
                      <button onClick={() => alert('Cache cleared & global nodes synced!')} className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all">
                        Flush Server Cache
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  id="internal-transfer-card"
                  className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl space-y-6 max-w-3xl"
                >
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-3">↔️ Internal Transfer</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Credit funds directly to a registered user. No maximum transfer amount.
                    </p>
                  </div>
                  <form onSubmit={handleInternalTransferSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="internal-transfer-email" className="block text-sm font-semibold text-gray-200 mb-2">
                        User email
                      </label>
                      <select
                        id="internal-transfer-email"
                        required
                        disabled={usersList.length === 0}
                        value={internalTransferEmail}
                        onChange={(e) => {
                          setInternalTransferEmail(e.target.value);
                          setInternalTransferError('');
                          setInternalTransferSuccess('');
                        }}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      >
                        <option value="" disabled>
                          {usersList.length === 0 ? 'No registered users available' : 'Select a registered user'}
                        </option>
                        {usersList.map((user) => (
                          <option key={user.email} value={user.email}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="internal-transfer-amount" className="block text-sm font-semibold text-gray-200 mb-2">
                        Transfer amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          id="internal-transfer-amount"
                          type="number"
                          inputMode="decimal"
                          min="0.01"
                          step="0.01"
                          required
                          value={internalTransferAmount}
                          onChange={(e) => {
                            setInternalTransferAmount(e.target.value);
                            setInternalTransferError('');
                            setInternalTransferSuccess('');
                          }}
                          className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-violet-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {internalTransferError && (
                      <p role="alert" className="text-rose-300 text-sm">{internalTransferError}</p>
                    )}
                    {internalTransferSuccess && (
                      <p role="status" className="text-emerald-300 text-sm">{internalTransferSuccess}</p>
                    )}
                    <button
                      type="submit"
                      disabled={usersList.length === 0}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm transition-all disabled:opacity-50"
                    >
                      Transfer funds
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ADMIN SUB-TAB 2: USERS MANAGEMENT & HISTORY */}
            {adminSubTab === 'users' && (
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Registered Users & Wallets</h3>
                    <p className="text-gray-400 text-sm mt-0.5">Account sign-in times and current total wallet balances.</p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-sm font-bold">{usersList.length} Registered Users</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="py-4 px-5">Name</th>
                        <th className="py-4 px-5">Email Address</th>
                        <th className="py-4 px-5">Sign-in Time</th>
                        <th className="py-4 px-5">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-gray-400">
                            No registered users yet.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((user) => (
                          <tr key={user.email} className="hover:bg-white/5 transition-all">
                            <td className="py-4 px-5 font-bold text-white">{user.name}</td>
                            <td className="py-4 px-5 text-gray-300 font-mono">{user.email}</td>
                            <td className="py-4 px-5 text-cyan-400 font-mono">
                              {Number.isFinite(user.lastSignInAt)
                                ? new Date(user.lastSignInAt).toLocaleString()
                                : 'No recorded sign-in'}
                            </td>
                            <td className="py-4 px-5 text-cyan-400 font-mono font-bold">
                              ${(user.balanceCents / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADMIN SUB-TAB 3: FINANCE */}
            {adminSubTab === 'finance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl space-y-6">
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-3">💳 Withdrawal Approvals</h3>
                  <p className="text-gray-400 text-sm">Review pending user withdrawal tickets and release USDT/USD funds.</p>
                  
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center text-gray-400 text-sm">
                    No pending withdrawal requests. All ledgers are clean ($0.00).
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl space-y-6">
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-3">📊 Financial Ledger Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-gray-300">Total Platform Deposits:</span>
                      <span className="font-bold text-white font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-gray-300">Total Payouts Released:</span>
                      <span className="font-bold text-cyan-400 font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-gray-300">Net Reserve Capital:</span>
                      <span className="font-bold text-emerald-400 font-mono">$0.00</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ADMIN SUB-TAB 4: SETTINGS */}
            {adminSubTab === 'settings' && (
              <div className="bg-slate-900/90 border border-violet-500/20 rounded-3xl p-8 shadow-2xl space-y-8 max-w-3xl">
                <div>
                  <h3 className="text-lg font-extrabold text-white">⚙️ Protocol Configuration Settings</h3>
                  <p className="text-gray-400 text-sm mt-0.5">Adjust global platform fees, daily compounding ROI rates, and security rules.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Default Platform Fee (%)</label>
                    <input 
                      type="text" 
                      value={platformFee} 
                      onChange={(e) => setPlatformFee(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-violet-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Base Monthly ROI Rate (%)</label>
                    <input 
                      type="text" 
                      value={roiRate} 
                      onChange={(e) => setRoiRate(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-violet-500" 
                    />
                  </div>

                  <button onClick={() => alert('Settings updated successfully!')} className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-xl shadow-violet-500/30 transition-all">
                    Save Protocol Changes
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      {logoutConfirmationOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirmation-title"
            aria-describedby="logout-confirmation-description"
            className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-[#0c1329] to-black border border-rose-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-200 flex items-center justify-center mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5m0 0-5-5m5 5H3" />
              </svg>
            </div>
            <h2 id="logout-confirmation-title" className="text-xl font-black">Confirm logout</h2>
            <p id="logout-confirmation-description" className="text-sm text-gray-300 mt-2">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3 mt-7">
              <button
                type="button"
                onClick={() => setLogoutConfirmationOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-rose-900/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                Yes
              </button>
            </div>
          </section>
        </div>
      )}

      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 animate-in fade-in duration-200">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-modal-title"
            className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0c1329] to-black border border-violet-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative"
          >
            <button
              type="button"
              onClick={closeWithdrawalModal}
              aria-label="Close withdrawal dialog"
              className="absolute top-4 right-4 text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">Customer wallet</span>
              <h2 id="withdrawal-modal-title" className="text-2xl font-black mt-1">Request a withdrawal</h2>
              <p className="text-sm text-gray-400 mt-2">Enter the amount you would like to withdraw in USD.</p>
            </div>

            <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Available total balance
              </span>
              <span className="mt-1 block font-mono text-xl font-bold text-cyan-300">
                ${(totalBalanceCents / 100).toFixed(2)} USD
              </span>
            </div>

            {withdrawalSuccess ? (
              <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="font-bold text-emerald-300">Withdrawal request submitted successfully.</p>
                <p className="text-sm text-gray-300 mt-1">
                  Requested amount: ${Number(withdrawalAmount).toFixed(2)} USD
                </p>
                <button
                  type="button"
                  onClick={closeWithdrawalModal}
                  className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div>
                  <label htmlFor="withdrawal-amount" className="block text-sm font-semibold text-gray-200 mb-2">
                    Withdrawal amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      id="withdrawal-amount"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      required
                      autoFocus
                      value={withdrawalAmount}
                      onChange={(e) => {
                        setWithdrawalAmount(e.target.value);
                        setWithdrawalError('');
                      }}
                      aria-invalid={Boolean(withdrawalError)}
                      aria-describedby={withdrawalError ? 'withdrawal-amount-error' : 'withdrawal-amount-help'}
                      className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-violet-500"
                      placeholder="10.00"
                    />
                  </div>
                  {withdrawalError ? (
                    <p id="withdrawal-amount-error" role="alert" className="text-rose-300 text-xs mt-2">
                      {withdrawalError}
                    </p>
                  ) : (
                    <p id="withdrawal-amount-help" className="text-gray-400 text-xs mt-2">
                      Minimum withdrawal: $10 USD. No maximum limit.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg transition-all"
                >
                  Submit withdrawal request
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      {/* PREMIUM MANUAL AUTHENTICATION MODAL (First Name, Last Name, Email, Password) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0c1329] to-black border border-violet-500/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative">
            
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
              ✕
            </button>

            <div className="text-center mb-4 pt-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-lg shadow-xl shadow-violet-500/30 text-white mx-auto mb-2">
                DC
              </div>
              <h3 className="text-xl font-black text-white">
                {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {authMode === 'register' ? 'Register with your details to start earning.' : 'Sign in to access your Dollar Craft account.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 mb-4">
              <button 
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'register' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Register
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Alexander"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={authMode === 'register'}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={authMode === 'register'}
                      className="w-full bg-black/70 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="alexander.smith@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full bg-black/70 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full bg-black/70 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-xs shadow-xl transition-all disabled:opacity-50 mt-1"
              >
                {isLoading ? 'Processing...' : (authMode === 'register' ? 'Create Account & Sign In' : 'Sign In')}
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-4">
              Secure manual authentication protocol enabled.
            </p>

          </div>
        </div>
      )}

      {/* FIXED BOTTOM-RIGHT HELP CENTER WITH PRO ARY STYLE 3D TUMBLING LOGO */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex flex-col items-end">
        {chatOpen && (
          <div className="mb-3 w-[320px] h-[400px] bg-gradient-to-b from-slate-900 via-[#0c1329] to-black backdrop-blur-3xl border border-violet-500/40 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white relative">
            
            {/* Header: Help Center */}
            <div className="bg-gradient-to-r from-violet-900/60 via-slate-900 to-cyan-950/60 px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center font-black text-black shadow-md text-xs">
                  AI
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-violet-300">Help Center</h4>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-xs transition-all">
                ✕
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/50 text-xs">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold rounded-br-none shadow' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/10'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Smooth Loading Spinner */}
              {isLoading && (
                <div className="flex justify-start items-center gap-1.5 py-1">
                  <div className="bg-white/10 border border-white/10 rounded-2xl px-3 py-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-xs text-violet-300">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Full Language Names Buttons */}
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[10px] text-violet-400 font-bold text-center block uppercase tracking-wider">
                  {selectedLanguage ? 'Language:' : 'Select Language:'}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => handleSelectLanguage('English')} disabled={isLoading} className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'English' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    English
                  </button>
                  <button onClick={() => handleSelectLanguage('Urdu')} disabled={isLoading} className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'Urdu' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    اردو
                  </button>
                  <button onClick={() => handleSelectLanguage('Spanish')} disabled={isLoading} className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${selectedLanguage === 'Spanish' ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-950/40 text-violet-300 border-violet-500/30 hover:bg-violet-900/60'}`}>
                    Español
                  </button>
                </div>
              </div>

              {/* Issue Options */}
              {selectedLanguage && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => handleSelectIssue('slip')} disabled={isLoading} className="py-2 px-3 rounded-xl bg-violet-500/20 hover:bg-violet-500 hover:text-white border border-violet-500/40 text-violet-300 font-bold text-xs text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>📄 Transaction Slip</span>
                      <span>→</span>
                    </button>
                    <button onClick={() => handleSelectIssue('problem')} disabled={isLoading} className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-500/40 text-cyan-300 font-bold text-xs text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>⚠️ Facing Problem</span>
                      <span>→</span>
                    </button>
                    <button onClick={() => handleSelectIssue('blocked')} disabled={isLoading} className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-400 hover:text-black border border-amber-500/40 text-amber-300 font-bold text-xs text-left transition-all flex items-center justify-between disabled:opacity-50">
                      <span>🔒 Account Blocked</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Input & Attachment Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-white/10 space-y-2">
              {attachedFile && (
                <div className="flex justify-between items-center bg-white/5 px-3 py-1 rounded-xl text-xs border border-white/10">
                  <span className="truncate text-violet-300">📎 {attachedFile.name}</span>
                  <button type="button" onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-400">✕</button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 text-sm transition-all" title="Attach">
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
                  className="flex-1 bg-black/70 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                />

                <button 
                  type="submit" 
                  disabled={!selectedLanguage || isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-black text-xs shadow transition-all disabled:opacity-50"
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
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.9)] transform hover:scale-110 transition-all duration-300 active:scale-95 border-2 border-white/70 animate-ary-3d cursor-pointer"
          title="Open Help Center"
        >
          {/* Professional Headset Support Icon */}
          <svg className="w-8 h-8 text-white fill-current drop-shadow-xl" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.08L2.25 20.75c-.32.32.09.73.41.41l3.67-1.12C7.91 20.89 9.89 21.5 12 21.5c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17.5c-1.84 0-3.52-.57-4.92-1.54l-.27-.19-2.28.7.7-2.28-.19-.27C4.07 14.72 3.5 13.04 3.5 11.2c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5-3.81 8.5-8.5 8.5zm4.25-6.75c-.41 0-.75-.34-.75-.75 0-1.24-1.01-2.25-2.25-2.25-.41 0-.75-.34-.75-.75s.34-.75.75-7.5c2.07 0 3.75 1.68 3.75 3.75 0 .41-.34.75-.75.75z"/>
          </svg>
        </button>
      </div>

    </div>
  );
}