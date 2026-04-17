/**
 * FocusForge — Session Engine
 * Person 1 Deliverable: Timer + Session Logic
 *
 * Pure JS module. Zero DOM dependencies.
 * Drop this file into any part of the project and call the API.
 *
 * USAGE:
 *   const engine = new SessionEngine({ workMinutes: 25, shortBreak: 5, longBreak: 15, cycles: 4 });
 *   engine.onTick(state => renderTimer(state));
 *   engine.onSessionEnd(state => showNotification(state));
 *   engine.start();
 */

const SESSION_TYPES = {
  WORK:        'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK:  'long_break',
};

const ENGINE_STATES = {
  IDLE:    'idle',
  RUNNING: 'running',
  PAUSED:  'paused',
  ENDED:   'ended',
};

class SessionEngine {
  constructor(config = {}) {
    this.config = {
      workMinutes:    config.workMinutes    ?? 25,
      shortBreak:     config.shortBreak     ?? 5,
      longBreak:      config.longBreak      ?? 15,
      cycles:         config.cycles         ?? 4,   // work sessions before long break
      tickInterval:   config.tickInterval   ?? 1000, // ms
    };

    // Callbacks — set via .onTick(), .onSessionEnd(), .onPhaseChange()
    this._callbacks = {
      tick:          [],
      sessionEnd:    [],
      phaseChange:   [],
      cycleComplete: [],
    };

    this._intervalId     = null;
    this._startTimestamp = null; // Date.now() when the current run segment began
    this._elapsed        = 0;   // ms already ticked before this run segment (for pause support)

    this._state = this._freshState();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Start or resume the timer */
  start() {
    if (this._state.engineState === ENGINE_STATES.RUNNING) return;

    this._state.engineState  = ENGINE_STATES.RUNNING;
    this._startTimestamp     = Date.now();
    this._intervalId         = setInterval(() => this._tick(), this.config.tickInterval);
  }

  /** Pause a running timer */
  pause() {
    if (this._state.engineState !== ENGINE_STATES.RUNNING) return;

    this._elapsed           += Date.now() - this._startTimestamp;
    this._startTimestamp     = null;
    this._state.engineState  = ENGINE_STATES.PAUSED;
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._emit('tick', this.getState()); // push paused state to UI
  }

  /** Resume a paused timer (alias for start — same logic) */
  resume() {
    this.start();
  }

  /** Toggle between running and paused */
  toggle() {
    if (this._state.engineState === ENGINE_STATES.RUNNING) {
      this.pause();
    } else {
      this.start();
    }
  }

  /** Full reset — clears everything back to initial state */
  reset() {
    clearInterval(this._intervalId);
    this._intervalId     = null;
    this._startTimestamp = null;
    this._elapsed        = 0;
    this._state          = this._freshState();
    this._emit('tick', this.getState());
  }

  /** Skip current phase and jump to the next one immediately */
  skip() {
    this._advancePhase();
  }

  /** Update config at runtime (e.g. user changes work duration in settings) */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // If idle, reset so new durations take effect cleanly
    if (this._state.engineState === ENGINE_STATES.IDLE) {
      this.reset();
    }
  }

  /**
   * Returns a plain snapshot of the current engine state.
   * This is what your teammates should read to render the UI.
   */
  getState() {
    const totalMs      = this._phaseDurationMs();
    const elapsedMs    = this._currentElapsedMs();
    const remainingMs  = Math.max(0, totalMs - elapsedMs);
    const progress     = Math.min(1, elapsedMs / totalMs); // 0–1

    return {
      engineState:      this._state.engineState,          // 'idle' | 'running' | 'paused' | 'ended'
      sessionType:      this._state.sessionType,          // 'work' | 'short_break' | 'long_break'
      cyclesCompleted:  this._state.cyclesCompleted,      // number of full work sessions done
      totalCycles:      this.config.cycles,
      remainingMs,
      elapsedMs,
      totalMs,
      progress,                                           // 0.0 → 1.0 for progress ring/bar
      // Convenience formatted strings
      display: {
        minutes: String(Math.floor(remainingMs / 60000)).padStart(2, '0'),
        seconds: String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0'),
      },
      // Lifetime stats
      stats: { ...this._state.stats },
    };
  }

