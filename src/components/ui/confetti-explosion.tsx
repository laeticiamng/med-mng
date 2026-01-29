import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiExplosionProps {
  trigger: boolean;
  type?: "success" | "celebration" | "gold";
}

export function ConfettiExplosion({ trigger, type = "celebration" }: ConfettiExplosionProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Only trigger once per true transition, prevent re-triggering on re-renders
    if (!trigger) {
      hasTriggered.current = false;
      return;
    }
    
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const colors = {
      success: ["#22c55e", "#16a34a", "#4ade80"],
      celebration: ["#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"],
      gold: ["#fbbf24", "#f59e0b", "#d97706", "#fcd34d"]
    };

    const particleCount = type === "gold" ? 150 : 100;

    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors[type],
      disableForReducedMotion: true
    });

    // Second burst for celebration
    if (type === "celebration" || type === "gold") {
      const timeoutId = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors[type],
          disableForReducedMotion: true
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors[type],
          disableForReducedMotion: true
        });
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [trigger, type]);

  return null;
}
