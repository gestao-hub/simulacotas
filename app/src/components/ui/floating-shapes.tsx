import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingShapesProps {
  accentColor?: string;
  secondaryColor?: string;
}

export default function FloatingShapes({ accentColor = "hsl(68, 89%, 48%)", secondaryColor }: FloatingShapesProps) {
  const color2 = secondaryColor || accentColor;
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 40]);

  if (isMobile) return null;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)`,
          filter: "blur(35px)",
          top: "5%",
          left: "-8%",
          y: y1,
        }}
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 550,
          height: 550,
          background: `radial-gradient(circle, ${color2}45 0%, transparent 70%)`,
          filter: "blur(35px)",
          top: "25%",
          right: "-10%",
          y: y2,
        }}
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
          filter: "blur(30px)",
          bottom: "5%",
          left: "25%",
          y: y3,
        }}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
