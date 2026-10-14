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

const globalHubs = [
  { name: 'USA', code: 'us' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
  { name: 'UK', code: 'gb' },
  { name: 'UAE', code: 'ae' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Europe', code: 'eu' }
];

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
  const [authMode, setAuthMode] = useState('register');
  const [authError, setAuthError] = useState('');
  const [usersList, setUsersList] = useState([]);
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
  const todayRegisteredUsers = usersList.filter((u) => {
    const signupDate = new Date(u.createdAt);
    return signupDate.getFullYear() === today.getFullYear() &&
      signupDate.getMonth() === today.getMonth() &&
      signupDate.getDate() === today.getDate();
  }).length;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]');
      if (stored.length > 0) setUsersList(stored);
    } catch (e) {}
  }, [isLoggedIn]);

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
    } else {
      setActiveTab(canAccessAdmin ? 'admin' : 'dashboard');
    }
  };

  const handleLogout = async () => {
    try { await logOutUser(); } catch (e) {}
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
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
    const finalEmail = emailInput.trim().toLowerCase();
    const finalPassword = passwordInput;
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (finalEmail === ADMIN_EMAIL && finalPassword === ADMIN_PASSWORD) {
      const adminUser = {
        id: 'admin-007',
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
      setUserEmail(ADMIN_EMAIL);
      setUserName('dollar craft');
      setAuthModalOpen(false);
      setActiveTab('admin');
      return;
    }

    let globalUsers = [];
    try { globalUsers = JSON.parse(localStorage.getItem('dollarcraft_global_users') || '[]'); } catch (e) {}

    const newUserObj = {
      id: 'usr-' + Date.now(),
      email: finalEmail,
      name: `${trimmedFirstName} ${trimmedLastName}`.trim() || finalEmail.split('@')[0],
      firstName: trimmedFirstName || finalEmail.split('@')[0],
      lastName: trimmedLastName || '',
      createdAt: new Date().toISOString(),
      balanceCents: 0
    };

    const updated = [...globalUsers.filter(u => u.email?.toLowerCase() !== finalEmail), newUserObj];
    localStorage.setItem('dollarcraft_global_users', JSON.stringify(updated));
    setUsersList(updated);

    setIsLoggedIn(true);
    setUser(newUserObj);
    setUserUid(newUserObj.id);
    setUserEmail(newUserObj.email);
    setUserName(newUserObj.name);
    setUserFirstName(newUserObj.firstName);
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleInternalTransferSubmit = (e) => {
    e.preventDefault();
    const recipientEmail = internalTransferEmail.trim().toLowerCase();
    const amountCents = Math.round(Number(internalTransferAmount) * 100);

    const recipient = usersList.find(u => u.email?.toLowerCase() === recipientEmail);
    if (!recipient) {
      setInternalTransferError('No user found with this email');
      return;
    }

    const updatedUsers = usersList.map(u => u.email?.toLowerCase() === recipientEmail ? { ...u, balanceCents: (u.balanceCents || 0) + amountCents } : u);
    localStorage.setItem('dollarcraft_global_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);
    setInternalTransferSuccess(`$${(amountCents / 100).toFixed(2)} USD transferred successfully!`);
    setInternalTransferCount(c => c + 1);
    setInternalTransferAmount('');
  };

  const [liveProtocolTotal, setLiveProtocolTotal] = useState(getGlobalAccrualTotal);
  useEffect(() => {
    const timer = setInterval(() => setLiveProtocolTotal(getGlobalAccrualTotal()), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090d23] via-[#050814] to-[#03050a] text-white font-sans selection:bg-violet-500 relative overflow-x-hidden">
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
            globalHubs={globalHubs}
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
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
      />

      {logoutConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-gray-300 text-xs mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-4">
              <button onClick={() => setLogoutConfirmationOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-sm">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}