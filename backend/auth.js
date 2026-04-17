// backend/auth.js
// Simple user authentication and registration using a JSON file.
// For demonstration only. Not secure for production use.

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  try {
    return JSON.parse(data).users || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}


function findUserByEmail(email) {
  return loadUsers().find(u => u.email === email);
}

function findUserByName(name) {
  return loadUsers().find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
}


function registerUser({ email, password, name }) {
  const users = loadUsers();
  if (users.find(u => u.email === email)) return { error: 'User already exists' };
  if (name && users.find(u => u.name && u.name.toLowerCase() === name.toLowerCase())) return { error: 'Name already taken' };
  const user = { email, password, name: name || null, level: 1, streak: 1 };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}


function loginUser({ name, password }) {
  const user = findUserByName(name);
  if (!user) return { error: 'User not found' };
  if (user.password !== password) return { error: 'Incorrect password' };
  // Always return the current level and streak (default 1 if missing)
  return { success: true, user: { ...user, level: user.level || 1, streak: user.streak || 1 } };
}

function updateUserName(email, name) {
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return { error: 'User not found' };
  user.name = name;
  saveUsers(users);
  return { success: true, user };
}

module.exports = { registerUser, loginUser, updateUserName, findUserByEmail, findUserByName };
