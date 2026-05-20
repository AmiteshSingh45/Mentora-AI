"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function MarketingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-panel border-b border-outline-variant/10" : "bg-transparent"}`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-on-primary">auto_awesome</span>
          </div>
          <span className="text-headline-md font-bold text-on-surface">
            Learn<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/pricing", label: "Pricing" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all ${pathname === link.href ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-label-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-gradient px-5 py-2.5 rounded-xl text-on-primary font-bold text-label-sm">
            Get Started Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
