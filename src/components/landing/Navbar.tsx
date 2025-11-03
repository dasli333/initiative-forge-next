"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Initiative Forge</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
