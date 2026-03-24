import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("mask-shimmer animate-shimmer rounded-2xl bg-white/6", className)} />;
}
