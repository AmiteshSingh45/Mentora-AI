import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the LearnAI plan that fits your learning goals",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect to get started with AI tutoring",
    color: "var(--color-outline)",
    glow: false,
    popular: false,
    features: [
      "5 AI tutor sessions/day",
      "2 PDF analyses/month",
      "3 quiz generations/day",
      "Voice Lab (3 sessions/week)",
      "Basic analytics",
      "10MB storage",
    ],
    cta: "Get Started Free",
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious students and professionals",
    color: "var(--color-primary)",
    glow: true,
    popular: true,
    features: [
      "100 AI tutor sessions/day",
      "20 PDF analyses/month",
      "50 quiz generations/day",
      "Unlimited Voice Lab",
      "Advanced analytics + insights",
      "2GB storage",
      "Priority AI response speed",
      "Export notes to PDF/MD",
    ],
    cta: "Start Pro Trial",
    href: "/sign-up",
  },
  {
    name: "Premium",
    price: "$49",
    period: "per month",
    description: "For teams and power users",
    color: "var(--color-secondary)",
    glow: false,
    popular: false,
    features: [
      "Unlimited AI sessions",
      "Unlimited PDF analyses",
      "Unlimited quizzes",
      "Unlimited Voice Lab",
      "Full analytics + export",
      "20GB storage",
      "API access",
      "Custom AI persona",
      "Priority support",
    ],
    cta: "Go Premium",
    href: "/sign-up",
  },
];

const COMPARISON = [
  { feature: "AI Chat Sessions/Day", FREE: "5", PRO: "100", PREMIUM: "Unlimited" },
  { feature: "PDF Analyses/Month", FREE: "2", PRO: "20", PREMIUM: "Unlimited" },
  { feature: "Quiz Generations/Day", FREE: "3", PRO: "50", PREMIUM: "Unlimited" },
  { feature: "Voice Lab", FREE: "Limited", PRO: "Full Access", PREMIUM: "Full Access" },
  { feature: "Storage", FREE: "10 MB", PRO: "2 GB", PREMIUM: "20 GB" },
  { feature: "Priority Support", FREE: "✕", PRO: "✓", PREMIUM: "✓" },
  { feature: "API Access", FREE: "✕", PRO: "✕", PREMIUM: "✓" },
];

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Nav */}
      <header className="flex justify-between items-center px-6 md:px-12 h-16 glass-panel border-b border-white/5 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-headline-md font-bold gradient-text">LearnAI</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <button className="text-label-sm text-on-surface-variant hover:text-primary px-3 py-2 transition-colors">Sign In</button>
          </Link>
          <Link href="/sign-up">
            <button className="px-5 py-2.5 bg-primary text-on-primary text-label-sm font-bold rounded-xl">Get Started</button>
          </Link>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-label-caps text-secondary mb-4">TRANSPARENT PRICING</p>
          <h1 className="text-headline-lg gradient-text-hero mb-4">
            Invest in your learning.<br />Start for free.
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto">
            No hidden fees. Cancel anytime. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-2xl p-6 flex flex-col relative ${plan.popular ? "border-primary/40 shadow-[0_0_40px_rgba(173,198,255,0.12)]" : "border-outline-variant/10"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold text-on-primary"
                  style={{ background: "linear-gradient(135deg, #4d8eff, #6f00be)" }}>
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-label-caps" style={{ color: plan.color }}>{plan.name.toUpperCase()}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[48px] font-bold text-on-surface">{plan.price}</span>
                  <span className="text-on-surface-variant text-label-sm">/{plan.period}</span>
                </div>
                <p className="text-body-md text-on-surface-variant">{plan.description}</p>
              </div>

              <div className="space-y-3 flex-grow mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: plan.color, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-label-sm text-on-surface-variant">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.href}>
                <button
                  className={`w-full py-3.5 rounded-xl font-bold text-label-sm transition-all ${plan.popular
                    ? "btn-gradient text-on-primary"
                    : "glass-card border border-outline-variant/20 text-on-surface hover:bg-surface-variant/30"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="text-headline-md text-on-surface">Full Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left p-4 text-label-caps text-on-surface-variant">FEATURE</th>
                  {["FREE", "PRO", "PREMIUM"].map((p) => (
                    <th key={p} className="p-4 text-center text-label-caps text-on-surface-variant">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-surface-container-lowest/30" : ""}>
                    <td className="p-4 text-label-sm text-on-surface-variant">{row.feature}</td>
                    <td className="p-4 text-center text-label-sm text-on-surface">{row.FREE}</td>
                    <td className="p-4 text-center text-label-sm text-primary font-bold">{row.PRO}</td>
                    <td className="p-4 text-center text-label-sm text-secondary font-bold">{row.PREMIUM}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-headline-lg text-on-surface text-center mb-10">Common Questions</h2>
          {[
            { q: "Can I upgrade or downgrade anytime?", a: "Yes, you can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your billing period." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and UPI (India) through our Stripe integration." },
            { q: "Is there a free trial for Pro?", a: "Yes! New users get a 7-day free trial of Pro features when they sign up. No credit card required." },
            { q: "What happens to my data if I cancel?", a: "Your chat history, notes, and uploaded PDFs are retained for 30 days after cancellation. You can export everything before deletion." },
          ].map((faq) => (
            <div key={faq.q} className="py-6 border-b border-outline-variant/10">
              <p className="text-label-sm font-bold text-on-surface mb-2">{faq.q}</p>
              <p className="text-body-md text-on-surface-variant">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
