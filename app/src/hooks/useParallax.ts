import { useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseParallaxOptions {
  /** How much the element moves relative to scroll. Positive = moves down as you scroll. Default 0.15 */
  speed?: number;
  /** Scroll range start/end offsets relative to element. Default ["start end", "end start"] */
  offset?: [string, string];
}

export function useParallax({ speed = 0.15, offset }: UseParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (offset as any) || ["start end", "end start"],
  });

  const effectiveSpeed = prefersReduced || isMobile ? 0 : speed;
  const y = useTransform(scrollYProgress, [0, 1], [effectiveSpeed * -100, effectiveSpeed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return { ref, y, opacity, scrollYProgress };
}

export function useParallaxLayer(speed: number = 0.2) {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const effectiveSpeed = prefersReduced || isMobile ? 0 : speed;
  const y = useTransform(scrollYProgress, [0, 1], [effectiveSpeed * -120, effectiveSpeed * 120]);

  return { ref, y };
}
