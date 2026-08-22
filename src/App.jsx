import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Award, 
  Users, 
  Mail, 
  Zap, 
  Globe, 
  ExternalLink, 
  MessageCircle, 
  Bell, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  Copy, 
  Check, 
  Building, 
  Landmark, 
  X, 
  AlertTriangle, 
  Sliders, 
  CheckCircle, 
  XCircle, 
  Search, 
  Key, 
  Repeat, 
  Cpu,
  User,
  Calendar,
  Shield,
  Plus,
  RotateCcw
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, ensureGoogleUserRecord } from './firebase';

const ADMIN_EMAIL = 'rafzaal542@gmail.com';

const GLOBAL_HUBS = [
  { country: 'USA', code: 'us', reg: 'MSB #310002148291' },
  { country: 'Canada', code: 'ca', reg: 'FINTRAC #M20184712' },
  { country: 'Australia', code: 'au', reg: 'AUSTRAC #100684920' },
  { country: 'UK', code: 'gb', reg: 'FCA Reg #930412' },
  { country: 'UAE', code: 'ae', reg: 'VARA #2024-069' },
  { country: 'Singapore', code: 'sg', reg: 'MAS CMS #101824' },
  { country: 'Europe', code: 'eu', reg: 'MiCA #EU-8821' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  
  // Financial State
  const [userDeposit, setUserDeposit] = useState(0.0000);
  const [userDailyYield, setUserDailyYield] = useState(0.0000);
  const [userTotalProfit240, setUserTotalProfit240] = useState(0.00);
  const [liveProfit, setLiveProfit] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  // Active Plan Attributes
  const [activePlanTier, setActivePlanTier] = useState({
    code: 'NONE',
    name: 'NO ACTIVE PLAN',
    tierName: 'INACTIVE',
    monthlyPct: 0,
    dailyRate: 0,
    monthlyDollars: 0,
    total240Profit: 0,
    color: '#6b7280',
    tagColor: '#374151',
    bgColor: '#111827',
    borderColor: '#374151'
  });

  // User Profile & Unique Credentials State
  const [userRegDate, setUserRegDate] = useState('Fri, Aug 21, 2026');
  const [userAccountId, setUserAccountId] = useState('usr-client-01');
  const [userReferralCode, setUserReferralCode] = useState('DCRAFT-01');
  const [userReferralLink, setUserReferralLink] = useState('https://www.dollarcraft3.com/?ref=DCRAFT-01');

  // Live System Metric High-Frequency Reserves Ticker
  const [globalReserves, setGlobalReserves] = useState(680409811.5626);

  // Admin Central States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('transfer');
  const [allUsersList, setAllUsersList] = useState([]);
  const [allWithdrawalsList, setAllWithdrawalsList] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [withdrawFilter, setWithdrawFilter] = useState('All');

  // Admin Transfer
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Modals
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Deposit Modal States (Only Bank)
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('DC1');

  // Form Fields
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [withdrawInput, setWithdrawInput] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // IB Program
  const [ibCodeInput, setIbCodeInput] = useState('');
  const [generatedIbLink, setGeneratedIbLink] = useState('');

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // DOM Ref for Total Earned Profit Meter (Zero Freeze)
  const profitDisplayRef = useRef(null);
  const accumulatedProfitRef = useRef(0);

  // Automatic Plan Resolver based on Deposit
  const resolvePlanDetails = (deposit) => {
    const dep = parseFloat(deposit) || 0;
    if (dep >= 1001) {
      return {
        code: 'DC3',
        name: 'VIP PLAN (35% MONTHLY)',
        tierName: 'DIAMOND TIER (AUTOMATIC)',
        monthlyPct: 35,
        dailyRate: (dep * 0.35) / 30,
        monthlyDollars: dep * 0.35,
        total240Profit: ((dep * 0.35) / 30) * 240,
        color: '#f0abfc',
        tagColor: '#d946ef',
        bgColor: '#17041f',
        borderColor: '#d946ef'
      };
    } else if (dep >= 501) {
      return {
        code: 'DC2',
        name: 'PREMIUM PLAN (30% MONTHLY)',
        tierName: 'GOLD TIER (AUTOMATIC)',
        monthlyPct: 30,
        dailyRate: (dep * 0.30) / 30,
        monthlyDollars: dep * 0.30,
        total240Profit: ((dep * 0.30) / 30) * 240,
        color: '#facc15',
        tagColor: '#eab308',
        bgColor: '#171203',
        borderColor: '#eab308'
      };
    } else if (dep >= 100) {
      return {
        code: 'DC1',
        name: 'STANDARD PLAN (25% MONTHLY)',
        tierName: 'BRONZE TIER (AUTOMATIC)',
        monthlyPct: 25,
        dailyRate: (dep * 0.25) / 30,
        monthlyDollars: dep * 0.25,
        total240Profit: ((dep * 0.25) / 30) * 240,
        color: '#00e5cc',
        tagColor: '#00c8b3',
        bgColor: '#031714',
        borderColor: '#00c8b3'
      };
    } else {
      return {
        code: 'DC0',
        name: 'STARTER (0% YIELD)',
        tierName: 'AWAITING MIN $100 DEPOSIT',
        monthlyPct: 0,
        dailyRate: 0,
        monthlyDollars: 0,
        total240Profit: 0,
        color: '#9ca3af',
        tagColor: '#6b7280',
        bgColor: '#0b1320',
        borderColor: '#1f2937'
      };
    }
  };

  // Global High-Frequency Accrual Ticker (every 35ms)
  useEffect(() => {
    const baseAmount = 680409811.5626;
    const startTime = Date.now();
    const ratePerMs = 0.0812;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setGlobalReserves(baseAmount + (elapsed * ratePerMs / 1000));
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Keep the admin directory synchronized with Firestore.
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map((userDoc) => {
        const user = userDoc.data();
        return {
          id: userDoc.id,
          email: user.email || userDoc.id,
          name: user.name || '',
          picture: user.picture || '',
          joinedDate: user.joinedDate || '2026-08-22',
          authType: user.authType || 'Google Auth',
          plan: user.plan || 'STANDARD PLAN (25% MONTHLY)',
          principal: `$${user.deposit || 0}`,
          earnedYield: `$${user.earnedYield || 0}`,
          status: (user.status || 'ACTIVE').toUpperCase()
        };
      });

      setAllUsersList(users);
    }, (error) => {
      console.error('Users listener error:', error);
      showToast('Unable to load user accounts from Firestore');
    });

    const rawWithdrawals = localStorage.getItem('dc_master_withdrawals_list');
    if (rawWithdrawals) {
      setAllWithdrawalsList(JSON.parse(rawWithdrawals));
    }

    const savedUser = localStorage.getItem('dc_auth_active_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      saveAuthenticatedGoogleUser(parsed);
      loadUserFinancials(parsed.email);
      generateUserCredentials(parsed);
    }

    const handleStorageChange = (e) => {
      if (e.key === 'dc_master_withdrawals_list' && e.newValue) {
        setAllWithdrawalsList(JSON.parse(e.newValue));
      }
      if (currentUser && e.key === `dc_deposit_${currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`) {
        loadUserFinancials(currentUser.email);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      unsubscribeUsers();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  const generateUserCredentials = (userData) => {
    if (!userData || !userData.email) return;
    const cleanEmail = userData.email.toLowerCase().trim();
    const safeKey = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

    const regDateKey = `dc_reg_date_${safeKey}`;
    let savedDate = localStorage.getItem(regDateKey);
    if (!savedDate) {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      savedDate = new Date().toLocaleDateString('en-US', options);
      localStorage.setItem(regDateKey, savedDate);
    }
    setUserRegDate(savedDate);

    let hash = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      hash = ((hash << 5) - hash) + cleanEmail.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0');
    const accId = `usr-${cleanEmail.split('@')[0].slice(0, 5)}-${absHash}`;
    setUserAccountId(accId);

    const refCode = `DC-${absHash}`;
    setUserReferralCode(refCode);
    setUserReferralLink(`https://www.dollarcraft3.com/?ref=${refCode}`);
  };

  const saveAuthenticatedGoogleUser = (userData) => {
    if (!userData || !userData.email) return;
    const cleanEmail = userData.email.toLowerCase().trim();

    let users = JSON.parse(localStorage.getItem('dc_real_google_users_directory') || '[]');
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    const safeKey = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const depositKey = `dc_deposit_${safeKey}`;
    const userDep = parseFloat(localStorage.getItem(depositKey) || '0.00');

    const plan = resolvePlanDetails(userDep);

    const userObj = {
      email: userData.email,
      name: userData.name || cleanEmail.split('@')[0],
      picture: userData.picture || '',
      joinedDate: existingIndex >= 0 ? users[existingIndex].joinedDate : new Date().toISOString().split('T')[0],
      authType: 'Google Auth',
      deposit: userDep,
      tier: plan.name,
      principal: userDep,
      earnedYield: plan.dailyRate,
      status: 'active'
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userObj };
    } else {
      users = [userObj, ...users];
    }

    localStorage.setItem('dc_real_google_users_directory', JSON.stringify(users));
  };

  const loadUserFinancials = (email) => {
    const safeKey = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const depositKey = `dc_deposit_${safeKey}`;
    const savedDeposit = parseFloat(localStorage.getItem(depositKey) || '0.0000');
    setUserDeposit(savedDeposit);
    
    const plan = resolvePlanDetails(savedDeposit);
    setActivePlanTier(plan);
    setUserDailyYield(plan.dailyRate);
    setUserTotalProfit240(plan.total240Profit);

    const withdrawnKey = `dc_withdrawn_${safeKey}`;
    const savedWithdrawn = parseFloat(localStorage.getItem(withdrawnKey) || '0');
    setWithdrawnAmount(savedWithdrawn);

    const historyKey = `dc_history_${safeKey}`;
    const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setWithdrawHistory(savedHistory);

    const anchorKey = `dc_anchor_time_${safeKey}`;
    let savedAnchor = localStorage.getItem(anchorKey);
    if (!savedAnchor) {
      savedAnchor = Date.now().toString();
      localStorage.setItem(anchorKey, savedAnchor);
    }
    
    const elapsedSec = (Date.now() - parseInt(savedAnchor)) / 1000;
    accumulatedProfitRef.current = Math.max(0, elapsedSec * (plan.dailyRate / 86400));
  };

  // ULTRA-SMOOTH requestAnimationFrame DOM METER TICKER
  useEffect(() => {
    if (!currentUser || userDeposit < 100 || userDailyYield <= 0) {
      if (profitDisplayRef.current) profitDisplayRef.current.innerText = '$0.000000';
      return;
    }

    const perSecRate = userDailyYield / 86400;
    let lastTime = Date.now();
    let animId;

    const updateMeter = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      accumulatedProfitRef.current += delta * perSecRate;

      if (profitDisplayRef.current) {
        profitDisplayRef.current.innerText = `$${accumulatedProfitRef.current.toFixed(6)}`;
      }

      animId = requestAnimationFrame(updateMeter);
    };

    animId = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(animId);
  }, [currentUser, userDeposit, userDailyYield]);

  // Google Login Hook
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        const userData = {
          uid: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };

        localStorage.setItem('dc_auth_active_user', JSON.stringify(userData));
        setCurrentUser(userData);
        saveAuthenticatedGoogleUser(userData);
        await ensureGoogleUserRecord(userData);
        generateUserCredentials(userData);
        loadUserFinancials(userData.email);
        setActiveTab('dashboard');
        showToast(`Welcome, ${userData.name || userData.email}!`);
      } catch (err) {
        showToast('Login verification failed');
      }
    },
    onError: () => showToast('Google sign-in cancelled'),
  });

  const confirmLogout = () => {
    localStorage.removeItem('dc_auth_active_user');
    setCurrentUser(null);
    setLogoutModalOpen(false);
    setActiveTab('home');
    showToast('Logged out successfully');
  };

  // Open Deposit Modal with Plan
  const handleOpenDepositModal = (planCode) => {
    setSelectedPlanType(planCode);
    setPlansModalOpen(false);
    setDepositModalOpen(true);
  };

  // Withdraw Submit
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawInput);
    if (isNaN(amount) || amount < 50) {
      showToast('Minimum withdrawal amount is $50.00 USD');
      return;
    }
    if (amount > accumulatedProfitRef.current) {
      showToast('Insufficient profit balance!');
      return;
    }
    if (!accountTitle || !accountNumber) {
      showToast('Please complete all account details');
      return;
    }

    const safeKey = currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const withdrawnKey = `dc_withdrawn_${safeKey}`;
    const historyKey = `dc_history_${safeKey}`;
    const anchorKey = `dc_anchor_time_${safeKey}`;

    const newWithdrawnTotal = withdrawnAmount + amount;
    setWithdrawnAmount(newWithdrawnTotal);
    localStorage.setItem(withdrawnKey, newWithdrawnTotal.toString());

    accumulatedProfitRef.current = Math.max(0, accumulatedProfitRef.current - amount);
    localStorage.setItem(anchorKey, Date.now().toString());

    const nowStr = new Date().toLocaleString();
    const txId = 'TX-' + Math.random().toString(36).substr(2, 8).toUpperCase();

    const newTx = {
      id: txId,
      amount: amount.toFixed(2),
      gateway: payoutMethod.toUpperCase(),
      accountTitle: accountTitle,
      accountNumber: accountNumber,
      date: nowStr,
      status: 'PENDING APPROVAL',
      userEmail: currentUser.email
    };

    const updatedHistory = [newTx, ...withdrawHistory];
    setWithdrawHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    const masterList = JSON.parse(localStorage.getItem('dc_master_withdrawals_list') || '[]');
    const updatedMaster = [newTx, ...masterList];
    localStorage.setItem('dc_master_withdrawals_list', JSON.stringify(updatedMaster));
    setAllWithdrawalsList(updatedMaster);

    setWithdrawInput('');
    setAccountTitle('');
    setAccountNumber('');
    setWithdrawModalOpen(false);
    showToast(`Withdrawal of $${amount.toFixed(2)} USD submitted!`);
  };

  const updateWithdrawalStatus = (txId, newStatus) => {
    const updatedMaster = allWithdrawalsList.map(tx => {
      if (tx.id === txId) return { ...tx, status: newStatus };
      return tx;
    });
    setAllWithdrawalsList(updatedMaster);
    localStorage.setItem('dc_master_withdrawals_list', JSON.stringify(updatedMaster));
    showToast(`Request ${txId} marked as ${newStatus}`);
  };

  // ADMIN TRANSFER: Direct instant deposit injection with plan calculation
  const handleAdminInternalTransfer = (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!transferTargetEmail || isNaN(amt) || amt <= 0) {
      showToast('Please enter valid target email and transfer amount');
      return;
    }

    const cleanTarget = transferTargetEmail.toLowerCase().trim();
    const safeTargetKey = cleanTarget.replace(/[^a-zA-Z0-9]/g, '_');
    const depositKey = `dc_deposit_${safeTargetKey}`;
    const anchorKey = `dc_anchor_time_${safeTargetKey}`;
    
    const currentDep = parseFloat(localStorage.getItem(depositKey) || '0.0000');
    const newDep = currentDep + amt;
    
    localStorage.setItem(depositKey, newDep.toString());
    localStorage.setItem(anchorKey, Date.now().toString());

    const plan = resolvePlanDetails(newDep);

    let users = JSON.parse(localStorage.getItem('dc_real_google_users_directory') || '[]');
    const targetIdx = users.findIndex(u => u.email.toLowerCase() === cleanTarget);
    
    if (targetIdx >= 0) {
      users[targetIdx].principal = newDep;
      users[targetIdx].earnedYield = plan.dailyRate;
      users[targetIdx].tier = plan.name;
    } else {
      users.unshift({
        email: cleanTarget,
        name: cleanTarget.split('@')[0],
        picture: '',
        joinedDate: new Date().toISOString().split('T')[0],
        authType: 'Google Auth',
        tier: plan.name,
        principal: newDep,
        earnedYield: plan.dailyRate,
        status: 'active'
      });
    }
    
    localStorage.setItem('dc_real_google_users_directory', JSON.stringify(users));

    if (currentUser && currentUser.email.toLowerCase() === cleanTarget) {
      setUserDeposit(newDep);
      setActivePlanTier(plan);
      setUserDailyYield(plan.dailyRate);
      setUserTotalProfit240(plan.total240Profit);
      accumulatedProfitRef.current = 0;
    }

    setTransferAmount('');
    setTransferTargetEmail('');
    showToast(`$${amt.toFixed(2)} USD transferred successfully to ${cleanTarget}!`);
  };

  // ADMIN: Reset User Profit Function
  const handleResetUserProfit = (targetEmail) => {
    const cleanTarget = targetEmail.toLowerCase().trim();
    const safeTargetKey = cleanTarget.replace(/[^a-zA-Z0-9]/g, '_');
    const anchorKey = `dc_anchor_time_${safeTargetKey}`;
    
    localStorage.setItem(anchorKey, Date.now().toString());

    if (currentUser && currentUser.email.toLowerCase() === cleanTarget) {
      accumulatedProfitRef.current = 0;
    }

    showToast(`Profit successfully reset to $0.00 for ${cleanTarget}`);
  };

  const copyToClipboard = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleGenerateIbLink = (e) => {
    e.preventDefault();
    if (!ibCodeInput) {
      showToast('Please enter mandatory secret access code');
      return;
    }
    const partner = currentUser ? currentUser.email.split('@')[0] : 'client';
    const link = `https://dollarcraft3.com/ref?code=${ibCodeInput.toUpperCase()}&partner=${partner}`;
    setGeneratedIbLink(link);
    showToast('Official IB Link Generated!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const totalBalance = (userDeposit + accumulatedProfitRef.current).toFixed(4);
  const isSuperAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const filteredUsers = allUsersList.filter(u => 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredWithdrawals = allWithdrawalsList.filter(w => {
    if (withdrawFilter === 'Pending') return w.status === 'PENDING APPROVAL';
    if (withdrawFilter === 'Approved') return w.status === 'APPROVED';
    if (withdrawFilter === 'Rejected') return w.status === 'REJECTED';
    return true;
  });

  const pendingWithdrawCount = allWithdrawalsList.filter(w => w.status === 'PENDING APPROVAL').length;

  const formatReservesParts = (val) => {
    const whole = Math.floor(val).toLocaleString('en-US');
    const decimal = (val % 1).toFixed(4).substring(1);
    return { whole, decimal };
  };

  const currentReservesParts = formatReservesParts(globalReserves);

  const speedPerSec = (userDailyYield / 86400).toFixed(6);
  const speedPerMs = ((userDailyYield / 86400) / 1000).toFixed(9);

  return (
    <div className="min-h-screen bg-[#040810] text-white flex flex-col selection:bg-[#00f0ff] selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-[#00f0ff] text-black px-5 py-3 rounded-xl shadow-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-[#0d1c30] bg-[#060c18]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1360px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-[#081526] border border-[#00f0ff]/40 flex items-center justify-center p-1.5 shadow-lg shadow-cyan-500/20 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                className="w-full h-full object-contain"
              />
              <div className="w-full h-full hidden items-center justify-center">
                <DollarSign className="text-[#00f0ff] stroke-[2.5]" size={20} />
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-lg block leading-none text-white">DOLLAR CRAFT</span>
              <span className="text-[9px] text-[#00f0ff] font-bold tracking-[0.2em] uppercase mt-1 block">Global Investment Platform</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center bg-[#071322] border border-[#10243e] rounded-2xl p-1.5 gap-1.5">
            <button 
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'home' 
                  ? 'bg-[#00e5ff] text-black font-extrabold shadow-md shadow-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#0c1e34]'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                if (!currentUser) {
                  loginWithGoogle();
                } else {
                  setActiveTab('dashboard');
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-[#00e5ff] text-black font-extrabold shadow-md shadow-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#0c1e34]'
              }`}
            >
              <Layers size={14} />
              Customer Dashboard
            </button>
            
            <button 
              onClick={() => setPlansModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-[#eab308] border border-[#eab308]/30 bg-[#eab308]/5 hover:bg-[#eab308]/15 transition-all"
            >
              <TrendingUp size={14} className="text-[#eab308]" />
              Plans
            </button>

            {/* ADMIN BUTTON */}
            {isSuperAdmin && (
              <button 
                onClick={() => setAdminModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/60 text-[#ffb700] hover:bg-amber-500/30 shadow-lg shadow-amber-500/20 transition-all animate-pulse"
              >
                <Sliders size={14} className="text-[#ffb700]" />
                <span>Admin</span>
                {pendingWithdrawCount > 0 && (
                  <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {pendingWithdrawCount}
                  </span>
                )}
              </button>
            )}

            <button 
              onClick={() => setAboutModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-[#0c1e34] transition-all"
            >
              About Us
            </button>
            <button 
              onClick={() => setActiveTab('ib')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ib' 
                  ? 'bg-[#00e5ff] text-black font-extrabold shadow-md shadow-cyan-500/30' 
                  : 'text-[#eab308] hover:text-[#fde047] hover:bg-[#0c1e34]'
              }`}
            >
              <Award size={14} />
              IB Program
            </button>
            <button 
              onClick={() => setContactModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-[#0c1e34] transition-all"
            >
              Contact
            </button>
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="flex items-center bg-[#071322] border border-[#10243e] rounded-2xl px-3 py-1.5 gap-2.5">
                  {currentUser.picture ? (
                    <img src={currentUser.picture} alt="User" className="w-7 h-7 rounded-xl object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-[#00e5ff] text-black font-black flex items-center justify-center text-xs">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-200 font-mono-finance tracking-tight">
                    {currentUser.email}
                  </span>
                </div>

                <button 
                  onClick={() => setLogoutModalOpen(true)}
                  title="Logout"
                  className="w-9 h-9 rounded-xl bg-[#140c14] border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/60 transition-all cursor-pointer"
                >
                  <LogOut size={15} />
                </button>

                <button 
                  onClick={() => setWithdrawModalOpen(true)}
                  className="bg-[#07172c] border border-[#00e5ff]/50 hover:border-[#00e5ff] hover:bg-[#00e5ff]/10 text-[#00e5ff] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ArrowUpRight size={15} />
                  Withdraw
                </button>
              </>
            ) : (
              <button 
                onClick={() => loginWithGoogle()}
                className="bg-white hover:bg-gray-100 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            <button 
              onClick={() => showToast('No unread alerts')}
              className="w-9 h-9 rounded-xl bg-[#071322] border border-[#10243e] text-gray-400 hover:text-white flex items-center justify-center transition-all"
            >
              <Bell size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1240px] mx-auto px-4 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* ================= VIEW 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-b from-[#071426] via-[#050f1d] to-[#040810] border border-[#10243e] rounded-[28px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="bg-[#06192d] border border-[#00d0ff]/40 text-[#00d0ff] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <Globe size={13} className="text-[#00d0ff]" />
                  <span>OFFICIAL SMART INVESTMENT PROTOCOL</span>
                </div>
                <div className="bg-[#051c1c] border border-emerald-500/40 text-emerald-400 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE CONTINUOUS MICRO-YIELD</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase text-white max-w-4xl">
                DOLLAR CRAFT – HIGH PRECISION MICRO-YIELD INVESTMENT PLATFORM
              </h1>

              <p className="text-gray-300 text-sm sm:text-base max-w-3xl mt-5 leading-relaxed font-normal">
                Dollar Craft is an institutional-grade digital asset micro-yield protocol and financial management ecosystem. Operating legally across <strong className="text-white font-extrabold">7 regulated global hubs</strong>, we deliver sub-second 26-decimal precision compounding, audited multi-signature custody, and automated daily capital growth.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                {currentUser ? (
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-[#00e5ff] hover:bg-[#33edff] text-black font-extrabold px-7 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/25"
                  >
                    <Layers size={15} />
                    <span>GO TO CUSTOMER DASHBOARD</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => loginWithGoogle()}
                    className="bg-[#00e5ff] hover:bg-[#33edff] text-black font-extrabold px-7 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-[1.02]"
                  >
                    <Zap size={15} className="fill-black" />
                    <span>GET STARTED WITH GOOGLE</span>
                    <ChevronRight size={14} />
                  </button>
                )}
                
                <button 
                  onClick={() => setPlansModalOpen(true)}
                  className="bg-[#07172c] hover:bg-[#0c223e] border border-[#163660] text-[#00d0ff] font-extrabold px-7 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Layers size={15} />
                  <span>VIEW PACKAGES (DC1, DC2, DC3)</span>
                </button>
              </div>
            </div>

            <div className="bg-[#050b14] border border-[#10243d] rounded-[26px] p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0d1d32] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#ffb700]">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-white">
                      REGISTERED & OPERATING GLOBAL HUBS
                    </h2>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Fully compliant operations with Tier-1 local regulatory frameworks.
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    7 ACTIVE OPERATING HUBS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
                {GLOBAL_HUBS.map((hub) => (
                  <div 
                    key={hub.country} 
                    className="bg-[#03070d] border border-[#0d1c30] hover:border-[#00e5ff]/40 p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <img 
                      src={`https://flagcdn.com/w80/${hub.code}.png`} 
                      alt={hub.country}
                      className="w-9 h-6 object-cover rounded shadow-md border border-[#142c4c] mb-2 group-hover:scale-105 transition-transform"
                    />
                    <span className="font-extrabold text-xs text-white block">{hub.country}</span>
                    <span className="text-[8px] text-[#00ff88] font-mono-finance block uppercase font-bold mt-0.5">COMPLIANT</span>
                    <span className="text-[7.5px] text-gray-500 font-mono-finance block truncate w-full mt-0.5">{hub.reg}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#030810] border border-[#0d1f37] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-gray-300 text-left">
                  <ShieldCheck size={16} className="text-[#00e5ff] shrink-0" />
                  <span className="text-[11px]">
                    <strong className="text-white">Institutional Custody Guarantee:</strong> Quarterly third-party compliance audits & proof-of-reserve validation across all 7 operational hubs.
                  </span>
                </div>
                <span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[9px] font-extrabold px-3 py-1 rounded-md uppercase whitespace-nowrap">
                  AUDITED & VERIFIED
                </span>
              </div>
            </div>

            <div className="bg-[#050b14] border border-[#10243d] rounded-[26px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0d1d32] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#08182b] border border-[#122e50] flex items-center justify-center text-[#00e5ff]">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide uppercase text-white">
                      SYSTEM METRICS & REAL-TIME PROTOCOL ACCRUAL ENGINE
                    </h2>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Sub-Second 26-Decimal Micro-Tick Precision Engine
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">24/7 ONLINE ACCRUAL</span>
                </div>
              </div>

              <div className="py-7 text-left">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping"></span>
                  <span>REAL-TIME HIGH-FREQUENCY ACCUMULATION TICKER</span>
                </div>
                <div className="text-4xl sm:text-6xl font-black font-mono-finance tracking-tight">
                  <span className="text-[#00e5ff]">$</span>
                  <span className="text-white">{currentReservesParts.whole}</span>
                  <span className="text-[#00e5ff]">{currentReservesParts.decimal}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-[#03070d] border border-[#0d1c30] p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL NET RESERVES</span>
                  <div className="text-base font-black text-[#00ff88] font-mono-finance mt-0.5">$680.3M+</div>
                </div>

                <div className="bg-[#03070d] border border-[#0d1c30] p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL CUMULATIVE YIELD</span>
                  <div className="text-base font-black text-[#00e5ff] font-mono-finance mt-0.5">$45.89M+</div>
                </div>

                <div className="bg-[#03070d] border border-[#0d1c30] p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">CALCULATION PRECISION</span>
                  <div className="text-base font-black text-white font-mono-finance mt-0.5">26 Decimals</div>
                </div>

                <div className="bg-[#03070d] border border-[#0d1c30] p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">OPERATING UPTIME</span>
                  <div className="text-base font-black text-[#00e5ff] font-mono-finance mt-0.5">99.99%</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: CUSTOMER DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-[#061426] via-[#091e36] to-[#061426] border border-[#102744] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#081d36] border border-[#143c6b] flex items-center justify-center text-[#00e5ff]">
                  <Users size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase">CUSTOMER DASHBOARD</h1>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      AUTHENTICATED
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Personal customer portal, credentials, portfolio balances & contract yields</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#040a14] border border-[#0d1f37] rounded-xl px-4 py-2.5">
                {currentUser?.picture ? (
                  <img src={currentUser.picture} alt="User" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#00e5ff] text-black font-black flex items-center justify-center text-xs">
                    {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">ACTIVE ACCOUNT</span>
                  <span className="text-xs font-bold text-gray-200 font-mono-finance">{currentUser?.email}</span>
                </div>
              </div>
            </div>

            {/* Total Balance Card */}
            <div className="bg-[#050e1c] border border-[#0f233d] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#00d0ff] text-xs font-bold uppercase tracking-widest mb-2">
                <Wallet size={15} />
                <span>TOTAL BALANCE</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono-finance tracking-tight">
                ${totalBalance}
              </div>
            </div>

            {/* Total Deposit Card */}
            <div className="bg-[#050e1c] border border-[#0f233d] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#00ff88] text-xs font-bold uppercase tracking-widest mb-2">
                <DollarSign size={15} />
                <span>TOTAL DEPOSIT</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-[#00ff88] font-mono-finance tracking-tight">
                ${userDeposit.toFixed(4)}
              </div>
              <div className="mt-5 pt-4 border-t border-[#0b1b30] flex items-center justify-between text-xs">
                <div className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span>Contract Duration (240 Days):</span>
                </div>
                <span className="font-bold text-[#00ff88] font-mono-finance text-xs">
                  {userDeposit >= 100 ? `+$${userTotalProfit240.toFixed(2)} Total 240d Profit` : '$0.00 Total 240d Profit'}
                </span>
              </div>
            </div>

            {/* Earned Profit Card */}
            <div className="bg-[#050e1c] border border-[#0f233d] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#ffb700] text-xs font-bold uppercase tracking-widest">
                  <TrendingUp size={15} />
                  <span>TOTAL EARNED PROFIT</span>
                </div>
                <div className="bg-[#041c22] border border-[#00e5ff]/30 px-2.5 py-1 rounded-md">
                  <span className="text-[9px] text-[#00e5ff] font-extrabold uppercase tracking-wider">MILLISECOND STREAM LIVE</span>
                </div>
              </div>

              <div ref={profitDisplayRef} className="text-4xl sm:text-5xl font-black text-[#ffb700] font-mono-finance tracking-tight">
                $0.000000
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#0b1b30] pt-4 text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-medium">24-Hour Target:</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-black px-2.5 py-0.5 rounded-md font-mono-finance">
                    +{userDailyYield.toFixed(4)} USD / 24h
                  </span>
                </div>

                <div className="text-gray-400 text-[11px] font-mono-finance flex items-center gap-1">
                  <span>Speed:</span>
                  <span className="text-[#ffb700] font-black">+${speedPerSec}/s</span>
                  <span className="text-gray-500 text-[9px]">(+${speedPerMs}/ms)</span>
                </div>
              </div>
            </div>

            {/* Active Plan Tier Card */}
            {userDeposit >= 100 && (
              <div 
                style={{ 
                  backgroundColor: activePlanTier.bgColor, 
                  borderColor: activePlanTier.borderColor,
                  boxShadow: `0 0 25px ${activePlanTier.borderColor}22`
                }}
                className="border-2 rounded-[24px] p-6 sm:p-7 shadow-2xl space-y-5 transition-all animate-in fade-in zoom-in duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span 
                      style={{ backgroundColor: activePlanTier.tagColor }}
                      className="text-black font-black text-xs px-2.5 py-1 rounded-md"
                    >
                      {activePlanTier.code}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base uppercase text-white tracking-wide">
                          {activePlanTier.name}
                        </h3>
                        <span 
                          style={{ color: activePlanTier.color, borderColor: `${activePlanTier.tagColor}55` }}
                          className="bg-black/40 border text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                        >
                          {activePlanTier.tierName}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block font-medium mt-0.5">
                        8 Months (240 Days Duration) • Continuous 1-second Micro-yield streaming
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">
                      AUTOMATED DAILY EARNINGS
                    </span>
                    <span 
                      style={{ color: activePlanTier.color }}
                      className="text-lg font-black font-mono-finance"
                    >
                      +{userDailyYield.toFixed(4)} USD / Day
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  
                  <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY YIELD</span>
                    <div 
                      style={{ color: activePlanTier.color }}
                      className="text-base font-black font-mono-finance"
                    >
                      {activePlanTier.monthlyPct}% / mo
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY DOLLARS</span>
                    <div className="text-base font-black text-[#00ff88] font-mono-finance">
                      +${activePlanTier.monthlyDollars.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">CONTRACT DURATION</span>
                    <div className="text-base font-black text-white font-mono-finance">
                      240 Days
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL CONTRACT PROFIT</span>
                    <div 
                      style={{ color: activePlanTier.color }}
                      className="text-base font-black font-mono-finance"
                    >
                      +${activePlanTier.total240Profit.toFixed(2)}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Customer Quick Action Hub */}
            <div className="bg-[#050e1c] border border-[#0f233d] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#00d0ff] text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck size={16} />
                <span>CUSTOMER QUICK ACTION HUB</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setPlansModalOpen(true)}
                  className="bg-[#07162b] hover:bg-[#0b203c] border border-[#112d50] text-[#00ff88] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <DollarSign size={15} />
                  <span>DEPOSIT FUNDS</span>
                </button>
                <button 
                  onClick={() => setWithdrawModalOpen(true)}
                  className="bg-[#07162b] hover:bg-[#0b203c] border border-[#112d50] text-[#00e5ff] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <ArrowUpRight size={15} />
                  <span>WITHDRAW EARNINGS</span>
                </button>
                <button 
                  onClick={() => setHistoryModalOpen(true)}
                  className="bg-[#07162b] hover:bg-[#0b203c] border border-[#112d50] text-[#ffb700] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Clock size={15} />
                  <span>WITHDRAW HISTORY</span>
                </button>
              </div>
            </div>

            {/* Account Credentials & Identity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-[#050b14] border border-[#10243d] rounded-[24px] p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#0d1e33] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#08182b] border border-[#122e50] flex items-center justify-center text-[#00e5ff]">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white uppercase tracking-wider">
                        ACCOUNT CREDENTIALS & IDENTITY
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Verified customer sign-in details & profile attributes
                      </span>
                    </div>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={11} /> VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  
                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">CUSTOMER NAME</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <User size={13} className="text-[#00e5ff]" />
                      <span className="truncate">{currentUser?.name || 'Customer'}</span>
                    </div>
                  </div>

                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">SIGNED-IN EMAIL</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00ff88] font-mono-finance">
                      <Mail size={13} className="text-[#00ff88] shrink-0" />
                      <span className="truncate">{currentUser?.email}</span>
                    </div>
                  </div>

                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">ACCOUNT ID</span>
                      <button 
                        onClick={() => copyToClipboard(userAccountId, 'Account ID')}
                        className="text-[9px] text-[#00e5ff] font-extrabold uppercase hover:underline flex items-center gap-0.5"
                      >
                        <Copy size={10} /> COPY
                      </button>
                    </div>
                    <div className="text-xs font-bold text-[#00e5ff] font-mono-finance tracking-tight">
                      {userAccountId}
                    </div>
                  </div>

                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">REFERRAL CODE</span>
                      <button 
                        onClick={() => copyToClipboard(userReferralCode, 'Referral Code')}
                        className="text-[9px] text-[#ffb700] font-extrabold uppercase hover:underline flex items-center gap-0.5"
                      >
                        <Copy size={10} /> COPY
                      </button>
                    </div>
                    <div className="text-xs font-black text-[#ffb700] font-mono-finance tracking-wide">
                      {userReferralCode}
                    </div>
                  </div>

                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">REGISTRATION DATE</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300 font-mono-finance">
                      <Calendar size={13} className="text-[#00e5ff]" />
                      <span>{userRegDate}</span>
                    </div>
                  </div>

                  <div className="bg-[#03070d] border border-[#0d1c30] p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">SECURITY CLEARANCE</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00ff88]">
                      <ShieldCheck size={13} className="text-[#00ff88]" />
                      <span>2FA & Google Auth Enabled</span>
                    </div>
                  </div>

                </div>
              </div>

              <div className="space-y-4">
                
                <div className="bg-[#050b14] border border-[#10243d] rounded-[24px] p-6 shadow-xl space-y-3.5">
                  <div className="flex items-center gap-2 text-[#ffb700]">
                    <Award size={18} />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">CUSTOMER REFERRAL PROGRAM</h4>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Share your unique referral link to earn tiered commissions on client deposits.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">YOUR REFERRAL LINK</span>
                    <div className="bg-[#03070d] border border-[#0d1c30] p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-mono-finance text-[#00e5ff] text-[11px] truncate mr-2">
                        {userReferralLink}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(userReferralLink, 'Referral Link')}
                        className="bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-black p-1.5 rounded-lg transition-all"
                        title="Copy Link"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#050b14] border border-[#10243d] rounded-[24px] p-6 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 text-[#00e5ff]">
                    <Shield size={16} />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">INSTITUTIONAL FUND PROTECTION</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                    All customer principal deposits are held in segregated cold wallets backed by multi-signature cryptographic proof.
                  </p>
                </div>

              </div>

            </div>

            {/* Active Investment Deposits Table */}
            <div className="bg-[#050b14] border border-[#10243d] rounded-[24px] p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0d1e33] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#08182b] border border-[#122e50] flex items-center justify-center text-[#00ff88]">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white uppercase tracking-wider">
                      ACTIVE INVESTMENT DEPOSITS ({userDeposit >= 100 ? '1' : '0'})
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Contracts generating real-time interest stream
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setPlansModalOpen(true)}
                  className="bg-[#00ff88] hover:bg-[#33ff9e] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
                >
                  <Plus size={14} className="stroke-[3]" />
                  <span>New Deposit</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-400 uppercase font-black tracking-wider text-[10px] border-b border-[#0d1e33]">
                    <tr>
                      <th className="pb-3">DEPOSIT ID</th>
                      <th className="pb-3">AMOUNT</th>
                      <th className="pb-3">PLAN</th>
                      <th className="pb-3">DAILY RATE</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0c1a2c]">
                    {userDeposit >= 100 ? (
                      <tr className="hover:bg-[#071322]/50 transition-colors">
                        <td className="py-4 font-mono-finance text-[#00e5ff] font-bold">
                          dep-prin-{userAccountId.slice(-6)}
                        </td>
                        <td className="py-4 font-mono-finance font-black text-[#00ff88] text-sm">
                          ${userDeposit.toFixed(2)}
                        </td>
                        <td className="py-4 font-extrabold text-white">
                          {activePlanTier.name}
                        </td>
                        <td className="py-4 font-mono-finance text-gray-300">
                          +{((activePlanTier.monthlyPct / 30)).toFixed(3)}% / day
                        </td>
                        <td className="py-4">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase">
                            ACTIVE
                          </span>
                        </td>
                        <td className="py-4 text-right font-mono-finance text-gray-400 text-[11px]">
                          {userRegDate}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 font-bold">
                          No active deposit contracts found. Deposit funds to start receiving daily yields.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 3: FULL IB PROGRAM ================= */}
        {activeTab === 'ib' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-[#061426] via-[#091e36] to-[#061426] border border-[#102744] rounded-2xl p-8 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-extrabold text-gray-400 tracking-widest uppercase">BECOME AN IB PROGRAM</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight">
                  PAY $7000 AND EARN <span className="text-[#00e5ff]">10% PER REFERRAL</span>
                </h2>
                <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                  Activate your official IB Membership for <strong className="text-white">$7,000 USDT</strong>. Your full $7,000 deposit is 100% credited directly into your main trading balance while unlocking institutional partner status to earn an instant <strong className="text-[#00e5ff]">10% direct commission</strong> on every referral!
                </p>
              </div>

              <button 
                onClick={() => showToast('IB Partner membership checkout initialized')}
                className="bg-[#00e5ff] hover:bg-[#33edff] text-black font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 whitespace-nowrap"
              >
                <Award size={15} />
                <span>BECOME AN IB PARTNER</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#050e1c] border border-[#0f233d] p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL DIRECT SALES</span>
                  <Users size={14} className="text-[#00e5ff]" />
                </div>
                <div className="text-2xl font-black text-white font-mono-finance">$0.00</div>
                <div className="text-[10px] text-[#00e5ff] mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp size={11} /> Direct referred clients investment volume
                </div>
              </div>

              <div className="bg-[#050e1c] border border-[#0f233d] p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL EARNED COMMISSION</span>
                  <Award size={14} className="text-[#ffb700]" />
                </div>
                <div className="text-2xl font-black text-[#ffb700] font-mono-finance">$0.00</div>
                <div className="text-[10px] text-[#ffb700] mt-2 flex items-center gap-1 font-medium">
                  <Sparkles size={11} /> Cumulative IB referral rewards
                </div>
              </div>

              <div className="bg-[#050e1c] border border-[#0f233d] p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">COMMISSION WALLET</span>
                    <Wallet size={14} className="text-[#00e5ff]" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono-finance">$0.00</div>
                </div>
                <button 
                  onClick={() => showToast('Commission balance is currently $0.00')}
                  className="mt-3 bg-[#08182d] hover:bg-[#0c223e] text-[#00e5ff] text-[9px] font-extrabold py-2 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 border border-[#102b4d]"
                >
                  <ArrowUpRight size={11} /> WITHDRAW COMMISSION
                </button>
              </div>

              <div className="bg-[#050e1c] border border-[#0f233d] p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">$7000 MEMBERSHIPS SOLD</span>
                  <CheckCircle2 size={14} className="text-[#00ff88]" />
                </div>
                <div className="text-2xl font-black text-[#00ff88] font-mono-finance">0 <span className="text-xs text-gray-400 font-sans">UNITS</span></div>
                <div className="text-[10px] text-[#00ff88] mt-2 flex items-center gap-1 font-medium">
                  <Zap size={11} /> Earn 10% ($700) per sale
                </div>
              </div>
            </div>

            {/* IB Referral Generator */}
            <div className="bg-[#050e1c] border border-[#0f233d] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wide">IB REFERRAL GENERATOR</h3>
                  <p className="text-xs text-gray-400">Generate high-speed global IB referral links.</p>
                </div>
              </div>

              <form onSubmit={handleGenerateIbLink} className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#ffb700] uppercase tracking-wider text-[10px]">MANDATORY IB ACCESS CODE</span>
                  <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest">REQUIRED</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="password"
                    value={ibCodeInput}
                    onChange={(e) => setIbCodeInput(e.target.value)}
                    placeholder="ENTER SECRET ACCESS CODE"
                    className="flex-1 bg-[#030810] border border-[#0f233d] rounded-xl px-4 py-3.5 text-xs font-mono-finance text-white tracking-widest focus:outline-none focus:border-[#00e5ff]"
                  />
                  <button 
                    type="submit"
                    className="bg-[#00e5ff] hover:bg-[#33edff] text-black font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                  >
                    <span>+ GENERATE NEW IB LINK</span>
                  </button>
                </div>
              </form>

              {generatedIbLink && (
                <div className="mt-3 p-3.5 bg-[#030810] border border-[#00e5ff]/40 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-mono-finance text-[#00e5ff] truncate mr-2">{generatedIbLink}</span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(generatedIbLink); showToast('IB Link copied!'); }}
                    className="bg-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black font-extrabold px-3 py-1 rounded-md flex items-center gap-1 uppercase text-[9px]"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Floating Messenger Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://m.me/" 
          target="_blank" 
          rel="noreferrer"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#0066ff] to-[#00e5ff] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all p-3"
        >
          <MessageCircle size={26} />
        </a>
      </div>

      {/* ================= MODAL: ADMIN ================= */}
      {adminModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#080d14] border border-[#162942] w-full max-w-6xl rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[95vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#122338] pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#ffb700]">
                  <Sliders size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                      Dollar Craft Admin
                    </h2>
                    <span className="bg-amber-500/20 text-[#ffb700] border border-amber-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      SYSTEM SUPERVISOR
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Global Liquidity Oversight & Fraud Audit Desk
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setAdminModalOpen(false)}
                className="text-gray-400 hover:text-white bg-[#0f1d2e] hover:bg-[#162c47] w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all border border-[#1d3554]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#122338] pb-3 text-xs font-bold">
              <button 
                onClick={() => setAdminActiveTab('users')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  adminActiveTab === 'users' 
                    ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#102033]'
                }`}
              >
                <Users size={14} />
                <span>User Accounts ({allUsersList.length})</span>
              </button>

              <button 
                onClick={() => setAdminActiveTab('withdrawals')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  adminActiveTab === 'withdrawals' 
                    ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#102033]'
                }`}
              >
                <DollarSign size={14} />
                <span>Withdrawals & History ({allWithdrawalsList.length})</span>
                {pendingWithdrawCount > 0 && (
                  <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {pendingWithdrawCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setAdminActiveTab('transfer')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  adminActiveTab === 'transfer' 
                    ? 'bg-emerald-400 text-black font-black shadow-lg shadow-emerald-400/20' 
                    : 'text-emerald-400 hover:bg-emerald-400/10'
                }`}
              >
                <Repeat size={14} />
                <span>Internal Transfer & Vault</span>
              </button>
            </div>

            {/* TAB 1: USER ACCOUNTS DIRECTORY */}
            {adminActiveTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Search users by email or ID..."
                      className="w-full bg-[#050a12] border border-[#14263d] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffb700]"
                    />
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-[#050a12] border border-[#14263d] px-4 py-2 rounded-xl">
                    Total Authenticated Google Accounts: <strong className="text-white">{allUsersList.length}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#14263d] rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#050a12] text-gray-400 uppercase font-black tracking-wider text-[10px] border-b border-[#14263d]">
                      <tr>
                        <th className="p-3.5">User Email</th>
                        <th className="p-3.5">Joined Date</th>
                        <th className="p-3.5">Auth Type</th>
                        <th className="p-3.5">Plan / Tier</th>
                        <th className="p-3.5">Principal</th>
                        <th className="p-3.5">Earned Yield</th>
                        <th className="p-3.5 text-center">Reset Profit</th>
                        <th className="p-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102136]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-gray-500 font-bold">
                            No Google-authenticated accounts found yet.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u, i) => (
                          <tr key={i} className="hover:bg-[#0c1828] transition-colors">
                            <td className="p-3.5 font-bold text-white font-mono-finance flex items-center gap-2">
                              {u.picture ? (
                                <img src={u.picture} alt="" className="w-6 h-6 rounded-lg object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-[#00e5ff]/20 text-[#00e5ff] font-black flex items-center justify-center text-[10px]">
                                  {u.email[0].toUpperCase()}
                                </div>
                              )}
                              <span>{u.email}</span>
                            </td>
                            <td className="p-3.5 text-gray-400 font-mono-finance">{u.joinedDate}</td>
                            <td className="p-3.5 text-[#00e5ff] font-mono-finance text-[11px] flex items-center gap-1">
                              <Key size={11} className="text-[#ffb700]" />
                              <span>{u.authType}</span>
                            </td>
                            <td className="p-3.5 text-[#ffb700] font-black text-[10px]">{u.plan}</td>
                            <td className="p-3.5 font-black text-white font-mono-finance">{u.principal}</td>
                            <td className="p-3.5 font-black text-[#00ff88] font-mono-finance">{u.earnedYield}/day</td>
                            <td className="p-3.5 text-center">
                              <button 
                                onClick={() => handleResetUserProfit(u.email)}
                                className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] flex items-center gap-1 mx-auto transition-all"
                              >
                                <RotateCcw size={11} /> Reset
                              </button>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: WITHDRAWALS & FRAUD AUDIT DESK */}
            {adminActiveTab === 'withdrawals' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#050a12] border border-[#14263d] p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] font-extrabold uppercase">
                      <span>Pending Queue</span>
                      <Clock size={14} className="text-[#ffb700]" />
                    </div>
                    <div className="text-xl font-black text-[#ffb700] mt-1 font-mono-finance">{pendingWithdrawCount} Requests</div>
                  </div>

                  <div className="bg-[#050a12] border border-[#14263d] p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] font-extrabold uppercase">
                      <span>Approved / Disbursed</span>
                      <CheckCircle size={14} className="text-[#00ff88]" />
                    </div>
                    <div className="text-xl font-black text-[#00ff88] mt-1 font-mono-finance">
                      {allWithdrawalsList.filter(w => w.status === 'APPROVED').length} Paid Out
                    </div>
                  </div>

                  <div className="bg-[#050a12] border border-[#14263d] p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] font-extrabold uppercase">
                      <span>Rejected Requests</span>
                      <XCircle size={14} className="text-red-400" />
                    </div>
                    <div className="text-xl font-black text-red-400 mt-1 font-mono-finance">
                      {allWithdrawalsList.filter(w => w.status === 'REJECTED').length} Rejected
                    </div>
                  </div>

                  <div className="bg-[#050a12] border border-[#14263d] p-4 rounded-2xl">
                    <div className="flex items-center justify-between text-gray-400 text-[10px] font-extrabold uppercase">
                      <span>Total Volume</span>
                      <DollarSign size={14} className="text-[#00e5ff]" />
                    </div>
                    <div className="text-xl font-black text-white mt-1 font-mono-finance">{allWithdrawalsList.length} Total</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'Pending', 'Approved', 'Rejected'].map((filt) => (
                    <button 
                      key={filt}
                      onClick={() => setWithdrawFilter(filt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        withdrawFilter === filt 
                          ? 'bg-[#00e5ff] text-black font-extrabold' 
                          : 'bg-[#050a12] border border-[#14263d] text-gray-400 hover:text-white'
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredWithdrawals.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-bold text-xs bg-[#050a12] border border-[#14263d] rounded-2xl">
                      No withdrawal records available under selected filter.
                    </div>
                  ) : (
                    filteredWithdrawals.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="bg-[#050a12] border border-[#14263d] hover:border-[#1d395d] p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-white font-mono-finance">
                              ${tx.amount} USD
                            </span>
                            <span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                              {tx.gateway}
                            </span>
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase ${
                              tx.status === 'PENDING APPROVAL'
                                ? 'bg-amber-500/10 text-[#ffb700] border border-amber-500/30 animate-pulse'
                                : tx.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {tx.status}
                            </span>
                          </div>

                          <div className="text-xs text-gray-300 font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>User: <strong className="text-white font-mono-finance">{tx.userEmail}</strong></span>
                            <span>Requested: <strong className="text-gray-400 font-mono-finance">{tx.date}</strong></span>
                          </div>

                          <div className="text-xs bg-[#03060a] border border-[#0f1d2e] p-2.5 rounded-xl font-mono-finance text-gray-300 flex items-center justify-between">
                            <span>Destination: <strong className="text-[#00ff88]">{tx.accountTitle}</strong> | Account / IBAN: <strong className="text-white">{tx.accountNumber}</strong></span>
                            <button 
                              onClick={() => copyToClipboard(`${tx.accountTitle} - ${tx.accountNumber}`, 'Bank Account Details')}
                              className="text-[#00e5ff] hover:underline text-[10px] font-bold uppercase ml-2"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        {tx.status === 'PENDING APPROVAL' && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateWithdrawalStatus(tx.id, 'REJECTED')}
                              className="bg-[#180a0a] hover:bg-red-950/40 border border-red-500/40 text-red-400 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>

                            <button 
                              onClick={() => updateWithdrawalStatus(tx.id, 'APPROVED')}
                              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/25"
                            >
                              <CheckCircle size={14} />
                              <span>Approve & Disburse</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN VAULT & INSTANT INTERNAL TRANSFER */}
            {adminActiveTab === 'transfer' && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-[#050a12] border border-[#14263d] rounded-2xl p-6 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <ShieldCheck size={16} />
                      <span>ADMIN PERSONAL WEB WALLET (OWNER VAULT)</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono-finance tracking-tight">
                      $9,273,632,653,543.00
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Available capital liquidity for direct instant internal client transfers & system seed capital.
                    </p>
                  </div>

                  <div className="bg-[#050a12] border border-[#14263d] rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ffb700] uppercase tracking-wider">AUTO BONUS ON SIGNUP</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      When enabled, any new user who registers will automatically receive an instant welcome bonus transfer.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <input 
                        type="text" 
                        defaultValue="$5.00" 
                        className="bg-[#03060a] border border-[#14263d] rounded-xl px-3.5 py-2 text-xs font-mono-finance text-white w-28 text-center"
                      />
                      <button 
                        onClick={() => showToast('Signup bonus configuration saved')}
                        className="bg-[#ffb700] hover:bg-[#ffc933] text-black font-extrabold px-4 py-2 rounded-xl text-xs uppercase transition-all"
                      >
                        SAVE SETTINGS
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#050a12] border border-[#14263d] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Repeat size={16} className="text-emerald-400" />
                    <span>SEND FUNDS VIA INSTANT INTERNAL TRANSFER</span>
                  </div>

                  <form onSubmit={handleAdminInternalTransfer} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    
                    <div className="sm:col-span-5">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase block mb-1.5">
                        TARGET CLIENT EMAIL
                      </label>
                      <input 
                        type="email" 
                        value={transferTargetEmail}
                        onChange={(e) => setTransferTargetEmail(e.target.value)}
                        placeholder="client@gmail.com"
                        className="w-full bg-[#03060a] border border-[#14263d] rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-mono-finance"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] text-gray-400 font-extrabold uppercase block mb-1.5">
                        TRANSFER AMOUNT (USD)
                      </label>
                      <input 
                        type="number" 
                        step="any"
                        min="1"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="e.g. 100, 500, 7000"
                        className="w-full bg-[#03060a] border border-[#14263d] rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 font-mono-finance text-base font-bold"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-end">
                      <button 
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap size={15} />
                        <span>TRANSFER FUNDS INSTANTLY</span>
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: LOGOUT CONFIRMATION ================= */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#071322] border border-[#132c4e] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center relative animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Confirm Logout</h3>
              <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                Are you sure you want to log out of <strong className="text-[#00e5ff]">{currentUser?.email}</strong>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 bg-[#0b1b30] hover:bg-[#102744] border border-[#163660] text-gray-300 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PLANS (Activates Deposit Modal) ================= */}
      {plansModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-5xl rounded-[28px] p-7 sm:p-9 shadow-2xl space-y-6 relative max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setPlansModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-[#0a182a] hover:bg-[#0f243f] w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all border border-[#132c4e]"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#08182d] border border-[#122e50] flex items-center justify-center text-[#00e5ff]">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Plans</h2>
                  <span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">HIGH YIELD PACKAGES</span>
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Select an official investment plan to start streaming high-frequency micro-yield returns</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              
              {/* DC1 Standard Plan */}
              <div className="bg-[#040e18] border-2 border-[#00c8b3] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(0,200,179,0.12)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#00c8b3] text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-md">DC1</span>
                    <span className="bg-[#003838] text-[#00e5cc] text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md">BRONZE TIER</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">STANDARD PLAN</h3>
                  <div>
                    <span className="text-3xl font-black text-[#00e5cc] font-mono-finance">25%</span>
                    <span className="text-[10px] text-[#00e5cc] uppercase font-extrabold tracking-wider ml-1.5">MONTHLY RETURN</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-normal">25% Monthly Return with $100 to $500 Deposit range for 8 Months (240 Days).</p>
                  <div className="bg-[#02070e] p-3.5 rounded-2xl space-y-2 text-xs border border-[#00c8b3]/20">
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DURATION:</span><span className="font-mono-finance text-white">8 Months (240 Days)</span></div>
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DEPOSIT:</span><span className="font-mono-finance text-[#00e5cc] font-black">$100 - $500</span></div>
                  </div>
                </div>
                <button onClick={() => handleOpenDepositModal('DC1')} className="w-full mt-6 bg-[#00e5cc] hover:bg-[#33ffe6] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,204,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"><span>ACTIVATE STANDARD PLAN</span><ChevronRight size={14} className="stroke-[3]" /></button>
              </div>

              {/* DC2 Premium Plan */}
              <div className="bg-[#100c02] border-2 border-[#eab308] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(234,179,8,0.12)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#eab308] text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-md">DC2</span>
                    <span className="bg-[#3b2b00] text-[#facc15] text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md">GOLD TIER</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">PREMIUM PLAN</h3>
                  <div>
                    <span className="text-3xl font-black text-[#facc15] font-mono-finance">30%</span>
                    <span className="text-[10px] text-[#facc15] uppercase font-extrabold tracking-wider ml-1.5">MONTHLY RETURN</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-normal">30% Monthly Return with $501 to $1,000 Deposit range for 8 Months (240 Days).</p>
                  <div className="bg-[#080501] p-3.5 rounded-2xl space-y-2 text-xs border border-[#eab308]/20">
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DURATION:</span><span className="font-mono-finance text-white">8 Months (240 Days)</span></div>
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DEPOSIT:</span><span className="font-mono-finance text-[#facc15] font-black">$501 - $1,000</span></div>
                  </div>
                </div>
                <button onClick={() => handleOpenDepositModal('DC2')} className="w-full mt-6 bg-[#eab308] hover:bg-[#fde047] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"><span>ACTIVATE PREMIUM PLAN</span><ChevronRight size={14} className="stroke-[3]" /></button>
              </div>

              {/* DC3 VIP Plan */}
              <div className="bg-[#110217] border-2 border-[#d946ef] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(217,70,239,0.12)]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#d946ef] text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-md">DC3</span>
                    <span className="bg-[#380742] text-[#f0abfc] text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md">DIAMOND TIER</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">VIP PLAN</h3>
                  <div>
                    <span className="text-3xl font-black text-[#f0abfc] font-mono-finance">35%</span>
                    <span className="text-[10px] text-[#f0abfc] uppercase font-extrabold tracking-wider ml-1.5">MONTHLY RETURN</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed font-normal">35% Monthly Return with $1,001 to Unlimited Deposit range for 8 Months (240 Days).</p>
                  <div className="bg-[#08010b] p-3.5 rounded-2xl space-y-2 text-xs border border-[#d946ef]/20">
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DURATION:</span><span className="font-mono-finance text-white">8 Months (240 Days)</span></div>
                    <div className="flex justify-between text-gray-300 font-bold text-[11px]"><span>DEPOSIT:</span><span className="font-mono-finance text-[#f0abfc] font-black">$1,001 - Unlimited</span></div>
                  </div>
                </div>
                <button onClick={() => handleOpenDepositModal('DC3')} className="w-full mt-6 bg-[#d946ef] hover:bg-[#e879f9] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(217,70,239,0.4)] flex items-center justify-center gap-1.5"><span>ACTIVATE VIP PLAN</span><ChevronRight size={14} className="stroke-[3]" /></button>
              </div>

            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#0c1e34] pt-4 text-xs text-gray-400 gap-2">
              <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#00e5ff]" /><span>Micro-yield streamed live to your balance with 26-decimal fixed-point precision.</span></div>
              <span className="text-[#00ff88] font-bold flex items-center gap-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 px-3 py-0.5 rounded-full text-[11px]"><CheckCircle2 size={12} /> Instant Accrual</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEPOSIT PORTAL (BANK ONLY) ================= */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-lg rounded-[28px] p-7 sm:p-9 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setDepositModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-[#0a182a] hover:bg-[#0f243f] w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all border border-[#132c4e]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase text-white tracking-wide">
                  {selectedPlanType} - DEPOSIT PORTAL
                </h3>
                <span className="text-[10px] text-[#00ff88] font-bold uppercase tracking-widest block">
                  SECURE DIRECT BANK TRANSFER & GATEWAY
                </span>
              </div>
            </div>

            {/* Gateway Selector (Bank Only active state) */}
            <div className="space-y-2">
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">SELECT DEPOSIT GATEWAY</span>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3.5 rounded-2xl border border-[#00e5ff] bg-[#00e5ff]/10 text-white flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs block">BANK IBAN</span>
                    <span className="text-[9px] text-gray-400 block">Mashreq Bank / Local</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]"></span>
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="bg-[#030810] border border-[#10243e] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#0f1d2e] pb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Mashreq Bank</span>
                <span className="text-xs font-black text-[#00ff88]">DIRECT BANK DEPOSIT</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#0f1d2e] pb-2.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Account Title:</span>
                <span className="text-xs font-black text-white">IRTAZA COMMUNICATION</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">IBAN:</span>
                  <button 
                    onClick={() => copyToClipboard('PK36MSHQ0000089200164395', 'IBAN')}
                    className="text-[10px] text-[#00e5ff] font-extrabold uppercase hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <div className="bg-[#050e1c] border border-[#142946] p-2.5 rounded-xl font-mono-finance text-xs text-white tracking-wide">
                  PK36MSHQ0000089200164395
                </div>
              </div>
            </div>

            {/* Support Slip Instruction */}
            <div className="bg-[#051122] border border-[#112d50] rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-gray-300">
                <MessageCircle size={18} className="text-[#00e5ff] shrink-0" />
                <span>Please share your payment deposit slip directly to Messenger for instant verification.</span>
              </div>
              <a 
                href="https://m.me/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#00e5ff] hover:bg-[#33edff] text-black font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider whitespace-nowrap ml-2 shadow-md"
              >
                Send Slip
              </a>
            </div>

            <button 
              onClick={() => {
                setDepositModalOpen(false);
                showToast('Deposit request submitted successfully! Awaiting verification.');
              }}
              className="w-full bg-gradient-to-r from-[#00d0ff] to-emerald-400 hover:opacity-95 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONFIRM & SUBMIT DEPOSIT REQUEST</span>
              <ChevronRight size={15} className="stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: WITHDRAWAL REQUEST ================= */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#0a182a] w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs">✕</button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]"><ShieldCheck size={20} /></div>
              <div><h3 className="font-extrabold text-base text-white">Withdrawal Request</h3><div className="flex items-center gap-1.5 text-[9px] text-[#00ff88] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span><span>Instant Daily Profit Settlement</span></div></div>
            </div>
            <div className="bg-[#030810] border border-[#00ff88]/30 rounded-xl p-3.5 flex items-center justify-between">
              <div><span className="text-[9px] text-[#00ff88] font-extrabold uppercase tracking-widest block">AVAILABLE PROFIT BALANCE</span><div className="text-xl font-black text-[#00ff88] font-mono-finance">${accumulatedProfitRef.current.toFixed(6)}</div></div>
              <button type="button" onClick={() => setWithdrawInput(accumulatedProfitRef.current.toFixed(4))} className="bg-[#00ff88] hover:bg-[#33ff9e] text-black text-[11px] font-extrabold px-3 py-1.5 rounded-lg uppercase">MAX</button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1"><label className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">WITHDRAWAL AMOUNT (USD)</label><span className="text-[9px] text-[#ffb700] font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">MIN $50.00 USD</span></div>
                <div className="relative"><span className="absolute left-3.5 top-3 text-base font-mono-finance text-[#00ff88] font-black">$</span><input type="number" step="any" min="50" max={accumulatedProfitRef.current} value={withdrawInput} onChange={(e) => setWithdrawInput(e.target.value)} placeholder="0.00" className="w-full bg-[#030810] border border-[#0f233d] rounded-xl pl-8 pr-4 py-3 text-white font-mono-finance text-lg font-black focus:outline-none focus:border-[#00e5ff]" required /></div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5"><span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">PAYOUT BANK AND OTHER</span><span className="text-[9px] text-[#00e5ff] font-bold uppercase tracking-wider">SELECT GATEWAY</span></div>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPayoutMethod('bank')} className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${payoutMethod === 'bank' ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-white' : 'border-[#0f233d] bg-[#030810] text-gray-400'}`}><Landmark size={16} className={payoutMethod === 'bank' ? 'text-[#00e5ff]' : 'text-gray-400'} /><span className="text-xs font-bold mt-1">Bank</span><span className="text-[7px] text-gray-500 uppercase">IBAN / Local</span></button>
                  <button type="button" onClick={() => setPayoutMethod('easypaisa')} className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${payoutMethod === 'easypaisa' ? 'border-[#00ff88] bg-[#00ff88]/10 text-white' : 'border-[#0f233d] bg-[#030810] text-gray-400'}`}><div className="w-4 h-4 rounded-full bg-[#00ff88] text-black font-black text-[8px] flex items-center justify-center">eP</div><span className="text-xs font-bold mt-1">EasyPaisa</span><span className="text-[7px] text-gray-500 uppercase">Wallet</span></button>
                  <button type="button" onClick={() => setPayoutMethod('jazzcash')} className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${payoutMethod === 'jazzcash' ? 'border-red-500 bg-red-500/10 text-white' : 'border-[#0f233d] bg-[#030810] text-gray-400'}`}><div className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[8px] flex items-center justify-center">JC</div><span className="text-xs font-bold mt-1">JazzCash</span><span className="text-[7px] text-gray-500 uppercase">Wallet</span></button>
                </div>
              </div>
              <div className="space-y-2.5">
                <div><div className="flex justify-between items-center mb-1"><label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">ACCOUNT TITLE & BANK NAME</label><span className="text-[8px] text-[#00ff88] font-mono-finance">BOX 1</span></div><input type="text" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} placeholder="e.g. Muhammad Ali (Meezan Bank)" className="w-full bg-[#030810] border border-[#0f233d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00e5ff]" required /></div>
                <div><div className="flex justify-between items-center mb-1"><label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{payoutMethod === 'bank' ? 'IBAN NUMBER' : 'MOBILE ACCOUNT NUMBER'}</label><span className="text-[8px] text-[#00ff88] font-mono-finance">BOX 2</span></div><input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder={payoutMethod === 'bank' ? 'e.g. PK36MEZN0001020304050607' : 'e.g. 03001234567'} className="w-full bg-[#030810] border border-[#0f233d] rounded-xl px-3.5 py-2.5 text-xs font-mono-finance text-white placeholder-gray-600 focus:outline-none focus:border-[#00e5ff]" required /></div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setWithdrawModalOpen(false)} className="w-1/3 bg-[#08182d] hover:bg-[#0c223e] text-gray-300 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider">CANCEL</button>
                <button type="submit" className="w-2/3 bg-[#00e5ff] hover:bg-[#33edff] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25">SUBMIT REQUEST</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONTACT ================= */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setContactModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#0a182a] w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs">✕</button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]"><Mail size={18} /></div>
              <div><h3 className="font-extrabold text-base text-white uppercase tracking-tight">CONTACT DOLLAR CRAFT</h3><span className="text-[10px] text-gray-400 block font-medium">24/7 Global Institutional Support Desk</span></div>
            </div>
            <div className="bg-[#030810] border border-[#0f233d] rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center"><Mail size={14} /></div><div><span className="text-[9px] text-gray-400 font-bold uppercase block">OFFICIAL SUPPORT EMAIL</span><span className="text-xs font-bold text-[#00e5ff] font-mono-finance">dollarcraft3@gmail.com</span></div></div>
              <button onClick={() => copyToClipboard('dollarcraft3@gmail.com', 'Support Email')} className="bg-[#08182d] border border-[#102b4d] text-gray-300 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Copy size={12} /><span>Copy</span></button>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-[#030810] border border-[#0f233d] p-3 rounded-xl"><div className="text-left pl-1"><span className="text-[9px] text-gray-400 font-bold block uppercase">24/7 LIVE SUPPORT</span><span className="text-xs font-bold text-white">24/7 Email Support Desk</span></div><a href="mailto:dollarcraft3@gmail.com" className="bg-gradient-to-r from-[#00d0ff] to-emerald-400 text-black font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-md"><span>EMAIL SUPPORT 24/7</span><ExternalLink size={12} /></a></div>
              <div className="flex items-center justify-between bg-[#030810] border border-[#0f233d] p-3 rounded-xl"><div className="text-left pl-1"><span className="text-[9px] text-gray-400 font-bold block uppercase">LIVE MESSENGER SUPPORT</span><span className="text-xs font-bold text-[#00e5ff]">Facebook Messenger</span></div><a href="https://m.me/" target="_blank" rel="noreferrer" className="bg-gradient-to-r from-blue-600 to-[#0099ff] text-white font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-md"><span>OPEN MESSENGER</span><ExternalLink size={12} /></a></div>
            </div>
            <div className="pt-2 border-t border-[#0b1b30] text-left text-xs text-gray-400 space-y-0.5">
              <div className="flex items-center gap-1 text-[#ffb700] font-extrabold text-[10px] uppercase tracking-wider"><Building size={12} /><span>REGISTERED HQ</span></div>
              <p className="font-bold text-white text-xs">Dollar Craft Pte Ltd</p>
              <p className="text-[10px] text-gray-500">c/o Company Name<br/>70 Bendemeer Road, #03-02<br/>Luzerne, Singapore 339940</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ABOUT ================= */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-2xl rounded-3xl p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAboutModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#0a182a] w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs">✕</button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]"><Landmark size={20} /></div>
              <div><div className="flex items-center gap-2"><h3 className="font-black text-lg text-white uppercase tracking-tight">ABOUT DOLLAR CRAFT</h3><span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">REGULATED ENTITY</span></div><span className="text-xs text-gray-400 font-medium">Registered & Operating across 7 Global Financial Hubs</span></div>
            </div>
            <div className="bg-[#030810] border border-[#0f233d] rounded-xl p-4 space-y-1.5"><span className="text-[10px] font-extrabold text-[#00e5ff] uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={13} /> INSTITUTIONAL DIGITAL ASSET INFRASTRUCTURE</span><p className="text-xs text-gray-300 leading-relaxed font-normal">Dollar Craft is a premier institutional digital asset yield protocol and global investment provider. Built on sub-second precision calculation engines (26-decimal BigNumber) and multi-jurisdictional custody infrastructure, Dollar Craft serves individual and corporate clients across <strong>7 global financial hubs</strong>.</p></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs"><span className="font-extrabold text-[#00e5ff] uppercase tracking-wider flex items-center gap-1 text-[11px]"><Globe size={13} /> REGISTERED & OPERATING JURISDICTIONS</span><span className="text-[9px] text-[#00ff88] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">7 Active Hubs</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GLOBAL_HUBS.map((hub) => (
                  <div key={hub.country} className="bg-[#030810] border border-[#0f233d] p-3 rounded-xl text-center space-y-1 flex flex-col items-center justify-center">
                    <img src={`https://flagcdn.com/w80/${hub.code}.png`} alt={hub.country} className="w-8 h-5 object-cover rounded shadow border border-[#10243e]" /><div className="font-bold text-xs text-white">{hub.country}</div><span className="text-[8px] text-[#00ff88] font-mono-finance block">REGULATED</span><span className="text-[8px] text-gray-500 font-mono-finance block truncate w-full">{hub.reg}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#0b1b30] text-xs">
              <div className="flex items-center gap-1 text-gray-400 text-[11px]"><ShieldCheck size={13} className="text-[#00e5ff]" /><span>Quarterly audit compliance & verified proof of reserves.</span></div>
              <button onClick={() => setAboutModalOpen(false)} className="bg-[#08182d] hover:bg-[#0c223e] text-white text-xs font-bold px-4 py-1.5 rounded-lg uppercase">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: HISTORY ================= */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050e1c] border border-[#10243e] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#0b1b30] pb-3">
              <h3 className="font-extrabold text-base text-white">Withdrawal Records</h3>
              <button onClick={() => setHistoryModalOpen(false)} className="text-gray-400 hover:text-white font-bold text-xs">✕</button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {withdrawHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs font-bold">No withdrawal history recorded yet.</div>
              ) : (
                withdrawHistory.map((tx) => (
                  <div key={tx.id} className="bg-[#030810] border border-[#0f233d] p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-white font-mono-finance text-sm">${tx.amount} <span className="text-[9px] text-[#00e5ff] font-sans">({tx.gateway})</span></div>
                      <div className="text-[9px] text-gray-500 font-mono-finance mt-0.5">{tx.date} • {tx.id}</div>
                    </div>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                      tx.status === 'APPROVED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : tx.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-[#ffb700] border border-amber-500/30'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}