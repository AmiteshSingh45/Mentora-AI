import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LearnAI – Smart AI Learning Assistant",
    template: "%s | LearnAI",
  },
  description:
    "Master any subject with high-precision AI tutoring, instant quiz generation, PDF-powered learning, and realistic interview simulations. Your sophisticated co-pilot for the future of education.",
  keywords: [
    "AI tutor",
    "learn AI",
    "quiz generator",
    "PDF learning",
    "study assistant",
    "interview prep",
    "DSA practice",
  ],
  authors: [{ name: "LearnAI" }],
  creator: "LearnAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "LearnAI – Smart AI Learning Assistant",
    description:
      "Master any subject with your personal AI tutor. Upload PDFs, generate quizzes, and learn smarter.",
    siteName: "LearnAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnAI – Smart AI Learning Assistant",
    description: "Your AI co-pilot for the future of education.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#adc6ff",
          colorBackground: "#0b0e15",
          colorInputBackground: "#1d2027",
          colorInputText: "#e1e2ec",
          colorText: "#e1e2ec",
          colorTextSecondary: "#c2c6d6",
          colorNeutral: "#8c909f",
          borderRadius: "0.75rem",
          fontFamily: "Geist, system-ui, sans-serif",
        },
        elements: {
          card: "glass-modal",
          headerTitle: "gradient-text text-headline-md font-bold",
          formButtonPrimary: "btn-gradient text-on-primary font-bold",
          footerActionLink: "text-primary hover:text-secondary",
          socialButtonsBlockButton: "glass-card border border-outline-variant/30 text-on-surface hover:bg-surface-variant/50",
          formFieldInput: "bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/50",
          formFieldLabel: "text-on-surface-variant text-label-caps",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
