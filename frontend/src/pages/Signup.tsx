import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Starfield } from "@/components/Starfield";
import { Owl } from "@/components/Owl";
import { loadState, saveState } from "@/lib/storage";
import { signup as apiSignup } from "@/services/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiSignup(email.trim(), password, name.trim());
      const s = loadState();
      saveState({
        ...s,
        email: res.user.email,
        name: res.user.name || "",
        level: res.user.level || 1,
        streak: res.user.streak || 1,
        focusTrend: res.user.focusTrend || [],
        loggedIn: true
      });
      navigate("/landing");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield count={90} />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <Owl state="wave" size={88} />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Create your <span className="gradient-text">FocusForge</span> account
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Sign up to forge your focus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-field mt-2"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@focused.com"
                className="input-field mt-2"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field mt-2"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Already have an account? <Link to="/login" className="underline">Log in</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Signup;
