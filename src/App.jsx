import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import FaqView from './components/FaqView';
import DepositModal from './components/DepositModal';
import InvestView from './components/InvestView';
import { getStoredUsers, createAccount, signInWithPassword, logOutUser, changeUserBalance } from './localStore';

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
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

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
  const [currentUserData, setCurrentUserData] = useState(null);

  const [fullName, setFullName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

  const isAdminUser = isLoggedIn && isAdmin;
  const canAccessAdmin = isAdminUser;

  const activeView = isAdminUser
    ? activeTab === 'dashboard' ? 'admin' : activeTab
    : activeTab === 'admin' ? isLoggedIn ? 'dashboard' : 'home' : activeTab;

  const totalBalanceCents = currentUserData?.balanceCents ?? 0;
  
  const today = new Date();
  const todayRegisteredUsers = usersList.filter((u) => {
    if (!u.createdAt || u.id === 'admin-master') return false;
    const signupDate = new Date(u.createdAt);
    return (
      signupDate.getFullYear() === today.getFullYear() &&
      signupDate.getMonth() === today.getMonth() &&
      signupDate.getDate() === today.getDate()
    );
  }).length;

  const syncUsersList = () => {
    try {
      const stored = getStoredUsers();
      setUsersList(stored);
    } catch (e) {
      setUsersList([]);
    }
  };

  useEffect(() => {
    syncUsersList();
    const handleStorageChange = () => syncUsersList();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dollarcraft:local-users-changed', handleStorageChange);
    const interval = setInterval(syncUsersList, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dollarcraft:local-users-changed', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      setIsInitializing(true);
      setAuthModalOpen(true);
      setTimeout(() => setIsInitializing(false), 2000);
    } else {
      setActiveTab(canAccessAdmin ? 'admin' : 'dashboard');
    }
  };

  const handleLogout = async () => {
    try { await logOutUser(); } catch (e) {}
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUserData(null);
    setActiveTab('home');
    setAuthModalOpen(false);
    setLogoutConfirmationOpen(false);
  };

  const handleCustomImageUpload = (imageDataUrl) => {
    if (currentUserData) {
      const updated = { ...currentUserData, profilePic: imageDataUrl };
      setCurrentUserData(updated);
      try {
        const stored = getStoredUsers();
        const idx = stored.findIndex(u => u.id === currentUserData.id);
        if (idx !== -1) {
          stored[idx].profilePic = imageDataUrl;
          localStorage.setItem('dollarcraft_users', JSON.stringify(stored));
        }
      } catch (err) {}
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const finalEmail = emailInput.trim().toLowerCase();
    const finalPassword = passwordInput;
    const trimmedName = fullName.trim();

    if (finalEmail === ADMIN_EMAIL) {
      if (finalPassword === ADMIN_PASSWORD) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setCurrentUserData({
          id: 'admin-master',
          email: ADMIN_EMAIL,
          name: 'Dollar Craft Admin',
          firstName: 'Admin',
          lastName: '',
          balanceCents: 0,
          profilePic: null
        });
        setAuthModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
        syncUsersList();
        setActiveTab('admin');
        return;
      } else {
        setAuthError('Invalid email or password. Please check your credentials.');
        return;
      }
    }

    try {
      if (authMode === 'login') {
        const result = await signInWithPassword(finalEmail, finalPassword);
        setIsLoggedIn(true);
        setIsAdmin(false);
        setCurrentUserData(result.user);
        setAuthModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
        setActiveTab('dashboard');
        syncUsersList();
      } else {
        const nameParts = trimmedName.split(/\s+/);
        const firstName = nameParts[0] || finalEmail.split('@')[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const result = await createAccount(finalEmail, finalPassword, { firstName, lastName });
        setIsLoggedIn(true);
        setIsAdmin(false);
        setCurrentUserData(result.user);
        setAuthModalOpen(false);
        setEmailInput('');
        setPasswordInput('');
        setActiveTab('dashboard');
        syncUsersList();
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleInternalTransferSubmit = async (e) => {
    e.preventDefault();
    setInternalTransferError('');
    setInternalTransferSuccess('');

    const recipientEmail = internalTransferEmail.trim().toLowerCase();
    const amountCents = Math.round(Number(internalTransferAmount) * 100);

    const targetAccount = usersList.find(u => u.email?.toLowerCase() === recipientEmail && u.id !== 'admin-master');
    if (!targetAccount) {
      setInternalTransferError('No registered user found with this email.');
      return;
    }

    try {
      await changeUserBalance(targetAccount.id, amountCents);
      syncUsersList();
      setInternalTransferSuccess(`Successfully transferred $${(amountCents / 100).toFixed(2)} USD to ${recipientEmail}`);
      setInternalTransferCount(c => c + 1);
      setInternalTransferAmount('');
    } catch (err) {
      setInternalTransferError(err.message || 'Transfer failed.');
    }
  };

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(getGlobalAccrualTotal);
  useEffect(() => {
    const timer = setInterval(() => setLiveProtocolTotal(getGlobalAccrualTotal()), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090d23] via-[#050814] to-[#03050a] text-white font-sans selection:bg-amber-500 relative overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeView={activeView}
        isLoggedIn={isLoggedIn}
        isAdminUser={isAdminUser}
        canAccessAdmin={canAccessAdmin}
        handleGetStartedClick={handleGetStartedClick}
        onOpenDepositModal={() => setIsDepositModalOpen(true)}
        requestLogout={() => setLogoutConfirmationOpen(true)}
        currentUserData={currentUserData}
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
            userName={currentUserData?.name || 'Investor'}
            userFirstName={currentUserData?.firstName || 'Investor'}
            totalBalanceCents={totalBalanceCents}
            setWithdrawalModalOpen={setWithdrawalModalOpen}
            currentUserData={currentUserData}
            onImageUpload={handleCustomImageUpload}
          />
        )}

        {activeView === 'invest' && (
          <InvestView
            onOpenDepositModal={() => setIsDepositModalOpen(true)}
            isLoggedIn={isLoggedIn}
            handleGetStartedClick={handleGetStartedClick}
          />
        )}

        {activeView === 'faq' && <FaqView />}

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

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
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