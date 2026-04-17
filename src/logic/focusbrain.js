/**
 * FocusForge Brain — focusforge-brain.js
 * Pure logic module. No DOM. No UI.
 * Import and wire up to whatever frontend you build.
 *
 * Usage:
 *   import FocusForge from './focusforge-brain.js';
 *   const ff = new FocusForge();
 *   ff.on('xp:gained', ({ amount, total }) => updateXPBar(total));
 *   ff.timer.start();
 */

class FocusForge {
  // ─── Constants ────────────────────────────────────────────────────────────

  static LEVELS = [
    { name: 'Novice',     minXP: 0,    nextXP: 100  },
    { name: 'Apprentice', minXP: 100,  nextXP: 250  },
    { name: 'Focused',    minXP: 250,  nextXP: 500  },
    { name: 'Scholar',    minXP: 500,  nextXP: 1000 },
    { name: 'Master',     minXP: 1000, nextXP: 2000 },
    { name: 'Legend',     minXP: 2000, nextXP: Infinity },
  ];

  static TIMER_MODES = {
    pomodoro: { label: 'Focus',       seconds: 25 * 60 },
    short:    { label: 'Short Break', seconds: 5  * 60 },
    long:     { label: 'Long Break',  seconds: 15 * 60 },
  };

  static XP_RULES = {
    sessionComplete:  25,   // XP for finishing a pomodoro
    breakComplete:    5,    // XP for finishing a break (optional, your call)
    taskByMins: {           // XP reward based on task estimated time
      5:  10,
      15: 20,
      25: 30,
      50: 50,
    },
  };

  static MISSIONS = [
    { id: 'first_focus',   name: 'First Focus',   desc: 'Complete 1 pomodoro',          xp: 50,  check: (s) => s.sessions >= 1 },
    { id: 'task_crusher',  name: 'Task Crusher',  desc: 'Complete 3 tasks on time',     xp: 75,  check: (s) => s.timedTasksDone >= 3 },
    { id: 'deep_work',     name: 'Deep Work',     desc: 'Complete 4 pomodoros',         xp: 150, check: (s) => s.totalCycles >= 4 },
    { id: 'streak_3',      name: 'On a Roll',     desc: 'Reach a streak of 3',          xp: 60,  check: (s) => s.streak >= 3 },
    { id: 'task_5',        name: 'Busy Bee',      desc: 'Complete 5 tasks total',       xp: 100, check: (s) => s.tasksCompleted >= 5 },
  ];

  // ─── Constructor ──────────────────────────────────────────────────────────

  constructor({ persist = true } = {}) {
    this._listeners = {};
    this._persist   = persist;

    // Core state
    this.state = this._loadState();

    // Timer sub-module
    this.timer = this._createTimer();

    // Emit ready
    this._emit('ready', this._publicState());
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Subscribe to events. Returns unsubscribe function. */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => { this._listeners[event] = this._listeners[event].filter(f => f !== fn); };
  }

