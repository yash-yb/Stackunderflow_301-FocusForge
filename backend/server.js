// backend/server.js
// Minimal Express server for login/signup endpoints

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { registerUser, loginUser, updateUserName } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  const result = registerUser({ email, password, name });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ success: true, user: result.user });
});

// Login endpoint (by name)
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  const result = loginUser({ name, password });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ success: true, user: result.user });
});

// Update name endpoint
app.post('/update-name', (req, res) => {
  const { email, name } = req.body;
  const result = updateUserName(email, name);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ success: true, user: result.user });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
