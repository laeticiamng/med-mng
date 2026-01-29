import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1, 
  className = "",
  suffix = "",
  prefix = ""
}: AnimatedCounterProps) {
  const spring = useSpring(0, { 
    mass: 0.8, 
    stiffness: 75, 
    damping: 15,
    duration: duration * 1000
  });
  
  const display = useTransform(spring, (current) => 
    Math.round(current)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
