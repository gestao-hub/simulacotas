import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedTextCycle({
  words,
  interval = 5000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const elements = Array.from(measureRef.current.children);
      const widths = elements.map(el => el.getBoundingClientRect().width);
      const max = Math.ceil(Math.max(...widths));
      if (max > 0) setMaxWidth(`${max + 40}px`);
    }
  }, [words]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: { y: "-0.15em", opacity: 0, filter: "blur(8px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
      y: "0.15em",
      opacity: 0,
      filter: "blur(8px)",
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden
        className="absolute overflow-visible pointer-events-none opacity-0 h-px"
      >
        {words.map((word, i) => (
          <span key={i} className={`inline-block ${className}`}>
            {word}
          </span>
        ))}
      </div>

      <span
        className={`inline-block align-baseline ${className}`}
        style={{ width: maxWidth, position: "relative" }}
      >
        {/* Ghost text: defines real baseline and height */}
        <span className="invisible whitespace-nowrap" aria-hidden="true">
          {words[currentIndex]}
        </span>
        {/* Animated layer: clipped, positioned over ghost */}
        <span
          className="absolute inset-0 overflow-visible"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 bottom-0 whitespace-nowrap"
            >
              {words[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </>
  );
}
