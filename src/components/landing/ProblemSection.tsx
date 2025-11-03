"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, Target, Clock, ScrollText } from "lucide-react";

const problems = [
  {
    icon: BookOpen,
    title: "Too Many Sources",
    before: "Juggling rulebooks, notes, and character sheets",
    after: "All information in one centralized hub",
  },
  {
    icon: Target,
    title: "Manual Tracking",
    before: "Paper-based initiative, HP, and status tracking",
    after: "Automated combat management with zero errors",
  },
  {
    icon: Clock,
    title: "Slow Lookups",
    before: "Flipping through books for monster stats and spells",
    after: "Instant search across SRD monsters and spells",
  },
  {
    icon: ScrollText,
    title: "Scattered Data",
    before: "No dedicated place for campaign and character data",
    after: "Organized campaigns with persistent character storage",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-border/40">
      <div className="container max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Stop Fighting Your Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Running D&D sessions shouldn't slow down your game. Initiative Forge
            solves the pain points that plague Dungeon Masters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <Card
                key={index}
                className="p-6 border-primary/20 bg-card/50 backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">{problem.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive font-medium">✗</span>
                        <p className="text-muted-foreground">{problem.before}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-medium">✓</span>
                        <p className="text-foreground">{problem.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
