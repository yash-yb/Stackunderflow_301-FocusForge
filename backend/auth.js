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
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  return loadUsers().find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
}

function findUserByName(name) {
  if (!name) return null;
  const cleanName = name.trim().toLowerCase();
  return loadUsers().find(u => u.name && u.name.trim().toLowerCase() === cleanName);
}


function registerUser({ email, password, name }) {
  const users = loadUsers();
  if (users.find(u => u.email === email)) return { error: 'User already exists' };
  if (name && users.find(u => u.name && u.name.toLowerCase() === name.toLowerCase())) return { error: 'Name already taken' };
  const user = { 
    email, 
    password, 
    name: name || null, 
    level: 1, 
    streak: 1,
    focusTrend: [
      { name: "Mon", minutes: 0 },
      { name: "Tue", minutes: 0 },
      { name: "Wed", minutes: 0 },
      { name: "Thu", minutes: 0 },
      { name: "Fri", minutes: 0 },
      { name: "Sat", minutes: 0 },
      { name: "Sun", minutes: 0 }
    ]
  };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}


function loginUser({ name, password }) {
  console.log(`Login attempt for: ${name}`);
  // Allow login by either name or email
  const user = findUserByName(name) || findUserByEmail(name);
  
  if (!user) {
    console.log(`User not found: ${name}`);
    return { error: 'User not found' };
  }
  
  if (user.password !== password) {
    console.log(`Incorrect password for: ${name}`);
    return { error: 'Incorrect password' };
  }
  
  console.log(`Login successful: ${name}`);
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
