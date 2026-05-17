import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate mastery percentage color
 */
export function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return "#4ade80"; // green
  if (mastery >= 60) return "#adc6ff"; // primary blue
  if (mastery >= 40) return "#ffb786"; // tertiary amber
  return "#f87171"; // red
}

/**
 * XP required for each level (exponential curve)
 */
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;
  while (totalXP + getXPForLevel(level) <= xp) {
    totalXP += getXPForLevel(level);
    level++;
  }
  return level;
}

export function getXPProgressInCurrentLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  let totalXP = 0;
  for (let l = 1; l < level; l++) {
    totalXP += getXPForLevel(l);
  }
  const xpInLevel = xp - totalXP;
  const xpForLevel = getXPForLevel(level);
  return Math.round((xpInLevel / xpForLevel) * 100);
}
