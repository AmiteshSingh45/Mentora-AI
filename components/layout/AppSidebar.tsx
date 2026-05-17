"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/chat", icon: "chat_spark", label: "AI Tutor" },
  { href: "/pdf", icon: "description", label: "PDF Workspace" },
  { href: "/quiz", icon: "quiz", label: "Quiz Gen" },
  { href: "/notes", icon: "edit_note", label: "Smart Notes" },
  { href: "/voice", icon: "keyboard_voice", label: "Voice Lab" },
  { href: "/analytics", icon: "analytics", label: "Analytics" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

interface AppSidebarProps {
  streak?: number;
  plan?: "FREE" | "PRO" | "PREMIUM";
}

export function AppSidebar({ streak = 0, plan = "FREE" }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] glass-panel border-r border-white/5 flex flex-col py-6 px-6 z-[60] hidden md:flex">
        {/* Brand */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold gradient-text leading-none">LearnAI</h1>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5 font-mono">Premium Co-pilot</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setIsHovered(item.href)}
                onMouseLeave={() => setIsHovered(null)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  active
                    ? "nav-active text-primary"
                    : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface"
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-0 h-full w-0.5 rounded-r-full bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}

                {/* Hover glow */}
                {isHovered === item.href && !active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-xl bg-primary/5"
                  />
                )}

                <span
                  className={cn(
                    "material-symbols-outlined text-[22px] relative z-10",
                    active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-label-sm relative z-10">{item.label}</span>

                {/* New badge for Voice Lab */}
                {item.href === "/voice" && (
                  <span className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary border border-tertiary/30">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}

          {/* Recent Chats Section */}
          <div className="mt-6 mb-2 px-4">
            <span className="text-label-caps text-outline">RECENT CHATS</span>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-3">
          {/* Upgrade Card — only show for FREE users */}
          {plan === "FREE" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl glass-card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
            >
              <p className="text-label-sm font-bold text-on-surface mb-1">Upgrade to Pro</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                Unlock unlimited AI, Voice Lab & 20GB storage.
              </p>
              <Link href="/settings/billing">
                <button className="w-full py-2 btn-gradient rounded-lg text-on-primary font-bold text-[12px] text-center">
                  Upgrade Now
                </button>
              </Link>
            </motion.div>
          )}

          {/* Streak Display */}
          {streak > 0 && (
            <div className="px-4 py-2 flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[28px] text-orange-400 animate-streak"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <div>
                <p className="text-label-caps text-secondary">{streak} Day Streak</p>
                <p className="text-[10px] text-on-surface-variant">Keep it up! 🔥</p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-outline-variant/10 mx-2" />

          {/* Support + Logout */}
          <div className="space-y-1">
            <Link
              href="/support"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:text-secondary transition-colors text-label-sm"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              Support
            </Link>

            {/* User profile row */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-primary/30 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-label-sm font-bold">
                  {user?.firstName?.[0] ?? "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-label-sm text-on-surface truncate">
                  {user?.firstName ?? "User"}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay (hidden by default) */}
      <MobileSidebar pathname={pathname} streak={streak} />
    </>
  );
}

// ---- Mobile Bottom Nav ----
function MobileSidebar({ pathname, streak }: { pathname: string; streak: number }) {
  const mobileNavItems = NAV_ITEMS.slice(0, 5); // Show 5 items on mobile

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] md:hidden">
      <div className="glass-panel border-t border-white/5 px-2 py-3">
        <div className="flex justify-around">
          {mobileNavItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[24px] transition-colors",
                    active ? "text-primary" : "text-on-surface-variant"
                  )}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className={cn("text-[9px]", active ? "text-primary" : "text-on-surface-variant")}>
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
