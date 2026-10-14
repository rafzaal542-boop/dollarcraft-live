const LOCAL_ACCOUNTS_KEY = 'dollarcraft_global_users';
const LOCAL_SESSION_KEY = 'dollarcraft.localSession.v1';
const ADMIN_EMAIL = 'dollarcraft3@gmail.com';

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    let accounts = raw ? JSON.parse(raw) : [];
    
    // Ensure admin master entry is always present
    const hasAdmin = accounts.some(u => u.email?.toLowerCase() === ADMIN_EMAIL);
    if (!hasAdmin) {
      accounts.unshift({
        id: 'admin-master',
        email: ADMIN_EMAIL,
        name: 'Dollar Craft Admin',
        firstName: 'Dollar',
        lastName: 'Craft',
        createdAt: '2026-10-10T16:55:54.137Z',
        balanceCents: 0
      });
    }
    return accounts;
  } catch (e) {
    console.error("Error reading stored users:", e);
    return [{
      id: 'admin-master',
      email: ADMIN_EMAIL,
      name: 'Dollar Craft Admin',
      firstName: 'Dollar',
      lastName: 'Craft',
      createdAt: '2026-10-10T16:55:54.137Z',
      balanceCents: 0
    }];
  }
};

export const createAccount = async (email, password, profile) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const firstName = (profile?.firstName || '').trim();
    const lastName = (profile?.lastName || '').trim();

    let allUsers = getStoredUsers();
    let accounts = allUsers.filter(u => u.id !== 'admin-master');

    if (accounts.some(account => account.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newAccount = {
      id: `local-${Date.now()}`,
      firstName: firstName || normalizedEmail.split('@')[0],
      lastName: lastName || '',
      name: `${firstName} ${lastName}`.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      balanceCents: 0
    };

    const adminEntry = {
      id: 'admin-master',
      email: ADMIN_EMAIL,
      name: 'Dollar Craft Admin',
      firstName: 'Dollar',
      lastName: 'Craft',
      createdAt: '2026-10-10T16:55:54.137Z',
      balanceCents: 0
    };

    const updatedAccounts = [newAccount, ...accounts];
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify([adminEntry, ...updatedAccounts]));
    localStorage.setItem(LOCAL_SESSION_KEY, newAccount.id);

    console.log("Account created successfully and saved to localStorage:", newAccount);

    return {
      user: {
        id: newAccount.id,
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        name: newAccount.name,
        email: newAccount.email,
        createdAt: newAccount.createdAt,
        balanceCents: newAccount.balanceCents,
        role: 'user'
      },
      isAdmin: false,
      isLocal: true
    };
  } catch (err) {
    console.error("Create account error:", err);
    throw err;
  }
};

export const signInWithPassword = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredUsers().filter(u => u.id !== 'admin-master');
  const account = accounts.find(item => item.email.toLowerCase() === normalizedEmail);

  if (!account || (account.password && account.password !== password)) {
    throw new Error('Incorrect email or password.');
  }

  localStorage.setItem(LOCAL_SESSION_KEY, account.id);

  return {
    user: {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      name: account.name,
      email: account.email,
      createdAt: account.createdAt,
      balanceCents: account.balanceCents,
      role: 'user'
    },
    isAdmin: false,
    isLocal: true
  };
};

export const getCurrentSession = async () => {
  const userId = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!userId) return { user: null, isAdmin: false, isLocal: true };
  
  const accounts = getStoredUsers();
  const account = accounts.find(item => item.id === userId);
  if (!account) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return { user: null, isAdmin: false, isLocal: true };
  }
  return {
    user: { ...account, role: 'user' },
    isAdmin: false,
    isLocal: true
  };
};

export const logOutUser = async () => {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  return true;
};

export const changeUserBalance = async (userId, changeInCents) => {
  let accounts = getStoredUsers().filter(u => u.id !== 'admin-master');
  const account = accounts.find(item => item.id === userId);
  if (!account) throw new Error('User account not found.');

  const balanceCents = (account.balanceCents || 0) + changeInCents;
  const updated = { ...account, balanceCents };
  
  const allAccounts = accounts.map(item => item.id === userId ? updated : item);
  const adminEntry = {
    id: 'admin-master',
    email: ADMIN_EMAIL,
    name: 'Dollar Craft Admin',
    firstName: 'Dollar',
    lastName: 'Craft',
    createdAt: '2026-10-10T16:55:54.137Z',
    balanceCents: 0
  };
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify([adminEntry, ...allAccounts]));

  return {
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    name: updated.name,
    email: updated.email,
    createdAt: updated.createdAt,
    balanceCents: updated.balanceCents
  };
};