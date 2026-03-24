"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onboardingSchema } from "@/lib/validators";
import type { Profile } from "@/types/database";

const steps = [
  {
    key: "learning_goal",
    title: "What are you learning?",
    hint: "Systems design, Spanish, product thinking, analog photography...",
    placeholder: "I’m learning to write clearer technical narratives."
  },
  {
    key: "reminder_time",
    title: "When should we remind you?",
    hint: "We’ll use this for your Friday reflection nudge.",
    placeholder: "18:00"
  },
  {
    key: "username",
    title: "Choose your username",
    hint: "This becomes your public profile link.",
    placeholder: "reflctive"
  }
] as const;

export function OnboardingWizard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      learning_goal: profile.learning_goal ?? "",
      reminder_time: profile.reminder_time ?? "18:00",
      username: profile.username ?? ""
    }
  });

  const currentStep = steps[stepIndex];
  const values = form.watch();

  async function checkUsername() {
    const username = form.getValues("username");
    if (!username) return;

    setChecking(true);
    try {
      const response = await fetch(`/api/settings?username=${encodeURIComponent(username)}`);
      const data = (await response.json()) as { available: boolean };
      setUsernameAvailable(data.available || username === profile.username);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (stepIndex === 2 && values.username) {
      void checkUsername();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const canAdvance = useMemo(() => {
    if (currentStep.key === "learning_goal") return values.learning_goal.trim().length > 1;
    if (currentStep.key === "reminder_time") return values.reminder_time.length > 0;
    return values.username.trim().length > 2 && usernameAvailable !== false;
  }, [currentStep.key, usernameAvailable, values.learning_goal, values.reminder_time, values.username]);

  const onSubmit = form.handleSubmit(async (payload) => {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      toast.error("We couldn't save your setup yet.");
      return;
    }

    toast.success("Your space is ready.");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-[36px] p-8 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Onboarding</p>
          <h1 className="serif mt-3 text-4xl">Let’s shape your rhythm.</h1>
        </div>
        <div className="flex gap-2">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`h-2.5 w-10 rounded-full ${index <= stepIndex ? "bg-accent" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <h2 className="serif text-3xl">{currentStep.title}</h2>
              <p className="text-sm text-muted-foreground">{currentStep.hint}</p>
            </div>

            {currentStep.key === "learning_goal" ? (
              <Input
                placeholder={currentStep.placeholder}
                className="h-14 text-base"
                {...form.register("learning_goal")}
              />
            ) : null}

            {currentStep.key === "reminder_time" ? (
              <Input type="time" className="h-14 text-base" {...form.register("reminder_time")} />
            ) : null}

            {currentStep.key === "username" ? (
              <div className="space-y-3">
                <Input
                  placeholder={currentStep.placeholder}
                  className="h-14 text-base"
                  {...form.register("username")}
                  onBlur={() => {
                    void checkUsername();
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  {checking
                    ? "Checking availability..."
                    : usernameAvailable === false
                      ? "That username is taken."
                      : usernameAvailable === true
                        ? "That username is available."
                        : "Use letters, numbers, and underscores."}
                </p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            disabled={stepIndex === 0}
          >
            Back
          </Button>

          {stepIndex < steps.length - 1 ? (
            <Button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={!canAdvance}>
              Complete setup
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
