"use client";

import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { FeaturesSection } from "./FeaturesSection";
import { RoadmapSection } from "./RoadmapSection";
import { CTAFooterSection } from "./CTAFooterSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <RoadmapSection />
        <CTAFooterSection />
      </main>
    </div>
  );
}
