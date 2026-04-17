import { useMemo } from "react";

export const Starfield = ({ count = 100 }: { count?: number }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        size: Math.random() * 1.6 + 0.6,
        duration: 3 + Math.random() * 4,
      })),
    [count]
  );
  return (
    <div className="starfield">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
