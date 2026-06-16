import LandingClient from "@/components/LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaceIT — College Placement & Training Portal",
  description: "Digitize daily DSA assignments, track personal roadmap progress with Gemini AI, and connect with verified final-year seniors.",
};

export default function Home() {
  return <LandingClient />;
}
