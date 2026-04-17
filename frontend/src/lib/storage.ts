export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export interface FocusState {
  name: string;
  email?: string;
  loggedIn: boolean;
  xp: number;
  level: number;
  streak: number;
  duration: number; // minutes
  tasks: Task[];
  lastSessionDate?: string;
  lastSessionTasksCompleted?: number;
  achievements?: string[];
}

const KEY = "focusforge-state";

export const defaultState: FocusState = {
  name: "",
  email: "",
  loggedIn: false,
  xp: 0,
  level: 1,
  streak: 0,
  duration: 25,
  tasks: [],
  achievements: [],
};

export const TASK_XP = 20;

export function loadState(): FocusState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed, tasks: parsed.tasks ?? [] };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state: FocusState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function xpForLevel(level: number) {
  return 100 + (level - 1) * 80;
}

export function levelTitle(level: number) {
  if (level >= 20) return "Focus Legend";
  if (level >= 10) return "Focus Master";
  if (level >= 5) return "Focus Knight";
  return "Focus Warrior";
}

export function applyXp(state: FocusState, earned: number): FocusState {
  let xp = state.xp + earned;
  let level = state.level;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
  }
  return { ...state, xp, level };
}
