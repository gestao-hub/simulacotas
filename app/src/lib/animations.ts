import type { Variants } from "framer-motion";

export const easePremium = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ── Entry animations ─────────────────────────── */

export const blurFadeUp: Variants = {
  hidden: { opacity: 0, y: 70, scale: 0.95, filter: "blur(20px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: easePremium },
  },
};

export const scaleRotateIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: easePremium },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easePremium },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easePremium },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: easePremium },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: easePremium },
  },
};

/* ── Containers ───────────────────────────────── */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.25 },
  },
};

export const dramaticStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

/* ── Hover / Interactive ──────────────────────── */

export const cardHover = {
  y: -6,
  transition: { duration: 0.3, ease: easePremium },
};

/* ── Page transitions ─────────────────────────── */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 60, scale: 0.96, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: easePremium },
  },
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.98,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: easePremium },
  },
};

/* ── Float animation for decorative elements ──── */

export const floatAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};
