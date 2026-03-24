"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIMER_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function QuickTimer() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState<number>(TIMER_PRESETS[0]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Focus timer</p>
        <h3 className="serif text-3xl">Begin a deep work block.</h3>
      </div>
      <Input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="What are you working on?"
      />
      <div className="flex flex-wrap gap-3">
        {TIMER_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setDuration(preset)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              duration === preset ? "bg-accent text-accent-foreground" : "bg-white/6 text-muted-foreground"
            )}
          >
            {preset} min
          </button>
        ))}
      </div>
      <Button
        className="w-full"
        onClick={() =>
          router.push(
            `/timer?label=${encodeURIComponent(label || "Deep work")}&duration=${encodeURIComponent(String(duration))}`
          )
        }
      >
        Start timer
      </Button>
    </div>
  );
}
