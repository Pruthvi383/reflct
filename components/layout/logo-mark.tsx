import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="brand-gradient flex size-11 items-center justify-center rounded-2xl text-lg font-semibold text-accent-foreground shadow-glow">
        B
      </div>
      {!compact ? (
        <div className="space-y-0.5">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Charity draw club</p>
          <p className="text-lg font-semibold">{APP_NAME}</p>
        </div>
      ) : null}
    </Link>
  );
}
