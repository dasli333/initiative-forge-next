"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, BookText, UserCog } from "lucide-react";

const roadmapItems = [
  {
    icon: Package,
    title: "Magic Items Library",
    description:
      "Browse and manage magic items from the SRD with full descriptions and properties.",
    status: "planned",
  },
  {
    icon: BookText,
    title: "Session Journal",
    description:
      "Advanced note-taking system for tracking plot, NPCs, locations, and world lore.",
    status: "planned",
  },
  {
    icon: UserCog,
    title: "Advanced Character Sheets",
    description:
      "Complete character management with inventory, skills, background, and progression tracking.",
    status: "planned",
  },
];

export function RoadmapSection() {
  return (
    <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-7xl mx-auto px-4 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">What's Coming Next</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're constantly improving Initiative Forge. Here's what's on the
            horizon.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-transparent" />

          <div className="space-y-6">
            {roadmapItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-8 top-8 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-[7px] z-10" />

                  <Card className="md:ml-20 p-6 border-primary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                          <Badge
                            variant="outline"
                            className="border-primary/40 text-primary"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Have a feature request?{" "}
            <a
              href="https://github.com/dasli333/initiative-forge-next/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Let us know on GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
