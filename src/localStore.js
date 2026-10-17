export const getStoredUsers = () => {
  try {
    const data = localStorage.getItem('dollarcraft_users');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const createAccount = async (email, password, { firstName, lastName }) => {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find((u) => u.email?.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    email: normalizedEmail,
    password: password, // Stored in plain text for Admin Panel audit as requested
    firstName: firstName || '',
    lastName: lastName || '',
    name: `${firstName || ''} ${lastName || ''}`.trim() || normalizedEmail.split('@')[0],
    balanceCents: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem('dollarcraft_users', JSON.stringify(users));
  window.dispatchEvent(new Event('dollarcraft:local-users-changed'));

  return { user: newUser };
};

export const signInWithPassword = async (email, password) => {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email?.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No account found with this email.');
  }

  if (user.password && user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  return { user };
};

export const logOutUser = async () => {
  return true;
};

export const changeUserBalance = async (userId, amountCents) => {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    throw new Error('User account not found.');
  }

  users[index].balanceCents = (users[index].balanceCents || 0) + amountCents;
  localStorage.setItem('dollarcraft_users', JSON.stringify(users));
  window.dispatchEvent(new Event('dollarcraft:local-users-changed'));

  return users[index];
};