import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/90 text-lg font-semibold text-accent-foreground shadow-glow">
        R
      </div>
      {!compact ? (
        <div className="space-y-0.5">
          <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Calm journal</p>
          <p className="text-xl font-semibold">Reflct</p>
        </div>
      ) : null}
    </Link>
  );
}
