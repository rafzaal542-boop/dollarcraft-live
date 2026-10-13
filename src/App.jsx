import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  changeUserBalance,
  createAccount,
  getCurrentSession,
  logOutUser,
  observeAllUserProfiles,
  observeUserProfile,
  signInWithPassword
} from './localStore';

const GLOBAL_ACCRUAL_BASE = 1_068_566_700;
const GLOBAL_ACCRUAL_STARTED_AT = Date.parse('2026-10-08T06:39:27.411Z');
const GLOBAL_ACCRUAL_PER_SECOND = 2000 / 3600;
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const ADMIN_PASSWORD = 'haseeb@craft@007';

const hasAdminCredentials = (email, verifiedAdmin) =>
  verifiedAdmin === true ||
  email?.trim().toLowerCase() === ADMIN_EMAIL;

const getGlobalAccrualTotal = (now = Date.now()) =>
  GLOBAL_ACCRUAL_BASE +
  (Math.max(0, now - GLOBAL_ACCRUAL_STARTED_AT) / 1000) *
    GLOBAL_ACCRUAL_PER_SECOND;

const getSignupDate = (createdAt) => {
  const date =
    typeof createdAt?.toDate === 'function'
      ? createdAt.toDate()
      : typeof createdAt === 'number'
        ? new Date(createdAt)
        : typeof createdAt === 'string'
          ? new Date(createdAt)
          : null;
  return date && Number.isFinite(date.getTime()) ? date : new Date();
};

const formatSignupTimestamp = (createdAt) => {
  const date = getSignupDate(createdAt);
  return date ? date.toISOString() : new Date().toISOString();
};

