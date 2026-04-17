import { useEffect, useState } from "react";
import { Owl } from "./Owl";

interface Props {
  message: string | null;
  onDone: () => void;
}

export const OwlNotification = ({ message, onDone }: Props) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!message) return;
    setText(message);
    setVisible(true);
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), 5000);
    const t2 = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 5700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [message, onDone]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 ${
        leaving ? "owl-pop-out" : "owl-pop-in"
      }`}
    >
      <Owl state="wave" size={72} />
      <div
        className="relative px-5 py-3 rounded-2xl text-sm font-semibold text-primary-foreground"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        {text}
        <span
          className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
          style={{ background: "hsl(268 83% 65%)" }}
        />
      </div>
    </div>
  );
};
