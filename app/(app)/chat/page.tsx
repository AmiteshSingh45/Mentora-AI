import type { Metadata } from "next";
import { AIChatInterface } from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Chat with your personal AI tutor — ask any question, get instant explanations.",
};

export default function ChatPage() {
  return <AIChatInterface />;
}
