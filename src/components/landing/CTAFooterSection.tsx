"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Github, Swords } from "lucide-react";

export function CTAFooterSection() {
  return (
    <>
      {/* CTA Section */}
      <section className="border-b border-border/40">
        <div className="container max-w-7xl mx-auto px-4 py-24">
          <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 border border-primary/30 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join Dungeon Masters who are already running faster, smoother
                D&D sessions with Initiative Forge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <span className="font-bold">Initiative Forge</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://github.com/dasli333/initiative-forge-next"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Initiative Forge
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
