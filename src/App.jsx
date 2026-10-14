import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import FaqView from './components/FaqView';
import { logOutUser } from './localStore';

const GLOBAL_ACCRUAL_BASE = 1_068_566_700;
const GLOBAL_ACCRUAL_STARTED_AT = Date.parse('2026-10-08T06:39:27.411Z');
const GLOBAL_ACCRUAL_PER_SECOND = 2000 / 3600;

const ADMIN_EMAIL = 'dollarcraft3@gmail.com';
const ADMIN_PASSWORD = 'haseeb@craft@007';

const getGlobalAccrualTotal = (now = Date.now()) =>
  GLOBAL_ACCRUAL_BASE +
  (Math.max(0, now - GLOBAL_ACCRUAL_STARTED_AT) / 1000) * GLOBAL_ACCRUAL_PER_SECOND;

const formatSignupTimestamp = (createdAt) => {
  const date = typeof createdAt === 'string' || typeof createdAt === 'number' ? new Date(createdAt) : new Date();
  return date.toISOString();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

  const [internalTransferEmail, setInternalTransferEmail] = useState('');
  const [internalTransferAmount, setInternalTransferAmount] = useState('');
  const [internalTransferError, setInternalTransferError] = useState('');
  const [internalTransferSuccess, setInternalTransferSuccess] = useState('');
  const [internalTransferCount, setInternalTransferCount] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authError, setAuthError] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [userUid, setUserUid] = useState('');

  const [fullName, setFullName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

  const isAdminUser = isLoggedIn && isAdmin && userEmail.toLowerCase() === ADMIN_EMAIL;
  const canAccessAdmin = isAdminUser;

  const activeView = isAdminUser
    ? activeTab === 'dashboard' ? 'admin' : activeTab
    : activeTab === 'admin' ? isLoggedIn ? 'dashboard' : 'home' : activeTab;

  const currentUser = usersList.find((u) => u.id === userUid || u.email?.toLowerCase() === userEmail?.toLowerCase());
  const totalBalanceCents = currentUser?.balanceCents ?? 0;
  const today = new Date();
  const todayRegisteredUsers = usersList.filter((u) => {
    const signupDate = new Date(u.createdAt);
    return signupDate.getFullYear() === today.getFullYear() &&
      signupDate.getMonth() === today.getMonth() &&
      signupDate.getDate() === today.getDate();
  }).length;

  // ⚡ LIVE REAL-TIME SYNC: Har 2 seconds par storage check karke new signups immediately fetch karta hai
  useEffect(() => {
    const syncUsers = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]');
        setUsersList(stored);
      } catch (e) {}
    };

    syncUsers(); // Initial load
    const interval = setInterval(syncUsers, 2000); // 2 second live polling loop

    return () => clearInterval(interval);
  }, []);

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      setIsInitializing(true);
      setAuthModalOpen(true);
      setTimeout(() => {
        setIsInitializing(false);
      }, 2000);
    } else {
      setActiveTab(canAccessAdmin ? 'admin' : 'dashboard');
    }
  };

  const handleLogout = async () => {
    try { await logOutUser(); } catch (e) {}
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserUid('');
    setUserEmail('');
    setUserName('');
    setUserFirstName('');
    setActiveTab('home');
    setAuthModalOpen(false);
    setLogoutConfirmationOpen(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const finalEmail = emailInput.trim().toLowerCase();
    const finalPassword = passwordInput;
    const trimmedName = fullName.trim();

    // 1. ADMIN CHECK
    if (finalEmail === ADMIN_EMAIL) {
      if (finalPassword === ADMIN_PASSWORD) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUserEmail(ADMIN_EMAIL);
        setUserName('Dollar Craft Admin');
        setUserFirstName('Admin');
        setAuthModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
        setActiveTab('admin');
        return;
      } else {
        setAuthError('Invalid email or password. Please check your credentials.');
        return;
      }
    }

    let globalUsers = [];
    try { 
      globalUsers = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]'); 
    } catch (e) {}

    const existingUser = globalUsers.find(u => u.email?.toLowerCase() === finalEmail);

    // 2. SIGN IN MODE
    if (authMode === 'login') {
      if (!existingUser) {
        setAuthError('Account not found. Please register your account first.');
        return;
      }
      if (existingUser.password && existingUser.password !== finalPassword) {
        setAuthError('Incorrect password. Please try again.');
        return;
      }

      setIsLoggedIn(true);
      setIsAdmin(false);
      setUserUid(existingUser.id);
      setUserEmail(existingUser.email);
      setUserName(existingUser.name);
      setUserFirstName(existingUser.firstName || existingUser.name);
      setAuthModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
      setActiveTab('dashboard');
      return;
    }

    // 3. REGISTER MODE (Instant save to global history)
    if (authMode === 'register') {
      if (existingUser) {
        setAuthError('An account with this email already exists. Please Sign In.');
        return;
      }

      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts[0] || finalEmail.split('@')[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUserObj = {
        id: 'usr-' + Date.now(),
        email: finalEmail,
        password: finalPassword,
        name: trimmedName || finalEmail.split('@')[0],
        firstName: firstName,
        lastName: lastName,
        createdAt: new Date().toISOString(),
        balanceCents: 0
      };

      const updatedUsers = [newUserObj, ...globalUsers]; // Newest user on top
      localStorage.setItem('dollarcraft_global_users', JSON.stringify(updatedUsers));
      setUsersList(updatedUsers);

      setIsLoggedIn(true);
      setIsAdmin(false);
      setUserUid(newUserObj.id);
      setUserEmail(newUserObj.email);
      setUserName(newUserObj.name);
      setUserFirstName(newUserObj.firstName);
      setAuthModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
      setActiveTab('dashboard');
    }
  };

  const handleInternalTransferSubmit = (e) => {
    e.preventDefault();
    setInternalTransferError('');
    setInternalTransferSuccess('');

    const recipientEmail = internalTransferEmail.trim().toLowerCase();
    const amountCents = Math.round(Number(internalTransferAmount) * 100);

    const recipient = usersList.find(u => u.email?.toLowerCase() === recipientEmail);
    if (!recipient) {
      setInternalTransferError('No registered user found with this email.');
      return;
    }

    const updatedUsers = usersList.map(u => 
      u.email?.toLowerCase() === recipientEmail ? { ...u, balanceCents: (u.balanceCents || 0) + amountCents } : u
    );
    localStorage.setItem('dollarcraft_global_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);
    setInternalTransferSuccess(`Successfully transferred $${(amountCents / 100).toFixed(2)} USD to ${recipientEmail}`);
    setInternalTransferCount(c => c + 1);
    setInternalTransferAmount('');
  };

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(getGlobalAccrualTotal);
  useEffect(() => {
    const timer = setInterval(() => setLiveProtocolTotal(getGlobalAccrualTotal()), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090d23] via-[#050814] to-[#03050a] text-white font-sans selection:bg-amber-500 relative overflow-x-hidden">
      <Navbar
        activeView={activeView}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        isAdminUser={isAdminUser}
        canAccessAdmin={canAccessAdmin}
        handleGetStartedClick={handleGetStartedClick}
        requestLogout={() => setLogoutConfirmationOpen(true)}
      />

      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeView === 'home' && (
          <HomeView
            liveProtocolTotal={liveProtocolTotal}
            handleGetStartedClick={handleGetStartedClick}
          />
        )}

        {activeView === 'dashboard' && isLoggedIn && (
          <DashboardView
            userName={userName}
            userFirstName={userFirstName}
            totalBalanceCents={totalBalanceCents}
            setWithdrawalModalOpen={setWithdrawalModalOpen}
          />
        )}

        {activeView === 'contact' && <FaqView />}

        {activeView === 'admin' && canAccessAdmin && (
          <AdminPanel
            usersList={usersList}
            todayRegisteredUsers={todayRegisteredUsers}
            internalTransferCount={internalTransferCount}
            internalTransferEmail={internalTransferEmail}
            setInternalTransferEmail={setInternalTransferEmail}
            internalTransferAmount={internalTransferAmount}
            setInternalTransferAmount={setInternalTransferAmount}
            internalTransferError={internalTransferError}
            internalTransferSuccess={internalTransferSuccess}
            handleInternalTransferSubmit={handleInternalTransferSubmit}
            formatSignupTimestamp={formatSignupTimestamp}
          />
        )}
      </main>

      <AuthModal
        authModalOpen={authModalOpen}
        setAuthModalOpen={setAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        fullName={fullName}
        setFullName={setFullName}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
        isInitializing={isInitializing}
      />

      {logoutConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1026] border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Confirm Logout</h3>
            <p className="text-gray-300 text-xs mb-5">Are you sure you want to sign out of your session?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirmationOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 font-bold text-xs border border-white/10 hover:bg-white/10">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}