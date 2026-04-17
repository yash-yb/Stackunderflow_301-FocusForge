const clouds = [
  { top: "8%", left: "6%", size: 320, color: "hsl(217 91% 35% / 0.35)", delay: "0s" },
  { top: "62%", left: "70%", size: 380, color: "hsl(224 76% 28% / 0.35)", delay: "5s" },
  { top: "38%", left: "42%", size: 260, color: "hsl(213 80% 40% / 0.25)", delay: "9s" },
  { top: "78%", left: "8%", size: 240, color: "hsl(220 80% 30% / 0.3)", delay: "3s" },
  { top: "4%", left: "72%", size: 300, color: "hsl(222 76% 25% / 0.3)", delay: "12s" },
];

export const Clouds = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {clouds.map((c, i) => (
      <div
        key={i}
        className="cloud"
        style={{
          top: c.top,
          left: c.left,
          width: c.size,
          height: c.size,
          background: c.color,
          animationDelay: c.delay,
        }}
      />
    ))}
  </div>
);
