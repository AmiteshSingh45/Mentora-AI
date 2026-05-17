import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your LearnAI account settings",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true, xp: true, streak: true, createdAt: true },
  }).catch(() => null);

  const plan = dbUser?.plan ?? "FREE";
  const PLAN_FEATURES = {
    FREE: { label: "Free", sessions: 5, pdfs: 2, quizzes: 3, color: "#8c909f" },
    PRO: { label: "Pro", sessions: 100, pdfs: 20, quizzes: 50, color: "#adc6ff" },
    PREMIUM: { label: "Premium", sessions: 1000, pdfs: 100, quizzes: 500, color: "#ddb7ff" },
  };
  const planInfo = PLAN_FEATURES[plan];

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface">Settings</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">Manage your account, preferences, and subscription.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Nav */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-2">
            {[
              { icon: "person", label: "Profile" },
              { icon: "notifications", label: "Notifications" },
              { icon: "credit_card", label: "Subscription" },
              { icon: "palette", label: "Appearance" },
              { icon: "security", label: "Security" },
              { icon: "delete", label: "Danger Zone" },
            ].map((item, i) => (
              <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-label-sm transition-all ${i === 0 ? "bg-secondary-container/10 text-primary font-bold border-l-2 border-secondary" : "text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface"}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-headline-md text-on-surface mb-6">Profile Information</h3>
            <div className="flex items-center gap-5 mb-6">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary/30 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-headline-md font-bold">
                  {clerkUser?.firstName?.[0] ?? "U"}
                </div>
              )}
              <div>
                <p className="text-headline-md text-on-surface">{clerkUser?.firstName} {clerkUser?.lastName}</p>
                <p className="text-label-sm text-on-surface-variant">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: `${planInfo.color}20`, color: planInfo.color }}>
                  {planInfo.label.toUpperCase()} PLAN
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "XP Points", value: `${(dbUser?.xp ?? 0).toLocaleString()} XP`, color: "#adc6ff" },
                { label: "Current Streak", value: `${dbUser?.streak ?? 0} Days`, color: "#fb923c" },
                { label: "Member Since", value: dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—", color: "#ddb7ff" },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface-container-low rounded-xl p-4 text-center">
                  <p className="text-[20px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-label-sm text-on-surface-variant mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-outline-variant/10">
              <p className="text-label-caps text-on-surface-variant mb-3">MANAGE ACCOUNT</p>
              <p className="text-body-md text-on-surface-variant mb-4">
                Profile editing, password changes, and connected accounts are managed through Clerk.
              </p>
              <a href="/user-profile" className="flex items-center gap-2 text-primary hover:text-secondary transition-colors text-label-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Open Account Settings
              </a>
            </div>
          </div>

          {/* Subscription */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-headline-md text-on-surface mb-6">Subscription</h3>
            <div className="p-4 rounded-xl mb-6" style={{ background: `${planInfo.color}10`, border: `1px solid ${planInfo.color}30` }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-label-caps" style={{ color: planInfo.color }}>CURRENT PLAN</p>
                  <p className="text-headline-md text-on-surface font-bold">{planInfo.label}</p>
                </div>
                {plan === "FREE" && (
                  <a href="/settings/billing" className="btn-gradient px-6 py-2.5 rounded-xl text-on-primary font-bold text-label-sm">
                    Upgrade
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Daily Chat Sessions", value: planInfo.sessions === 1000 ? "Unlimited" : `${planInfo.sessions}/day` },
                { label: "PDF Analysis", value: planInfo.pdfs === 100 ? "Unlimited" : `${planInfo.pdfs}/month` },
                { label: "Quiz Generation", value: planInfo.quizzes === 500 ? "Unlimited" : `${planInfo.quizzes}/month` },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-xl bg-surface-container-low text-center">
                  <p className="text-label-sm font-bold text-on-surface">{f.value}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card rounded-2xl p-6 border border-error/20">
            <h3 className="text-headline-md text-error mb-4">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-error/5">
              <div>
                <p className="text-label-sm font-bold text-on-surface">Delete Account</p>
                <p className="text-[11px] text-on-surface-variant">This action is permanent and cannot be undone.</p>
              </div>
              <button className="px-4 py-2 border border-error/40 text-error rounded-lg text-label-sm hover:bg-error/10 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
