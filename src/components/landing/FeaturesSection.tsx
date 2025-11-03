"use client";

import { Card } from "@/components/ui/card";
import { Swords, BookOpen, Sparkles, Users, Dices, Activity } from "lucide-react";

const features = [
  {
    icon: Swords,
    title: "Combat Tracker",
    description:
      "Automated initiative rolls, turn tracking, HP management, and real-time condition monitoring. Never lose track of who's turn it is.",
  },
  {
    icon: BookOpen,
    title: "Monster Library",
    description:
      "Complete SRD monster database with instant search, CR filtering, and detailed stat blocks. Find the perfect encounter in seconds.",
  },
  {
    icon: Sparkles,
    title: "Spell Library",
    description:
      "Browse all SRD spells with filtering by level, class, and name. Quick access to spell descriptions during intense moments.",
  },
  {
    icon: Users,
    title: "Campaign Management",
    description:
      "Create and organize campaigns with player characters. Track character stats, initiative bonuses, and passive perception automatically.",
  },
  {
    icon: Dices,
    title: "Dice Mechanics",
    description:
      "Built-in dice roller with advantage, disadvantage, and modifier support. Execute attack rolls and damage with a single click.",
  },
  {
    icon: Activity,
    title: "Condition Tracking",
    description:
      "Apply and monitor all D&D 5e conditions with visual indicators. Hover to see full condition descriptions without leaving combat.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-b border-border/40 bg-gradient-to-b from-background to-primary/5">
      <div className="container max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to Run Combat
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make your D&D sessions faster,
            smoother, and more enjoyable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
