// src/services/auth.ts
// Handles API calls to backend for login/signup

export async function login(name: string, password: string) {
  const res = await fetch('http://localhost:4000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

export async function signup(email: string, password: string, name?: string) {
  const res = await fetch('http://localhost:4000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
  return res.json();
}

export async function updateName(email: string, name: string) {
  const res = await fetch('http://localhost:4000/update-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
  return res.json();
}

export async function getUser(email: string) {
  const res = await fetch(`http://localhost:4000/user/${email}`);
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch user');
  return res.json();
}
