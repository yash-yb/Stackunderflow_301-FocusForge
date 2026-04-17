focusforge/
│
├── index.html
├── package.json (if using React/Node)
├── README.md
│
├── /public
│   ├── favicon.ico
│   └── assets/
│       ├── icons/
│       └── sounds/
│
├── /src
│   │
│   ├── /components          # UI Components (Person 3)
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
│   ├── /pages               # Main Screens
│   │   ├── Dashboard.js
│   │   └── Login.js
│   │
│   ├── /styles              # CSS / Tailwind
│   │   ├── main.css
│   │   └── animations.css
│   │
│   ├── /logic               # Core Logic (Person 1 & 2)
│   │   ├── timer.js
│   │   ├── xpSystem.js
│   │   ├── focusScore.js
│   │   ├── taskManager.js
│   │   └── sessionManager.js
│   │
│   ├── /services            # Integration (Person 4)
│   │   ├── distraction.js
│   │   ├── auth.js
│   │   ├── storage.js
│   │   └── notifications.js
│   │
│   ├── /utils
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── App.js
│   └── main.js (or index.js)
│
└── /backend (OPTIONAL if using Firebase)
    ├── firebaseConfig.js
    └── api.js
