import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track your learning progress and performance analytics",
};

export default function AnalyticsPage() {
  const subjects = [
    { name: "Algorithms", mastery: 82, color: "#adc6ff", sessions: 24 },
    { name: "DBMS", mastery: 71, color: "#ddb7ff", sessions: 18 },
    { name: "OS", mastery: 65, color: "#ffb786", sessions: 15 },
    { name: "CN", mastery: 58, color: "#4ade80", sessions: 12 },
    { name: "AI/ML", mastery: 45, color: "#a78bfa", sessions: 8 },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface">Learning Analytics</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Deep insights into your learning patterns, strengths, and areas for growth.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Study Hours", value: "87h", icon: "schedule", color: "#adc6ff" },
          { label: "Quizzes Completed", value: "47", icon: "quiz", color: "#ddb7ff" },
          { label: "Avg. Score", value: "76%", icon: "trending_up", color: "#4ade80" },
          { label: "Learning Streak", value: "14 Days", icon: "local_fire_department", color: "#fb923c" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <span className="material-symbols-outlined text-[24px] mb-3 block" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>
              {stat.icon}
            </span>
            <p className="text-[28px] font-bold text-on-surface">{stat.value}</p>
            <p className="text-label-sm text-on-surface-variant mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-headline-md text-on-surface mb-6">Subject Mastery</h3>
          <div className="space-y-5">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-label-sm text-on-surface">{s.name}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-[10px] text-outline">{s.sessions} sessions</span>
                    <span className="text-label-sm font-bold" style={{ color: s.color }}>{s.mastery}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${s.mastery}%`,
                      background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                      boxShadow: `0 0 8px ${s.color}60`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap placeholder */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-headline-md text-on-surface mb-6">Study Activity</h3>
          <div className="grid grid-cols-7 gap-1">
            {["S","M","T","W","T","F","S"].map((d) => (
              <div key={d} className="text-[9px] text-outline text-center mb-1 font-mono">{d}</div>
            ))}
            {Array.from({ length: 84 }, (_, i) => {
              const intensity = Math.random();
              const opacity = intensity > 0.7 ? 1 : intensity > 0.5 ? 0.6 : intensity > 0.3 ? 0.3 : 0.08;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: `rgba(173, 198, 255, ${opacity})` }}
                  title={`${Math.round(intensity * 120)} minutes`}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-outline mt-3 text-right">Last 12 weeks</p>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-secondary">auto_awesome</span>
          <h3 className="text-headline-md text-on-surface">AI Learning Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { insight: "🎯 Strength", detail: "You excel at Algorithms — consistent 80%+ quiz scores", color: "#4ade80" },
            { insight: "📈 Growing Fast", detail: "Your DBMS mastery improved by 15% this week", color: "#adc6ff" },
            { insight: "⚡ Focus Area", detail: "AI/ML needs attention — consider 3+ sessions this week", color: "#ffb786" },
          ].map((item) => (
            <div key={item.insight} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
              <p className="text-label-sm font-bold mb-1" style={{ color: item.color }}>{item.insight}</p>
              <p className="text-[13px] text-on-surface-variant">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
