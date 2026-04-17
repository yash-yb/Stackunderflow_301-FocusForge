import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clouds } from "@/components/Clouds";
import { Owl } from "@/components/Owl";
import { OwlNotification } from "@/components/OwlNotification";
import { loadState, saveState } from "@/lib/storage";

const MESSAGES = [
  "Stay hydrated",
  "Take a short break",
  "Keep going",
  "Maintain your focus",
  "Almost there",
];

const Timer = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const lastNotifyRef = useRef(0);
  const msgIndexRef = useRef(0);
  const startTasksDoneRef = useRef(0);

  useEffect(() => {
    const s = loadState();
    if (!s.loggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    const total = s.duration * 60;
    setDuration(total);
    setRemaining(total);
    startTasksDoneRef.current = s.tasks.filter((t) => t.done).length;
  }, [navigate]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          const s = loadState();
          const tasksNow = s.tasks.filter((t) => t.done).length;
          saveState({
            ...s,
            lastSessionTasksCompleted: Math.max(0, tasksNow - startTasksDoneRef.current),
          });
          setTimeout(() => navigate("/results"), 400);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, navigate]);

  useEffect(() => {
    if (!running || duration < 60 * 60) return;
    const elapsed = duration - remaining;
    if (elapsed > 0 && elapsed % (20 * 60) === 0 && lastNotifyRef.current !== elapsed) {
      lastNotifyRef.current = elapsed;
      setNotification(MESSAGES[msgIndexRef.current % MESSAGES.length]);
      msgIndexRef.current++;
    }
  }, [remaining, running, duration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = duration > 0 ? remaining / duration : 0;

  const radius = 130;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);

  const owlState: "idle" | "focused" | "stressed" =
    running && remaining <= 60 ? "stressed" : running ? "focused" : "idle";

  const handleReset = () => {
    setRunning(false);
    setRemaining(duration);
    lastNotifyRef.current = 0;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Clouds />
      <OwlNotification message={notification} onDone={() => setNotification(null)} />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-6 left-6 glass-button px-4 py-2 text-sm"
        >
          ← Back
        </button>

        <div className="relative">
          <svg width="320" height="320" viewBox="0 0 320 320" className="-rotate-90">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(213 94% 68%)" />
                <stop offset="100%" stopColor="hsl(224 76% 38%)" />
              </linearGradient>
            </defs>
            <circle cx="160" cy="160" r={radius} fill="none" stroke="hsl(222 30% 14%)" strokeWidth="12" />
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{
                transition: "stroke-dashoffset 1s linear",
                filter: "drop-shadow(0 0 12px hsl(217 91% 55% / 0.6))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {running ? "Focusing" : "Ready"}
            </p>
            <p className="text-7xl font-semibold gradient-text tabular-nums mt-2">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-12">
          {!running ? (
            <button onClick={() => setRunning(true)} className="btn-primary px-8">
              {remaining === duration ? "Start" : "Resume"}
            </button>
          ) : (
            <button onClick={() => setRunning(false)} className="btn-primary px-8">
              Pause
            </button>
          )}
          <button onClick={handleReset} className="glass-button px-8 py-3 font-semibold">
            Reset
          </button>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-10">
        <Owl state={owlState} size={104} />
      </div>
    </div>
  );
};

export default Timer;
