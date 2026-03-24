"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent px-5 py-3 text-accent-foreground shadow-glow hover:brightness-105",
        secondary: "bg-white/8 px-5 py-3 text-foreground hover:bg-white/12",
        ghost: "bg-transparent px-4 py-2 text-muted-foreground hover:bg-white/6 hover:text-foreground",
        subtle: "bg-card/70 px-4 py-2 text-foreground hover:bg-card"
      },
      size: {
        default: "",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3.5 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
