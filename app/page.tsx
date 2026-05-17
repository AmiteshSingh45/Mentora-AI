import type { Metadata } from "next";
import { LandingClient } from "./LandingClient";

export const metadata: Metadata = {
  title: "LearnAI – Smart AI Learning Assistant",
  description:
    "Master any subject with high-precision AI tutoring, instant quiz generation, and realistic interview simulations. Your sophisticated co-pilot for the future of education.",
};

export default function LandingPage() {
  return <LandingClient />;
}
