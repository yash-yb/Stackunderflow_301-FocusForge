import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Owl } from "@/components/Owl";
import { Clouds } from "@/components/Clouds";
import {
  FocusState,
  Task,
  TASK_XP,
  applyXp,
  defaultState,
  levelTitle,
  loadState,
  saveState,
  xpForLevel,
} from "@/lib/storage";

const ACHIEVEMENTS = [
  { title: "First Spark", desc: "Complete your first session" },
  { title: "Consistent", desc: "Reach a 3-day streak" },
  { title: "Deep Work", desc: "Finish a 60-min session" },
  { title: "Focus Master", desc: "Reach Level 10" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<FocusState>(defaultState);
  const [taskInput, setTaskInput] = useState("");
  const [durationInput, setDurationInput] = useState("25");
  const [pulseId, setPulseId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.loggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    setState(s);
    setDurationInput(String(s.duration));
  }, [navigate]);

  const update = (patch: Partial<FocusState>) => {
    const next = { ...state, ...patch };
    setState(next);
    saveState(next);
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const title = taskInput.trim();
    if (!title) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      done: false,
      createdAt: Date.now(),
    };
    update({ tasks: [task, ...state.tasks] });
    setTaskInput("");
  };

  const toggleTask = (id: string) => {
    const target = state.tasks.find((t) => t.id === id);
    if (!target) return;
    const willComplete = !target.done;
    const tasks = state.tasks.map((t) =>
      t.id === id ? { ...t, done: willComplete } : t
    );
    let next: FocusState = { ...state, tasks };
    if (willComplete) {
      next = applyXp(next, TASK_XP);
      setPulseId(id);
      setTimeout(() => setPulseId(null), 600);
    }
    setState(next);
    saveState(next);
  };

  const removeTask = (id: string) => {
    update({ tasks: state.tasks.filter((t) => t.id !== id) });
  };

  const commitDuration = () => {
    const n = Math.max(1, Math.min(240, Number(durationInput) || 25));
    setDurationInput(String(n));
    update({ duration: n });
  };

  const xpNeeded = xpForLevel(state.level);
  const xpPct = Math.min(100, (state.xp / xpNeeded) * 100);
  const completedCount = state.tasks.filter((t) => t.done).length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Clouds />
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in-up">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {state.name || "Focuser"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <span className="flame text-xl">🔥</span>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">
                  Streak
                </p>
                <p className="text-lg font-semibold leading-none mt-1">
                  {state.streak} <span className="text-xs text-muted-foreground font-normal">days</span>
                </p>
              </div>
            </div>
            <button
              className="btn-secondary ml-2"
              onClick={() => {
                saveState({ ...defaultState });
                navigate("/login", { replace: true });
              }}
            >
              Log out
            </button>
          </div>
        </div>

        {/* XP Card */}
        <div className="glass-card p-6 mb-8 fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-glow/90">
                Level {state.level} · {levelTitle(state.level)}
              </p>
              <h2 className="text-2xl font-semibold mt-1">Keep building momentum</h2>
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {state.xp} / {xpNeeded} XP
            </p>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${xpPct}%`,
                background: "var(--gradient-xp)",
                boxShadow: "0 0 16px hsl(217 91% 55% / 0.6)",
              }}
            />
          </div>
        </div>

        {/* Tasks */}
        <section className="mb-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Tasks
              </h3>
              <p className="text-sm text-muted-foreground/80 mt-1">
                +{TASK_XP} XP for each completed task
              </p>
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {completedCount} / {state.tasks.length} done
            </p>
          </div>

          <div className="glass-card p-5">
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Add a task…"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary px-5">
                Add
              </button>
            </form>

            {state.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks yet. Add one to start earning XP.
              </p>
            ) : (
              <ul className="space-y-2">
                {state.tasks.map((t) => (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition group ${
                      pulseId === t.id ? "task-complete-anim" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(t.id)}
                      aria-label={t.done ? "Mark incomplete" : "Complete task"}
                      className={`shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition ${
                        t.done
                          ? "bg-primary border-primary"
                          : "border-white/20 hover:border-primary/60"
                      }`}
                    >
                      {t.done && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        t.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {t.title}
                    </span>
                    <button
                      onClick={() => removeTask(t.id)}
                      aria-label="Remove task"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Duration */}
        <section className="mb-8 fade-in-up" style={{ animationDelay: "0.15s" }}>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Session Duration
          </h3>
          <div className="glass-card p-5 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={240}
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              onBlur={commitDuration}
              className="input-field w-32 tabular-nums"
            />
            <span className="text-sm text-muted-foreground">minutes (1–240)</span>
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-10 fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = state.achievements?.includes(a.title);
              return (
                <div
                  key={a.title}
                  className={`glass-card p-4 transition-opacity ${unlocked ? '' : 'opacity-40 grayscale'}`}
                  title={unlocked ? 'Unlocked' : 'Locked'}
                >
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  {unlocked && <span className="text-green-400 text-xs font-bold">Unlocked</span>}
                </div>
              );
            })}
          </div>
        </section>

        <button
          onClick={() => navigate("/timer")}
          className="btn-primary w-full text-base fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          Begin Focus Session
        </button>
      </main>

      <div className="fixed bottom-6 right-6 z-10 hidden md:block">
        <Owl state="idle" size={104} />
      </div>
    </div>
  );
};

export default Dashboard;
