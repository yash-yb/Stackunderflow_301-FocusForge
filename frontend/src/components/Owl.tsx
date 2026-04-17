interface OwlProps {
  state?: "idle" | "focused" | "encouraging" | "wave" | "happy" | "stressed";
  size?: number;
  className?: string;
}

/**
 * Refined product mascot owl.
 * - Navy/blue palette to match design system.
 * - Subtle blink + breathing micro-interactions.
 * - Multiple expressions via state prop.
 */
export const Owl = ({ state = "idle", size = 120, className = "" }: OwlProps) => {
  const isWave = state === "wave";
  const isFocused = state === "focused";
  const isStressed = state === "stressed";
  const isHappy = state === "happy";
  const isEncourage = state === "encouraging";

  // Eye shape: focused=narrow, stressed=wider with brows, happy=arcs
  const eyeRy = isFocused ? 5 : isStressed ? 9 : 8;
  const browAngle = isStressed ? -10 : isFocused ? -4 : 0;

  // Mouth/beak slight variations
  const beakPath = isHappy
    ? "M 60 58 Q 64 64 68 58 Q 64 62 60 58 Z"
    : isStressed
    ? "M 60 58 L 64 64 L 68 58 Z"
    : "M 60 58 L 64 65 L 68 58 Z";

  return (
    <div className={`owl-breathe ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        style={{ filter: "drop-shadow(0 8px 24px hsl(217 91% 30% / 0.6))" }}
      >
        <defs>
          <radialGradient id="owlBody" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="hsl(217 70% 38%)" />
            <stop offset="60%" stopColor="hsl(222 76% 22%)" />
            <stop offset="100%" stopColor="hsl(224 76% 14%)" />
          </radialGradient>
          <radialGradient id="owlBelly" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="hsl(213 94% 80%)" />
            <stop offset="100%" stopColor="hsl(217 70% 55%)" />
          </radialGradient>
          <linearGradient id="owlBeak" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(38 95% 70%)" />
            <stop offset="100%" stopColor="hsl(28 90% 55%)" />
          </linearGradient>
        </defs>

        {/* Body */}
        <ellipse cx="64" cy="72" rx="40" ry="44" fill="url(#owlBody)" />

        {/* Belly plate */}
        <ellipse cx="64" cy="80" rx="24" ry="30" fill="url(#owlBelly)" opacity="0.92" />

        {/* Ear tufts */}
        <path d="M 30 38 L 22 18 L 40 32 Z" fill="hsl(224 76% 18%)" />
        <path d="M 98 38 L 106 18 L 88 32 Z" fill="hsl(224 76% 18%)" />

        {/* Face plate */}
        <ellipse cx="64" cy="50" rx="32" ry="26" fill="hsl(222 50% 92%)" opacity="0.08" />

        {/* Eye sockets (white discs) */}
        <circle cx="48" cy="50" r="13" fill="hsl(210 40% 98%)" />
        <circle cx="80" cy="50" r="13" fill="hsl(210 40% 98%)" />

        {/* Brows */}
        <g stroke="hsl(224 76% 14%)" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <line
            x1="38"
            y1="38"
            x2="56"
            y2={42 + browAngle}
          />
          <line
            x1="90"
            y1="38"
            x2="72"
            y2={42 + browAngle}
          />
        </g>

        {/* Pupils with blink */}
        <g className="owl-blink">
          <ellipse cx="48" cy="51" rx="5" ry={eyeRy} fill="hsl(222 47% 6%)" />
          <ellipse cx="80" cy="51" rx="5" ry={eyeRy} fill="hsl(222 47% 6%)" />
          <circle cx="49.5" cy="48.5" r="1.6" fill="white" />
          <circle cx="81.5" cy="48.5" r="1.6" fill="white" />
        </g>

        {/* Beak */}
        <path d={beakPath} fill="url(#owlBeak)" stroke="hsl(28 90% 40%)" strokeWidth="0.6" />

        {/* Cheek blush when happy/encouraging */}
        {(isHappy || isEncourage) && (
          <>
            <ellipse cx="42" cy="62" rx="4" ry="2.4" fill="hsl(213 94% 70% / 0.5)" />
            <ellipse cx="86" cy="62" rx="4" ry="2.4" fill="hsl(213 94% 70% / 0.5)" />
          </>
        )}

        {/* Wings */}
        <path
          d="M 28 70 Q 18 80 26 102 Q 36 96 38 80 Z"
          fill="hsl(224 76% 18%)"
        />
        <g
          className={isWave ? "owl-wave" : ""}
          style={{ transformOrigin: "100px 72px" }}
        >
          <path
            d="M 100 70 Q 110 80 102 102 Q 92 96 90 80 Z"
            fill="hsl(224 76% 18%)"
          />
        </g>

        {/* Feet */}
        <g stroke="hsl(28 90% 55%)" strokeWidth="3" strokeLinecap="round">
          <line x1="54" y1="114" x2="54" y2="120" />
          <line x1="74" y1="114" x2="74" y2="120" />
        </g>
        <g stroke="hsl(28 90% 55%)" strokeWidth="2" strokeLinecap="round">
          <line x1="50" y1="120" x2="58" y2="120" />
          <line x1="70" y1="120" x2="78" y2="120" />
        </g>
      </svg>
    </div>
  );
};