const normalizeUserProfile = (data, id) => {
  const nameParts = (data.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    ...data,
    id,
    firstName: data.firstName || nameParts[0] || '',
    lastName: data.lastName || nameParts.slice(1).join(' '),
    balanceCents: Number.isSafeInteger(data.balanceCents) && data.balanceCents >= 0
      ? data.balanceCents
      : 0
  };
};

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authError, setAuthError] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [usersLoadError, setUsersLoadError] = useState('');
  const [userUid, setUserUid] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [user, setUser] = useState(null);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

  const currentUser = usersList.find((u) => u.id === userUid || u.email?.toLowerCase() === userEmail?.toLowerCase());
  const isAdminUser = isLoggedIn && (isAdmin || user?.role === 'admin' || userEmail?.toLowerCase() === ADMIN_EMAIL);
  const canAccessAdmin = isAdminUser;
  const activeView = isAdminUser
    ? activeTab === 'dashboard' ? 'admin' : activeTab
    : activeTab === 'admin' ? isLoggedIn ? 'dashboard' : 'home' : activeTab;
  
  const totalBalanceCents = currentUser?.balanceCents ?? 0;
  const today = new Date();
  const todayRegisteredUsers = usersList.filter((registeredUser) => {
    const signupDate = getSignupDate(registeredUser.createdAt);
    return signupDate &&
      signupDate.getFullYear() === today.getFullYear() &&
      signupDate.getMonth() === today.getMonth() &&
      signupDate.getDate() === today.getDate();
  }).length;

  useEffect(() => {
    let active = true;
    getCurrentSession().then((result) => {
      if (!active || !result?.user) return;
      const { user: sessionUser, isAdmin: adminAccess } = result;
      const authorizedAdmin = hasAdminCredentials(sessionUser.email, adminAccess);
      setIsLoggedIn(true);
      setIsAdmin(authorizedAdmin);
      setUser(authorizedAdmin ? { ...sessionUser, role: 'admin' } : sessionUser);
      setUserUid(sessionUser.id);
      setUserEmail(sessionUser.email);
      setUserName(sessionUser.name || `${sessionUser.firstName || ''} ${sessionUser.lastName || ''}`.trim());
      setUserFirstName(sessionUser.firstName || '');
    }).catch(() => {
      if (active) setUsersLoadError('');
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const loadUsers = () => {
      try {
        const localStoredUsers = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]');
        if (localStoredUsers.length > 0) {
          setUsersList(localStoredUsers.map(u => normalizeUserProfile(u, u.id || u.email)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();
    const unsubscribe = observeAllUserProfiles
      ? observeAllUserProfiles((users) => {
          const combined = [...users];
          try {
            const localStoredUsers = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]');
            localStoredUsers.forEach(lu => {
              if (!combined.some(c => c.email?.toLowerCase() === lu.email?.toLowerCase())) {
                combined.push(lu);
              }
            });
          } catch (e) {}
          setUsersList(combined.map((u) => normalizeUserProfile(u, u.id || u.email)));
        }, () => {})
      : null;

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isLoggedIn]);

  const [internalTransferCount, setInternalTransferCount] = useState(0);
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
  }, [chatOpen, messages]);

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
    } else {
      setActiveTab(canAccessAdmin ? 'admin' : 'dashboard');
    }
  };

  const requestLogout = () => {
    setMobileMenuOpen(false);
    setLogoutConfirmationOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (error) {}

    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setUserUid('');
    setUserEmail('');
    setUserName('');
    setUserFirstName('');
    setActiveTab('home');
    setAdminSubTab('dashboard');
    setMobileMenuOpen(false);
    setAuthModalOpen(false);
    setWithdrawalModalOpen(false);
    setLogoutConfirmationOpen(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const finalEmail = emailInput.trim().toLowerCase();
    const finalPassword = passwordInput;
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!finalEmail || !finalPassword || (authMode === 'register' && (!trimmedFirstName || !trimmedLastName))) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      if (finalEmail === ADMIN_EMAIL && finalPassword === ADMIN_PASSWORD) {
        const adminUser = {
          id: 'admin-uid-007',
          email: ADMIN_EMAIL,
          name: 'dollar craft',
          firstName: 'dollar',
          lastName: 'craft',
          role: 'admin',
          createdAt: new Date().toISOString(),
          balanceCents: 0
        };
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUser(adminUser);
        setUserUid(adminUser.id);
        setUserEmail(adminUser.email);
        setUserName(adminUser.name);
        setUserFirstName(adminUser.firstName);
        setAuthModalOpen(false);
        setActiveTab('admin');
        setPasswordInput('');
        setIsLoading(false);
        return;
      }

      let result;
      try {
        if (authMode === 'register') {
          result = await createAccount(finalEmail, finalPassword, {
            firstName: trimmedFirstName,
            lastName: trimmedLastName
          });
        } else {
          result = await signInWithPassword(finalEmail, finalPassword);
        }
      } catch (apiErr) {
        let globalUsers = [];
        try {
          globalUsers = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]');
        } catch (e) {}

        if (authMode === 'login') {
          const found = globalUsers.find(u => u.email?.toLowerCase() === finalEmail);
          if (found) {
            result = { user: found, isAdmin: false };
          } else {
            const newUserObj = {
              id: 'usr-' + Date.now(),
              email: finalEmail,
              name: finalEmail.split('@')[0],
              firstName: finalEmail.split('@')[0],
              lastName: '',
              createdAt: new Date().toISOString(),
              balanceCents: 0
            };
            globalUsers.push(newUserObj);
            localStorage.setItem('dollarcraft_global_users', JSON.stringify(globalUsers));
            result = { user: newUserObj, isAdmin: false };
          }
        } else {
          const newUserObj = {
            id: 'usr-' + Date.now(),
            email: finalEmail,
            name: `${trimmedFirstName} ${trimmedLastName}`,
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            createdAt: new Date().toISOString(),
            balanceCents: 0
          };
          globalUsers.push(newUserObj);
          localStorage.setItem('dollarcraft_global_users', JSON.stringify(globalUsers));
          result = { user: newUserObj, isAdmin: false };
        }
      }

      const { user: authenticatedUser, isAdmin: adminAccess } = result || {};
      const authorizedAdmin = hasAdminCredentials(authenticatedUser?.email, adminAccess);
      
      setIsLoggedIn(true);
      setIsAdmin(authorizedAdmin);
      setUser(authorizedAdmin ? { ...authenticatedUser, role: 'admin' } : authenticatedUser);
      setUserUid(authenticatedUser.id);
      setUserEmail(authenticatedUser.email);
      setUserName(authenticatedUser.name || `${authenticatedUser.firstName || ''} ${authenticatedUser.lastName || ''}`.trim());
      setUserFirstName(authenticatedUser.firstName || '');
      
      const normalizedNewUser = normalizeUserProfile(authenticatedUser, authenticatedUser.id);
      setUsersList(prev => {
        const updated = [...prev.filter(p => p.email?.toLowerCase() !== normalizedNewUser.email?.toLowerCase()), normalizedNewUser];
        try {
          localStorage.setItem('dollarcraft_global_users', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setAuthModalOpen(false);
      setActiveTab(authorizedAdmin ? 'admin' : 'dashboard');
      setPasswordInput('');
    } catch (error) {
      setAuthError(error.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawalAmount);
    const amountCents = Math.round(amount * 100);

    if (!Number.isFinite(amount) || amount < 10) {
      setWithdrawalError('Minimum withdrawal amount is $10 USD');
      setWithdrawalSuccess(false);
      return;
    }

    try {
      const updatedUser = await changeUserBalance(currentUser.id, -amountCents).catch(() => ({
        ...currentUser,
        balanceCents: (currentUser.balanceCents || 0) - amountCents
      }));
      setUsersList((users) => users.map((u) =>
        u.id === updatedUser.id ? normalizeUserProfile(updatedUser, updatedUser.id) : u
      ));
    } catch (error) {
      setWithdrawalError('Unable to update your balance.');
      setWithdrawalSuccess(false);
      return;
    }

    setWithdrawalError('');
    setWithdrawalSuccess(true);
  };

  const handleInternalTransferSubmit = async (e) => {
    e.preventDefault();
    setInternalTransferError('');
    setInternalTransferSuccess('');

    if (!canAccessAdmin) {
      setInternalTransferError('Only administrator can perform transfers.');
      return;
    }

    const recipientEmail = internalTransferEmail.trim().toLowerCase();
    const amount = Number(internalTransferAmount);
    const amountCents = Math.round(amount * 100);
    const recipient = usersList.find((u) => u.email?.toLowerCase() === recipientEmail);

    if (!recipient) {
      setInternalTransferError('No registered user found with that email address.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setInternalTransferError('Enter a valid transfer amount.');
      return;
    }

    try {
      const updatedUser = await changeUserBalance(recipient.id, amountCents).catch(() => ({
        ...recipient,
        balanceCents: (recipient.balanceCents || 0) + amountCents
      }));
      setUsersList((users) => users.map((u) =>
        u.id === updatedUser.id ? normalizeUserProfile(updatedUser, updatedUser.id) : u
      ));
    } catch (error) {
      setInternalTransferError('Unable to save transfer.');
      return;
    }

    setInternalTransferSuccess(`$${(amountCents / 100).toFixed(2)} USD transferred to ${recipient.email}.`);
    setInternalTransferCount((count) => count + 1);
    setInternalTransferAmount('');
  };

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(getGlobalAccrualTotal);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveProtocolTotal(getGlobalAccrualTotal());
    }, 100);
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
      {/* Background Glows */}
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
              <button onClick={() => setActiveTab('home')} className={`transition-colors py-1 ${activeView === 'home' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Home</button>
              {isLoggedIn && (
                <>
                  {!canAccessAdmin && (
                    <button onClick={() => setActiveTab('dashboard')} className={`transition-colors py-1 ${activeView === 'dashboard' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Dashboard</button>
                  )}
                  <button onClick={() => setActiveTab('plans')} className={`transition-colors py-1 ${activeView === 'plans' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>Invest</button>
                </>
              )}
              <button onClick={() => setActiveTab('contact')} className={`transition-colors py-1 ${activeView === 'contact' ? 'text-violet-400 font-bold' : 'hover:text-violet-300'}`}>FAQ</button>
              
              {isAdminUser && (
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-violet-300 font-bold hover:bg-white/10 transition-all ${activeView === 'admin' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent shadow' : ''}`}>Admin Panel</button>
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-400/30 font-bold text-sm transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={handleGetStartedClick} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-violet-500/30 transition-all">
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="py-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeView === 'home' && (
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
              <div className="bg-gradient-to-r from-slate-900/90 via-violet-950/40 to-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl text-center backdrop-blur-xl">
                <span className="text-xs font-extrabold text-violet-400 uppercase tracking-widest block mb-2">
                  🟢 SIMULATED GLOBAL ACCRUAL TICKER
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono tracking-tight">
                  ${liveProtocolTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm text-gray-300 mt-2">Illustrative ticker calculated from a shared timestamp.</p>
              </div>
            </section>

            <section className="max-w-6xl mx-auto">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-base sm:text-lg font-bold text-white">🏛 REGISTERED & OPERATING GLOBAL HUBS</h3>
                  <span className="px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">7 ACTIVE HUBS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {globalHubs.map((hub, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center flex flex-col items-center">
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

        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && isLoggedIn && !canAccessAdmin && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="bg-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">Welcome, {userName || userFirstName || 'Investor'}!</h2>
              <p className="text-gray-300 text-sm">Manage your deposits, earnings, and active positions.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
                  <span className="text-xs text-gray-400 block mb-1">TOTAL BALANCE</span>
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
              <div className="mt-6 flex flex-wrap gap-4">
                <button onClick={() => setWithdrawalModalOpen(true)} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm">
                  Withdraw Funds
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PANEL VIEW */}
        {activeView === 'admin' && canAccessAdmin && (
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
                      <span className="text-xs text-gray-400 block mt-2">All registered accounts</span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                      <span className="text-xs text-violet-400 font-bold block mb-1">REGISTERED TODAY</span>
                      <span className="text-4xl font-black text-white">{todayRegisteredUsers}</span>
                      <span className="text-xs text-gray-400 block mt-2">New signups today</span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                      <span className="text-xs text-violet-400 font-bold block mb-1">SUCCESSFUL TRANSFERS</span>
                      <span className="text-4xl font-black text-white">{internalTransferCount}</span>
                      <span className="text-xs text-gray-400 block mt-2">This session</span>
                    </div>
                  </div>

                  {/* Internal Transfer Section */}
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">⚡ Internal Transfer</h3>
                    <p className="text-xs text-gray-300 mb-6">Credit funds directly to any registered user by typing their email address.</p>
                    
                    <form onSubmit={handleInternalTransferSubmit} className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">User Email Address</label>
                        <input
                          type="email"
                          required
                          value={internalTransferEmail}
                          onChange={(e) => setInternalTransferEmail(e.target.value)}
                          placeholder="Enter user email (e.g. user@gmail.com)"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
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
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      {internalTransferError && <p className="text-xs text-rose-400">{internalTransferError}</p>}
                      {internalTransferSuccess && <p className="text-xs text-teal-400">{internalTransferSuccess}</p>}
                      <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm shadow-lg">
                        Transfer Funds
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {adminSubTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Registered Users & Wallets</h3>
                    <span className="px-3 py-1 bg-violet-600/20 text-violet-300 rounded-full text-xs font-bold">{usersList.length} Registered Users</span>
                  </div>
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
                        {usersList.length > 0 ? (
                          usersList.map((u, idx) => (
                            <tr key={u.id || idx} className="hover:bg-white/5 text-sm">
                              <td className="py-4 px-4 font-semibold text-white">{u.firstName || '-'}</td>
                              <td className="py-4 px-4 text-gray-300">{u.lastName || '-'}</td>
                              <td className="py-4 px-4 text-violet-300">{u.email}</td>
                              <td className="py-4 px-4 text-gray-400 font-mono text-xs">{formatSignupTimestamp(u.createdAt)}</td>
                              <td className="py-4 px-4 font-mono text-cyan-400">${((u.balanceCents || 0) / 100).toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400">No registered users found yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubTab === 'finance' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Finance & Payouts Management</h3>
                  <p className="text-gray-300 text-sm">Manage global transaction gateways and withdrawal requests.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'contact' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-900/90 border border-violet-500/30 rounded-3xl p-8 shadow-2xl text-center">
              <h2 className="text-3xl font-black text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-300 text-sm">Find answers to common questions about accounts, deposits, and yields.</p>
            </div>
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {authModalOpen && (
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

              <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg hover:opacity-90 transition-all">
                {isLoading ? 'Processing...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setWithdrawalModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">✕</button>
            <h3 className="text-2xl font-black text-white mb-2">Request Withdrawal</h3>
            <p className="text-gray-400 text-xs mb-6">Minimum withdrawal is $10 USD.</p>
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              {withdrawalError && <p className="text-xs text-rose-400">{withdrawalError}</p>}
              {withdrawalSuccess && <p className="text-xs text-teal-400">Withdrawal request submitted successfully!</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-sm">
                Confirm Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-gray-300 text-xs mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4">
              <button onClick={() => setLogoutConfirmationOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}