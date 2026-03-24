import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "amber" | "green" | "muted";
  className?: string;
};

const variants = {
  amber: "bg-accent/14 text-accent",
  green: "bg-emerald-400/10 text-emerald-300",
  muted: "bg-white/8 text-muted-foreground"
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.16em] uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
