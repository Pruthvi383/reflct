"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TIMER_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/store/use-timer-store";
import type { FocusSession } from "@/types/database";

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function playGentleChime() {
  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 660;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.8);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 1.8);
}

export function TimerWorkspace({
  initialSessions,
  initialLabel,
  initialDuration
}: {
  initialSessions: FocusSession[];
  initialLabel: string;
  initialDuration: number;
}) {
  const {
    phase,
    duration,
    remaining,
    label,
    startedAt,
    setLabel,
    setDuration,
    start,
    tick,
    pause,
    reset
  } = useTimerStore();
  const [sessions, setSessions] = useState(initialSessions);
  const [qualityModalOpen, setQualityModalOpen] = useState(false);

  useEffect(() => {
    setLabel(initialLabel);
    setDuration(initialDuration);
  }, [initialDuration, initialLabel, setDuration, setLabel]);

  useEffect(() => {
    if (phase !== "running") return;
    const interval = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(interval);
  }, [phase, tick]);

  useEffect(() => {
    if (phase !== "complete") return;
    playGentleChime();
    setQualityModalOpen(true);
  }, [phase]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      event.preventDefault();
      if (phase === "running") pause();
      else if (phase === "paused" || phase === "idle") start();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pause, phase, start]);

  const progress = useMemo(() => {
    if (duration === 0) return 0;
    return 1 - remaining / duration;
  }, [duration, remaining]);

  async function saveSession(quality: FocusSession["quality"]) {
    const startedAtIso = startedAt ?? new Date(Date.now() - duration * 1000).toISOString();
    const payload = {
      label,
      duration: Math.round(duration / 60),
      quality,
      started_at: startedAtIso,
      ended_at: new Date().toISOString()
    };

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      toast.error("We couldn't save that session.");
      return;
    }

    const session = (await response.json()) as FocusSession;
    setSessions((current) => [session, ...current]);
    toast.success("Session saved.");
    setQualityModalOpen(false);
    reset();
  }

  const productiveCount = sessions.filter((session) => session.quality === "PRODUCTIVE").length;
  const radius = 170;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),transparent_32%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Focus timer</p>
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="What are you working on?"
            className="mt-6 h-14 max-w-xl text-center text-base"
          />

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDuration(preset)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm transition",
                  duration / 60 === preset ? "bg-accent text-accent-foreground" : "bg-white/6 text-muted-foreground"
                )}
              >
                {preset} min
              </button>
            ))}
          </div>

          <div className="relative mt-10 flex size-[320px] items-center justify-center md:size-[400px]">
            {phase === "running" ? (
              <div className="absolute inset-0 rounded-full border border-accent/30 animate-pulse-ring" />
            ) : null}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r={radius} className="fill-none stroke-white/8 stroke-[12]" />
              <motion.circle
                cx="200"
                cy="200"
                r={radius}
                className="fill-none stroke-[#c9a84c] stroke-[12]"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div>
              <p className="serif text-7xl md:text-8xl">{formatSeconds(remaining)}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {phase === "running"
                  ? "Stay with the next useful thing."
                  : phase === "paused"
                    ? "Paused"
                    : "Press space to start or pause"}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {phase === "running" ? (
              <Button variant="secondary" size="lg" onClick={pause}>
                <Pause className="mr-2 size-4" />
                Pause
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  if (!label.trim()) {
                    toast.error("Add a session label first.");
                    return;
                  }
                  start();
                }}
              >
                <Play className="mr-2 size-4" />
                {phase === "paused" ? "Resume" : "Start"}
              </Button>
            )}
            <Button variant="ghost" size="lg" onClick={reset}>
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Today’s sessions</p>
            <h2 className="serif mt-2 text-3xl">Focus log</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {sessions.length} sessions today, {productiveCount} productive
          </p>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-[24px] bg-white/5 p-4"
              >
                <div>
                  <p className="font-medium">{session.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{session.duration} min</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      session.quality === "PRODUCTIVE"
                        ? "bg-emerald-300"
                        : session.quality === "OKAY"
                          ? "bg-accent"
                          : "bg-white/30"
                    )}
                  />
                  {session.quality.toLowerCase()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sessions.length === 0 ? (
            <div className="rounded-[24px] bg-white/5 p-8 text-center text-sm text-muted-foreground">
              Your first session today will show up here.
            </div>
          ) : null}
        </div>
      </Card>

      <Modal
        open={qualityModalOpen}
        title="Session complete"
        description="How did that block feel?"
        cancelLabel="Later"
        onClose={() => setQualityModalOpen(false)}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Button variant="secondary" onClick={() => void saveSession("PRODUCTIVE")}>
            Productive
          </Button>
          <Button variant="secondary" onClick={() => void saveSession("OKAY")}>
            Okay
          </Button>
          <Button variant="secondary" onClick={() => void saveSession("DISTRACTED")}>
            Distracted
          </Button>
        </div>
      </Modal>
    </div>
  );
}
