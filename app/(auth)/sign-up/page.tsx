import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your LearnAI account for free",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface-container-lowest to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-headline-md font-bold gradient-text">LearnAI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="text-label-caps text-secondary mb-3">FREE FOREVER</div>
          <h1 className="text-headline-lg gradient-text-hero mb-4">
            Start Your AI Learning Journey Today
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Free account includes 5 AI sessions, 2 PDF analyses, and 3 quiz generations per day.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "chat_spark", label: "5 Chat Sessions/day" },
              { icon: "description", label: "2 PDF Analyses/day" },
              { icon: "quiz", label: "3 Quizzes/day" },
              { icon: "keyboard_voice", label: "Voice Lab Access" },
              { icon: "analytics", label: "Progress Tracking" },
              { icon: "stars", label: "XP & Streak System" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">{feat.icon}</span>
                <span className="text-label-sm text-on-surface-variant">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-label-sm text-outline">No credit card required. Cancel anytime.</p>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-container-lowest/40">
        <div className="w-full max-w-[440px]">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass-modal rounded-2xl border border-white/10 shadow-2xl w-full",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
