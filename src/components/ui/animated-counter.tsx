import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

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
  const prevValue = useRef(value);
  
  const spring = useSpring(value, { 
    mass: 0.8, 
    stiffness: 75, 
    damping: 15,
    duration: duration * 1000
  });
  
  const display = useTransform(spring, (current) => 
    Math.round(current)
  );

  useEffect(() => {
    // Only animate if value actually changed
    if (prevValue.current !== value) {
      spring.set(value);
      prevValue.current = value;
    }
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
