import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "amber" | "green" | "muted" | "danger";
  className?: string;
};

const variants = {
  amber: "bg-accent/12 text-accent",
  green: "bg-emerald-500/12 text-emerald-700",
  muted: "bg-foreground/5 text-muted-foreground",
  danger: "bg-rose-500/12 text-rose-700"
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
