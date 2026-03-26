import { useRef, useState, useCallback } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export default function SpotlightCard({ children, accentColor = "#A020F0", className = "" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`relative overflow-hidden rounded-xl ${className}`}
    >
      {/* Spotlight border glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, ${accentColor}30, transparent 40%)`,
        }}
      />
      {/* Spotlight inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${accentColor}08, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
}
