# FocusForge – Smart Distraction Blocker

## 🚀 Overview
FocusForge is a lightweight, browser-based productivity tool designed to help students and developers maintain deep focus. Instead of actually blocking websites (which requires extensions or system-level permissions), it simulates restriction through visual overlays, timers, and behavioral nudges.

---

## 🎯 Core Objective
Enable users to:
- Enter distraction-free focus sessions
- Track productivity cycles
- Become aware of their distraction habits

---

## 🧠 Key Concept
FocusForge leverages **psychological interruption rather than technical restriction**. When users attempt to visit distracting sites, the app intervenes with a delay screen, reminders, or friction-based prompts.

---

## ⚙️ Features Breakdown

### ⏱️ 1. Focus Timer (Pomodoro-Based)
- Default: 25 min focus + 5 min break
- Customizable session durations
- Start / Pause / Reset controls

### 🚫 2. Distraction Simulation System
- User inputs a list of distracting websites (e.g., YouTube, Instagram)
- Instead of blocking:
  - Displays a **full-screen overlay warning**
  - Adds a **delay countdown (e.g., 10 seconds)** before allowing access
  - Shows motivational or guilt-trigger messages 😈

### 📊 3. Productivity Dashboard
- Total focus time
- Number of completed sessions
- Daily streak counter
- Simple graphs (optional if time permits)

### 🔔 4. Alerts & Feedback
- Session completion notification
- Break reminders
- Optional sound alerts

### 🎨 5. Minimal UI Design
- Clean, distraction-free interface
- Dark/light mode toggle
- Large timer display

---

## 🏗️ Technical Architecture

### Frontend
- HTML, CSS, JavaScript (Vanilla or React if fast enough)
- CSS animations for timer and overlays

### Storage
- LocalStorage for:
  - User preferences
  - Website list
  - Session data

### Core Logic Modules
1. Timer Engine
2. Overlay System
3. Data Tracker
4. UI Renderer

---

## 🔁 User Flow
1. User opens app
2. Adds distracting websites
3. Starts focus session
4. If user tries to visit a listed site:
   - Overlay appears
   - Countdown delay starts
5. Session completes → notification shown
6. Data updated in dashboard

---

## 💡 Innovation Angle
- No permissions, no extensions → purely behavioral control
- Introduces **friction instead of force**
- Can evolve into AI-based habit tracking in future

---

## ⏳ MVP Plan (12 Hours)

### Phase 1 (0–3 hrs)
- Basic UI + Timer

### Phase 2 (3–6 hrs)
- Input + store distraction list

### Phase 3 (6–9 hrs)
- Overlay simulation system

### Phase 4 (9–12 hrs)
- Dashboard + polish UI

---

## ⚠️ Limitations
- Cannot truly block websites
- Depends on user honesty/engagement
- Limited cross-tab control

---

## 🔮 Future Enhancements
- AI-based distraction prediction
- Browser extension version
- Gamification (points, levels)
- Social accountability system

---

## 🧪 Tech Stack Summary

### Core
- JavaScript (ES6+)
- Browser APIs:
  - setInterval
  - Date.now()
  - Page Visibility API (for tab switch detection)
  - Notifications API

### Frontend
- HTML + CSS (or React if time permits)

### Backend (Optional but Powerful)
- Node.js
- Express.js

### Storage
- LocalStorage *(primary for MVP)*
- MongoDB *(optional if backend is used)*

---

## 👥 Team Role Breakdown (Execution Plan)

### ⏱️ PERSON 1 — TIMER + SESSION ENGINE (CORE BACKBONE)
**Responsibility:** Core timing system that drives everything

**Tasks:**
- Pomodoro timer logic
- Start / Pause / Resume / Reset
- Track session time
- Trigger session end events

**Deliver:**
👉 Timer fully working and stable

---

### 🎮 PERSON 2 — GAMIFICATION + TASK SYSTEM (BRAIN)
**Responsibility:** Game mechanics + productivity structure

**Tasks:**
- XP system
- Level system
- Focus score calculation
- To-Do system:
  - Add task
  - Assign time
  - Mark complete
- XP rewards based on timing & completion

**Deliver:**
👉 App feels like a game with missions 🎯

---

### 🖥️ PERSON 3 — FRONTEND DESIGN (MOST IMPORTANT)
**Responsibility:** Visual experience (judge impact factor)

**Tasks:**
- Main dashboard UI:
  - Timer
  - XP bar
  - Level badge
  - Task list UI
- End report screen
- Animations:
  - XP gain
  - Level-up effects
- Clean dark theme

**Deliver:**
👉 Looks like a real startup product 🚀

---

### 🔗 PERSON 4 — DISTRACTION + INTEGRATION + AUTH (GLUE)
**Responsibility:** System integration + behavior control

**Tasks:**
- Tab switch detection
- Blocking overlay system
- Connect:
  - Timer ↔ XP ↔ Tasks ↔ UI
- Alerts:
  - Distraction warnings
  - Reminders
- Authentication:
  - Google login or local auth

**Deliver:**
👉 Everything works smoothly together ⚙️

---

## 🏁 Conclusion
FocusForge evolves from a simple blocker into a **behavior-driven productivity game**. By combining UI, real-time face detection, and gamification, it creates a system where focus is *rewarded* and distraction is *penalized* — without needing intrusive permissions.

