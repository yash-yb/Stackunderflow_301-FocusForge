import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Starfield } from "@/components/Starfield";
import { Owl } from "@/components/Owl";
import { loadState, saveState } from "@/lib/storage";
import { updateName as apiUpdateName } from "@/services/auth";

const Landing = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    const s = loadState();
    if (!s.loggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (s.name) setName(s.name);
  }, [navigate]);

  const [saving, setSaving] = useState(false);
  const handleStart = async () => {
    const trimmed = name.trim() || "Focuser";
    const s = loadState();
    saveState({ ...s, name: trimmed });
    if (s.email) {
      setSaving(true);
      try {
        await apiUpdateName(s.email, trimmed);
      } catch {
        // ignore error for now
      }
      setSaving(false);
    }
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield count={120} />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="fade-in-up">
          <p className="text-xs uppercase tracking-[0.45em] text-primary-glow/80 mb-5">
            Welcome to
          </p>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight gradient-text mb-5">
            FocusForge
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base md:text-lg">
            A calmer, sharper way to deep work. Set a session, complete tasks, build streaks.
          </p>
        </div>

        <div className="fade-in-up w-full max-w-sm space-y-3" style={{ animationDelay: "0.15s" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Your name (optional)"
            className="input-field"
          />
          <button onClick={handleStart} className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving..." : "Start Focus Session"}
          </button>
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-10 float-y hidden md:block">
        <Owl state="wave" size={120} />
      </div>
    </div>
  );
};

export default Landing;