  /** Add a task. Returns the created task object. */
  addTask(name, estimatedMins = 25) {
    const validMins  = this._closestTaskMins(estimatedMins);
    const xpReward   = FocusForge.XP_RULES.taskByMins[validMins];
    const task = {
      id:           `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name:         String(name).trim(),
      estimatedMins: validMins,
      xpReward,
      done:         false,
      createdAt:    Date.now(),
      completedAt:  null,
    };
    this.state.tasks.push(task);
    this._save();
    this._emit('task:added', { task, tasks: this._tasks() });
    return task;
  }

  /** Mark a task complete. Awards XP. */
  completeTask(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task || task.done) return null;

    task.done        = true;
    task.completedAt = Date.now();

    this.state.tasksCompleted++;
    if (task.estimatedMins <= 25) this.state.timedTasksDone++;

    this._gainXP(task.xpReward, 'task');
    this._save();
    this._emit('task:completed', { task, tasks: this._tasks() });
    this._checkMissions();
    return task;
  }

  /** Remove a task (incomplete or complete). */
  removeTask(taskId) {
    const before = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    if (this.state.tasks.length < before) {
      this._save();
      this._emit('task:removed', { taskId, tasks: this._tasks() });
    }
  }

  /** Add a site to the simulated block list. */
  blockSite(domain) {
    const cleaned = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    if (!this.state.blockedSites.includes(cleaned)) {
      this.state.blockedSites.push(cleaned);
      this._save();
      this._emit('sites:updated', { blockedSites: [...this.state.blockedSites] });
    }
    return cleaned;
  }

  /** Remove a site from the block list. */
  unblockSite(domain) {
    const cleaned = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    this.state.blockedSites = this.state.blockedSites.filter(s => s !== cleaned);
    this._save();
    this._emit('sites:updated', { blockedSites: [...this.state.blockedSites] });
  }

  /** Returns true if a URL/domain is in the block list (for your overlay logic). */
  isSiteBlocked(url) {
    const cleaned = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    return this.state.blockedSites.some(s => cleaned === s || cleaned.endsWith('.' + s));
  }

  /** Get a snapshot of the full public state. */
  getState() {
    return this._publicState();
  }

  /** Wipe all state and start fresh. */
  reset() {
    this.timer.reset();
    this.state = this._defaultState();
    this._save();
    this._emit('state:reset', this._publicState());
  }

  // ─── Timer sub-module ─────────────────────────────────────────────────────

  _createTimer() {
    const self    = this;
    let _interval = null;

    const tm = {
      mode:      'pomodoro',
      running:   false,
      remaining: FocusForge.TIMER_MODES.pomodoro.seconds,
      total:     FocusForge.TIMER_MODES.pomodoro.seconds,
      cyclePos:  0,           // 0-3 within current 4-pomodoro block

      /** Switch mode: 'pomodoro' | 'short' | 'long' */
      setMode(mode) {
        if (!FocusForge.TIMER_MODES[mode]) throw new Error(`Unknown mode: ${mode}`);
        this.reset();
        this.mode      = mode;
        this.total     = FocusForge.TIMER_MODES[mode].seconds;
        this.remaining = this.total;
        self._emit('timer:modeChanged', this._snap());
      },

      start() {
        if (this.running) return;
        this.running = true;
        _interval = setInterval(() => {
          if (this.remaining <= 0) {
            clearInterval(_interval);
            _interval      = null;
            this.running   = false;
            this._onComplete();
            return;
          }
          this.remaining--;
          self._emit('timer:tick', this._snap());
        }, 1000);
        self._emit('timer:started', this._snap());
      },

      pause() {
        if (!this.running) return;
        clearInterval(_interval);
        _interval    = null;
        this.running = false;
        self._emit('timer:paused', this._snap());
      },

      reset() {
        clearInterval(_interval);
        _interval      = null;
        this.running   = false;
        this.remaining = this.total;
        self._emit('timer:reset', this._snap());
      },

      _onComplete() {
        if (this.mode === 'pomodoro') {
          self.state.sessions++;
          self.state.streak++;
          self.state.totalCycles++;
          this.cyclePos = (this.cyclePos + 1) % 4;
          self._gainXP(FocusForge.XP_RULES.sessionComplete, 'session');
          self._checkMissions();
          self._save();
          self._emit('timer:sessionComplete', {
            ...this._snap(),
            sessions:    self.state.sessions,
            streak:      self.state.streak,
            totalCycles: self.state.totalCycles,
          });
        } else {
          self._gainXP(FocusForge.XP_RULES.breakComplete, 'break');
          self._emit('timer:breakComplete', this._snap());
        }
      },

      /** Formatted mm:ss string — convenience for your UI. */
      formatted() {
        const m = Math.floor(this.remaining / 60);
        const s = this.remaining % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      },

      /** 0-1 progress fraction (for ring/bar rendering). */
      progress() {
        return 1 - (this.remaining / this.total);
      },

      _snap() {
        return {
          mode:      this.mode,
          running:   this.running,
          remaining: this.remaining,
          total:     this.total,
          formatted: this.formatted(),
          progress:  this.progress(),
          cyclePos:  this.cyclePos,
          label:     FocusForge.TIMER_MODES[this.mode].label,
        };
      },
    };

    return tm;
  }

  // ─── XP + Level ───────────────────────────────────────────────────────────

  _gainXP(amount, source = 'unknown') {
    const prevLevel = this._currentLevelIndex();
    this.state.xp  += amount;
    const newLevel  = this._currentLevelIndex();

    this._emit('xp:gained', {
      amount,
      source,
      total: this.state.xp,
      level: this._levelInfo(),
    });

    if (newLevel > prevLevel) {
      this._emit('level:up', {
        level:     newLevel + 1,
        levelName: FocusForge.LEVELS[newLevel].name,
        xp:        this.state.xp,
      });
    }
  }

  _currentLevelIndex() {
    for (let i = FocusForge.LEVELS.length - 1; i >= 0; i--) {
      if (this.state.xp >= FocusForge.LEVELS[i].minXP) return i;
    }
    return 0;
  }

  _levelInfo() {
    const i   = this._currentLevelIndex();
    const cur = FocusForge.LEVELS[i];
    const nxt = FocusForge.LEVELS[Math.min(i + 1, FocusForge.LEVELS.length - 1)];
    const pct = i === FocusForge.LEVELS.length - 1
      ? 100
      : Math.round(((this.state.xp - cur.minXP) / (cur.nextXP - cur.minXP)) * 100);
    return {
      index:     i,
      number:    i + 1,
      name:      cur.name,
      nextName:  nxt.name,
      xp:        this.state.xp,
      currentXP: cur.minXP,
      nextXP:    cur.nextXP,
      percent:   pct,
    };
  }

  // ─── Focus Score ──────────────────────────────────────────────────────────

  _focusScore() {
    const sessScore = Math.min(this.state.sessions * 10, 40);
    const taskScore = Math.min(this.state.tasksCompleted * 5, 40);
    const strScore  = Math.min(this.state.streak * 5, 20);
    return {
      total:       sessScore + taskScore + strScore,
      fromSessions: sessScore,
      fromTasks:    taskScore,
      fromStreak:   strScore,
    };
  }

  // ─── Missions ─────────────────────────────────────────────────────────────

  _checkMissions() {
    FocusForge.MISSIONS.forEach(mission => {
      const alreadyDone = this.state.completedMissions.includes(mission.id);
      if (!alreadyDone && mission.check(this.state)) {
        this.state.completedMissions.push(mission.id);
        this._gainXP(mission.xp, 'mission');
        this._save();
        this._emit('mission:complete', { mission, completedMissions: [...this.state.completedMissions] });
      }
    });
  }

  missionsStatus() {
    return FocusForge.MISSIONS.map(m => ({
      ...m,
      completed: this.state.completedMissions.includes(m.id),
    }));
  }

  // ─── Persistence ──────────────────────────────────────────────────────────

  _save() {
    if (!this._persist) return;
    try {
      localStorage.setItem('focusforge_state', JSON.stringify(this.state));
    } catch (_) {}
  }

  _loadState() {
    if (!this._persist) return this._defaultState();
    try {
      const raw = localStorage.getItem('focusforge_state');
      if (raw) return { ...this._defaultState(), ...JSON.parse(raw) };
    } catch (_) {}
    return this._defaultState();
  }

  _defaultState() {
    return {
      xp:                0,
      sessions:          0,
      streak:            0,
      totalCycles:       0,
      tasksCompleted:    0,
      timedTasksDone:    0,
      tasks:             [],
      blockedSites:      ['twitter.com', 'instagram.com', 'youtube.com'],
      completedMissions: [],
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _tasks() {
    return this.state.tasks.map(t => ({ ...t }));
  }

  _publicState() {
    return {
      xp:           this.state.xp,
      sessions:     this.state.sessions,
      streak:       this.state.streak,
      totalCycles:  this.state.totalCycles,
      level:        this._levelInfo(),
      focusScore:   this._focusScore(),
      tasks:        this._tasks(),
      blockedSites: [...this.state.blockedSites],
      missions:     this.missionsStatus(),
    };
  }

  _closestTaskMins(mins) {
    const valid = [5, 15, 25, 50];
    return valid.reduce((prev, curr) =>
      Math.abs(curr - mins) < Math.abs(prev - mins) ? curr : prev
    );
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
    (this._listeners['*']   || []).forEach(fn => fn(event, data));
  }
}

export default FocusForge;