import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[180px] w-full rounded-[28px] bg-white/5 px-5 py-4 text-base leading-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent/50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
