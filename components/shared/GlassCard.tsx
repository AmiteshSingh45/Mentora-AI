"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "secondary" | "none";
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

/**
 * Core glassmorphism card component — the foundational UI element for LearnAI.
 * Implements the design system's "Level 1" glass card pattern:
 * - rgba(28,28,30,0.7) background
 * - 20px backdrop blur
 * - 1px border with top/left edge highlight
 */
export function GlassCard({
  children,
  className,
  hover = false,
  glow = "none",
  animate = true,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const glowClass = {
    primary: "shadow-[0_0_20px_rgba(173,198,255,0.1)]",
    secondary: "shadow-[0_0_20px_rgba(221,183,255,0.1)]",
    none: "",
  }[glow];

  const hoverClass = hover
    ? "transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(173,198,255,0.12)] cursor-pointer"
    : "";

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={cn("glass-card rounded-2xl", glowClass, hoverClass, className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn("glass-card rounded-2xl", glowClass, hoverClass, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ---- Light Leak Orb ----
interface LightLeakProps {
  color?: "blue" | "purple" | "amber";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LightLeak({ color = "blue", size = "md", className }: LightLeakProps) {
  const colors = {
    blue: "rgba(173, 198, 255, 0.12)",
    purple: "rgba(221, 183, 255, 0.10)",
    amber: "rgba(255, 183, 134, 0.08)",
  };

  const sizes = {
    sm: "w-48 h-48",
    md: "w-96 h-96",
    lg: "w-[600px] h-[600px]",
    xl: "w-[800px] h-[800px]",
  };

  return (
    <div
      className={cn("absolute rounded-full pointer-events-none -z-10", sizes[size], className)}
      style={{
        background: `radial-gradient(circle at center, ${colors[color]} 0%, transparent 70%)`,
        filter: "blur(20px)",
      }}
    />
  );
}

// ---- Loading Skeleton ----
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface-container-high/50",
        className
      )}
    />
  );
}

// ---- Gradient Badge ----
interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "outline";
  className?: string;
}

export function GradientBadge({ children, variant = "primary", className }: BadgeProps) {
  const variants = {
    primary: "bg-primary/10 border-primary/30 text-primary",
    secondary: "bg-secondary/10 border-secondary/30 text-secondary",
    tertiary: "bg-tertiary/10 border-tertiary/30 text-tertiary",
    outline: "bg-surface-container border-outline-variant/20 text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-label-caps",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---- Section Label ----
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-label-caps text-on-surface-variant", className)}>
      {children}
    </span>
  );
}

// ---- Progress Bar ----
interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, color = "#adc6ff", showLabel = false, className }: ProgressBarProps) {
  return (
    <div className={cn("relative", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-label-caps text-on-surface-variant">Progress</span>
          <span className="text-label-sm" style={{ color }}>{value}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full progress-pulse relative"
          style={{
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

// ---- Empty State ----
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-8 text-center",
        className
      )}
    >
      <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary">{icon}</span>
      </div>
      <h3 className="text-headline-md text-on-surface mb-2">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

// ---- AI Typing Indicator ----
export function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3 glass-panel rounded-2xl rounded-tl-none w-fit">
      <span className="typing-dot bg-primary" />
      <span className="typing-dot bg-primary" />
      <span className="typing-dot bg-primary" />
    </div>
  );
}
