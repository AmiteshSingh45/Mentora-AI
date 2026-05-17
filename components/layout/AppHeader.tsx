"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "AI Tutor",
  "/pdf": "PDF Workspace",
  "/quiz": "Quiz Generator",
  "/notes": "Smart Notes",
  "/voice": "Voice Lab",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

interface AppHeaderProps {
  streak?: number;
  xp?: number;
}

export function AppHeader({ streak = 0, xp = 0 }: AppHeaderProps) {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  // Find the best matching title
  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? "LearnAI";

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 z-50 glass-panel border-b border-white/5 sticky top-0">
      {/* Left: Title + Search */}
      <div className="flex items-center gap-6">
        {/* Mobile brand (shown when sidebar is hidden) */}
        <h1 className="text-headline-md font-bold gradient-text md:hidden">LearnAI</h1>

        {/* Page title for desktop */}
        <h2 className="text-headline-md font-semibold text-on-surface hidden md:block">
          {title}
        </h2>

        {/* Search bar */}
        <motion.div
          animate={{ width: searchFocused ? 320 : 280 }}
          transition={{ duration: 0.2 }}
          className="hidden lg:flex items-center glass-card px-4 py-2 rounded-full border border-outline-variant/20 gap-2"
        >
          <span className="material-symbols-outlined text-outline text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search topics, quizzes, notes..."
            className="bg-transparent border-none focus:outline-none text-label-sm text-on-surface placeholder:text-outline w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchFocused && (
            <span className="text-[10px] font-mono text-outline border border-outline-variant/30 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          )}
        </motion.div>
      </div>

      {/* Right: Stats + Actions */}
      <div className="flex items-center gap-3">
        {/* XP Display */}
        {xp > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-primary/20">
            <span className="material-symbols-outlined text-[16px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span className="text-label-sm text-primary font-bold">{xp.toLocaleString()} XP</span>
          </div>
        )}

        {/* Streak Badge */}
        {streak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full border border-orange-500/20">
            <span
              className="material-symbols-outlined text-[16px] text-orange-400 animate-streak"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="text-label-sm text-orange-400 font-bold">{streak}</span>
          </div>
        )}

        {/* New Chat button */}
        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-label-sm",
              "bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(173,198,255,0.3)] transition-all"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Session
          </motion.button>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 transition-all">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-background" />
        </button>

        {/* User Button (Clerk) */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 border border-primary/30 rounded-full",
            },
          }}
        />
      </div>
    </header>
  );
}
