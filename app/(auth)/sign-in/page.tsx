import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your LearnAI account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface-container-lowest to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[80px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="text-headline-md font-bold gradient-text">LearnAI</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-headline-lg gradient-text-hero mb-4">
            Learn Smarter.<br />Achieve More.
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Join 50,000+ students using AI-powered tutoring to master any subject, ace interviews, and accelerate their careers.
          </p>
          <div className="space-y-3">
            {[
              "Streaming AI tutor with code explanations",
              "Chat with your PDFs — ask anything",
              "Adaptive quiz generation with XP system",
              "Voice practice for interview prep",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-label-sm text-on-surface-variant">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-label-sm text-outline">© 2025 LearnAI. Future of Education.</p>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-container-lowest/40">
        <div className="w-full max-w-[440px]">
          <SignIn
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
