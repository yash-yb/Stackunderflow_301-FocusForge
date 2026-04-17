import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Starfield } from "@/components/Starfield";
import { Owl } from "@/components/Owl";
import {
  FocusState,
  applyXp,
  defaultState,
  loadState,
  saveState,
  xpForLevel,
} from "@/lib/storage";
import { recordFocusSession } from "@/services/auth";

const Results = () => {
  const navigate = useNavigate();
  const [pre, setPre] = useState<FocusState>(defaultState);
  const [post, setPost] = useState<FocusState>(defaultState);
  const [animatedXp, setAnimatedXp] = useState(0);
  const xpEarnedRef = useRef(0);
  const tasksCompletedRef = useRef(0);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    const s = loadState();
    setPre(s);

    // Session XP: 1 XP per minute baseline (clean, non-childish)
    const earned = Math.max(10, Math.round(s.duration));
    xpEarnedRef.current = earned;
    tasksCompletedRef.current = s.lastSessionTasksCompleted ?? 0;

    let next = applyXp(s, earned);

    // Achievements logic
    let achievements = Array.isArray(s.achievements) ? [...s.achievements] : [];
    // First Spark: Complete first session
    if (!achievements.includes("First Spark")) {
      achievements.push("First Spark");
    }
    // Consistent: Reach a 3-day streak
    if (next.streak >= 3 && !achievements.includes("Consistent")) {
      achievements.push("Consistent");
    }
    // Deep Work: Finish a 60-min session
    if (s.duration >= 60 && !achievements.includes("Deep Work")) {
      achievements.push("Deep Work");
    }
    // Focus Master: Reach Level 10
    if (next.level >= 10 && !achievements.includes("Focus Master")) {
      achievements.push("Focus Master");
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = next.streak;
    if (s.lastSessionDate === today) {
      // unchanged
    } else if (s.lastSessionDate === yesterday) {
      newStreak = next.streak + 1;
    } else {
      newStreak = 1;
    }

    next = { ...next, streak: newStreak, lastSessionDate: today, achievements };
    saveState(next);
    setPost(next);

    // Record focused minutes in backend
    if (next.email && s.duration > 0) {
      recordFocusSession(next.email, Math.round(s.duration))
        .catch(err => console.error("Failed to record focus session:", err));
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#1d4ed8", "#60a5fa", "#93c5fd"],
      scalar: 0.9,
    });

    let n = 0;
    const step = Math.max(1, Math.round(earned / 40));
    const id = setInterval(() => {
      n += step;
      if (n >= earned) {
        n = earned;
        clearInterval(id);
      }
      setAnimatedXp(n);
    }, 25);
    return () => clearInterval(id);
  }, []);

  const xpNeeded = xpForLevel(post.level);
  const xpPct = Math.min(100, (post.xp / xpNeeded) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield count={90} />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="fade-in-up">
          <p className="text-xs uppercase tracking-[0.4em] text-primary-glow mb-3">
            Session Complete
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight gradient-text mb-2">
            +{animatedXp} XP
          </h1>
          <p className="text-muted-foreground">
            Nice work{post.name ? `, ${post.name}` : ""}.
          </p>
        </div>

        <div className="glass-card p-6 mt-8 w-full max-w-md fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Level {post.level}</span>
            <span className="text-muted-foreground tabular-nums">
              {post.xp} / {xpNeeded} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${xpPct}%`,
                background: "var(--gradient-xp)",
                boxShadow: "0 0 16px hsl(217 91% 55% / 0.6)",
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Stat label="Duration" value={`${pre.duration}m`} />
            <Stat label="XP Gained" value={`+${xpEarnedRef.current}`} />
            <Stat label="Tasks" value={String(tasksCompletedRef.current)} />
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 text-sm text-muted-foreground">
            <span className="flame">🔥</span>
            <span>Streak: <span className="text-foreground font-medium">{post.streak} days</span></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-md fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button onClick={() => navigate("/timer")} className="btn-primary flex-1">
            Start Next Session
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="glass-button flex-1 px-6 py-3 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-10 float-y hidden md:block">
        <Owl state="happy" size={110} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold mt-1 tabular-nums">{value}</p>
  </div>
);

export default Results;
