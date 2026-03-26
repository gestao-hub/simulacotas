import { useRef, useCallback, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TiltValues {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

const DEFAULT: TiltValues = { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };

export function useTiltEffect(maxTilt = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [tilt, setTilt] = useState<TiltValues>(DEFAULT);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTilt({
        rotateX: (0.5 - y) * maxTilt * 2,
        rotateY: (x - 0.5) * maxTilt * 2,
        glareX: x * 100,
        glareY: y * 100,
      });
    },
    [isMobile, maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt(DEFAULT);
  }, []);

  const style: React.CSSProperties = {
    transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform",
  };

  const glareStyle: React.CSSProperties = {
    background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
    position: "absolute" as const,
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none" as const,
    zIndex: 1,
  };

  return { ref, style, glareStyle, handleMouseMove, handleMouseLeave, tilt };
}
