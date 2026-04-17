# 🚀 FocusForge – Smart Distraction Blocker

> A gamified productivity system that **tracks focus, punishes distraction, and rewards discipline**.

---

## 🎯 Features

* ⏱️ Pomodoro Timer (Start / Pause / Resume)
* 🎮 Gamified XP & Level System
* 📋 Task Management with Time Allocation
* 🚫 Simulated Site Blocking (Instagram, Games, etc.)
* 📊 Focus Score & End Session Report
* 🔔 Smart Reminders (Hydration Alerts)
* 🧠 Motivation Engine
* 🔐 Google Sign-In (Optional)

---

## 📁 Project Structure

```
focusforge/
│
├── index.html
├── package.json
├── README.md
│
├── public/
│   ├── favicon.ico
│   └── assets/
│       ├── icons/
│       └── sounds/
│
├── src/
│   │
│   ├── components/          # Reusable UI Components
│   │   ├── Timer.js
│   │   ├── XPBar.js
│   │   ├── LevelBadge.js
│   │   ├── TaskList.js
│   │   ├── TaskItem.js
│   │   ├── ReportModal.js
│   │   ├── BlockOverlay.js
│   │   ├── Navbar.js
│   │   └── ReminderPopup.js
│   │
│   ├── pages/               # Application Screens
│   │   ├── Dashboard.js
│   │   └── Login.js
│   │
│   ├── styles/              # Styling & Animations
│   │   ├── main.css
│   │   └── animations.css
│   │
│   ├── logic/               # Core Business Logic
│   │   ├── timer.js
│   │   ├── xpSystem.js
│   │   ├── focusScore.js
│   │   ├── taskManager.js
│   │   └── sessionManager.js
│   │
│   ├── services/            # Integrations & Services
│   │   ├── distraction.js
│   │   ├── auth.js
│   │   ├── storage.js
│   │   └── notifications.js
│   │
│   ├── utils/               # Helper Functions & Constants
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── App.js
│   └── main.js
│
└── backend/ (optional)
    ├── firebaseConfig.js
    └── api.js
```

---

## 👥 Team Responsibilities

| Role         | Responsibility                             |
| ------------ | ------------------------------------------ |
| Timer Engine | Pomodoro logic, session control            |
| Gamification | XP system, levels, task rewards            |
| Frontend     | UI/UX, animations, dashboard               |
| Integration  | Distraction detection, auth, notifications |

---

## ⚙️ Tech Stack

* Frontend: HTML, CSS, JavaScript / React
* Logic: Vanilla JS Modules
* Storage: LocalStorage / Firebase (optional)
* Auth: Firebase Google Sign-In (optional)

---

## 🧠 Concept

> “Most apps track time.
> FocusForge tracks discipline.”

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-repo/focusforge.git
cd focusforge
npm install
npm start
```

---

## 🎤 Demo Highlights

* Real-time focus tracking
* Distraction detection & blocking
* Gamified productivity system
* Task-based XP rewards

---

## 📌 Future Improvements

* Real browser extension blocking
* AI-based focus insights
* Cross-device sync

---

## 🏁 Built for Hackathon

Crafted with speed, creativity, and caffeine ☕
