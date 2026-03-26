import React from "react";
import { motion } from "framer-motion";
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { blurFadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glowOnHover?: boolean;
  index?: number;
}

export default function TiltCard({ children, className, accentColor, glowOnHover: _glowOnHover = true, index = 0 }: TiltCardProps) {
  const { ref, style, glareStyle, handleMouseMove, handleMouseLeave } = useTiltEffect(8);

  const enhancedGlare: React.CSSProperties = {
    ...glareStyle,
    background: glareStyle.background?.toString().replace('0.15', '0.28') || glareStyle.background,
  };

  return (
    <motion.div
      ref={ref}
      variants={blurFadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        borderTop: accentColor ? `3px solid ${accentColor}` : undefined,
      }}
      className={cn(
        "relative glass-premium-card group overflow-visible",
        className
      )}
      whileHover={{
        y: -10,
        scale: 1.03,
        boxShadow: accentColor
          ? `0 0 80px ${accentColor}60, 0 20px 56px rgba(0,0,0,0.16), inset 0 1px 2px rgba(255,255,255,0.9)`
          : `0 0 50px rgba(255,255,255,0.15), 0 16px 48px rgba(0,0,0,0.14), inset 0 1px 2px rgba(255,255,255,0.9)`,
      }}
    >
      {/* Gradient border overlay */}
      {accentColor && (
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${accentColor}25, transparent 50%, ${accentColor}15)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />
      )}
      <div style={enhancedGlare} />
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}
