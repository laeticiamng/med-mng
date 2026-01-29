import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function FlipCard({
  front,
  back,
  isFlipped: controlledFlipped,
  onFlip,
  className,
  disabled = false
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped ?? internalFlipped;

  const handleFlip = () => {
    if (disabled) return;
    const newState = !isFlipped;
    setInternalFlipped(newState);
    onFlip?.(newState);
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer perspective-1000",
        disabled && "cursor-default",
        className
      )}
      onClick={handleFlip}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        
        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
