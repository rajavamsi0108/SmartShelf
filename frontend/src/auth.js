const USERS_KEY = "smartshelf_users";
const SESSION_KEY = "smartshelf_session";

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

export function hasAccounts() {
  return readUsers().length > 0;
}

export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function signUp(name, email, password) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email?.trim().toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this Gmail address already exists.");
  }
  const user = { name: name.trim(), email: normalizedEmail, password };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: normalizedEmail }));
}

export function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  if (users.length === 0) throw new Error("No account found. Choose Create an account below first.");
  const user = users.find((item) => item.email?.trim().toLowerCase() === normalizedEmail);
  if (!user) throw new Error("No account found for this Gmail address. Check the address or create an account.");
  if (user.password !== password) throw new Error("Incorrect password. Please try again.");
  const name = user.name || normalizedEmail.split("@")[0].replace(/[._-]+/g, " ");
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email: normalizedEmail }));
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}