"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      {/* Background texture/gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

      <div className="container relative max-w-7xl mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Command Center for D&D 5e</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
            Your Command Center for{" "}
            <span className="text-primary">D&D 5e Sessions</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl">
            Manage your campaigns, track combat in real-time, and access instant
            lookups for monsters and spells. Everything a Dungeon Master needs
            in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>

          {/* Subtext */}
          <p className="text-sm text-muted-foreground">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </section>
  );
}