  // ─── Callback Registration ─────────────────────────────────────────────────

  /** Called every tick (~1s) with the current state snapshot */
  onTick(fn)          { this._callbacks.tick.push(fn);          return this; }

  /** Called when a session (work or break) ends */
  onSessionEnd(fn)    { this._callbacks.sessionEnd.push(fn);    return this; }

  /** Called when the phase switches (work → break or break → work) */
  onPhaseChange(fn)   { this._callbacks.phaseChange.push(fn);   return this; }

  /** Called when a full pomodoro cycle (N work + breaks) completes */
  onCycleComplete(fn) { this._callbacks.cycleComplete.push(fn); return this; }

  // ─── Internal ──────────────────────────────────────────────────────────────

  _tick() {
    const elapsedMs = this._currentElapsedMs();
    const totalMs   = this._phaseDurationMs();

    this._emit('tick', this.getState());

    if (elapsedMs >= totalMs) {
      this._onPhaseComplete();
    }
  }

  _onPhaseComplete() {
    clearInterval(this._intervalId);
    this._intervalId        = null;
    this._state.engineState = ENGINE_STATES.ENDED;

    // Update stats
    if (this._state.sessionType === SESSION_TYPES.WORK) {
      this._state.stats.totalWorkMs   += this._phaseDurationMs();
      this._state.stats.totalSessions += 1;
    } else {
      this._state.stats.totalBreakMs  += this._phaseDurationMs();
    }

    this._emit('sessionEnd', this.getState());
    this._advancePhase();
  }

  _advancePhase() {
    clearInterval(this._intervalId);
    this._intervalId     = null;
    this._startTimestamp = null;
    this._elapsed        = 0;

    const wasWork = this._state.sessionType === SESSION_TYPES.WORK;

    if (wasWork) {
      this._state.cyclesCompleted += 1;

      const isLongBreak = this._state.cyclesCompleted % this.config.cycles === 0;

      if (isLongBreak) {
        this._state.sessionType = SESSION_TYPES.LONG_BREAK;
        this._emit('cycleComplete', this.getState());
      } else {
        this._state.sessionType = SESSION_TYPES.SHORT_BREAK;
      }
    } else {
      this._state.sessionType = SESSION_TYPES.WORK;
    }

    this._state.engineState = ENGINE_STATES.IDLE;
    this._emit('phaseChange', this.getState());
    this._emit('tick', this.getState()); // push updated display
  }

  _currentElapsedMs() {
    if (this._state.engineState !== ENGINE_STATES.RUNNING) return this._elapsed;
    return this._elapsed + (Date.now() - this._startTimestamp);
  }

  _phaseDurationMs() {
    const mins = {
      [SESSION_TYPES.WORK]:        this.config.workMinutes,
      [SESSION_TYPES.SHORT_BREAK]: this.config.shortBreak,
      [SESSION_TYPES.LONG_BREAK]:  this.config.longBreak,
    }[this._state.sessionType] ?? this.config.workMinutes;
    return mins * 60 * 1000;
  }

  _emit(event, payload) {
    (this._callbacks[event] || []).forEach(fn => {
      try { fn(payload); } catch (e) { console.error(`[SessionEngine] callback error (${event}):`, e); }
    });
  }

  // ─── State ─────────────────────────────────────────────────────────────────

  _freshState() {
    return {
      engineState:     ENGINE_STATES.IDLE,
      sessionType:     SESSION_TYPES.WORK,
      cyclesCompleted: 0,
      stats: {
        totalWorkMs:   0,
        totalBreakMs:  0,
        totalSessions: 0,
      },
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────
// ES module export (for teammates using import)
export { SessionEngine, SESSION_TYPES, ENGINE_STATES };
// CommonJS fallback
if (typeof module !== 'undefined') module.exports = { SessionEngine, SESSION_TYPES, ENGINE_STATES };