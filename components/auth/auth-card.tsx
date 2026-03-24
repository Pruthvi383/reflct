"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { authSchema, signupSchema } from "@/lib/validators";

type AuthMode = "signin" | "signup";

type AuthCardProps = {
  mode: AuthMode;
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const schema = mode === "signup" ? signupSchema : authSchema;
  type FormValues = z.infer<typeof authSchema> & { username?: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as z.ZodType<FormValues>),
    defaultValues:
      mode === "signup"
        ? ({ email: "", password: "", username: "" } as FormValues)
        : ({ email: "", password: "" } as FormValues)
  });

  async function handleOAuth() {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${
      mode === "signup" ? "/onboarding" : "/dashboard"
    }`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);

    if (mode === "signup") {
      const signupValues = values as z.infer<typeof signupSchema>;

      const { error } = await supabase.auth.signUp({
        email: signupValues.email,
        password: signupValues.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          data: {
            username: signupValues.username
          }
        }
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Check your inbox to confirm your account.");
      router.push("/auth/signin");
      setLoading(false);
      return;
    }

    const signinValues = values as z.infer<typeof authSchema>;
    const { error } = await supabase.auth.signInWithPassword(signinValues);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Card className="glass mx-auto w-full max-w-md space-y-6 rounded-[32px] p-8">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.36em] text-muted-foreground">Reflct</p>
        <h1 className="serif text-4xl">
          {mode === "signup" ? "Start a calmer habit." : "Welcome back."}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create your space for weekly reflection and focused work."
            : "Pick up where your week left off."}
        </p>
      </div>

      <Button className="w-full" size="lg" onClick={handleOAuth} disabled={loading}>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <div className="h-px flex-1 bg-white/10" />
        <span>or with email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="username">
              Username
            </label>
            <Input id="username" placeholder="pruthvi" {...form.register("username")} />
            <p className="text-xs text-warning">{String(form.formState.errors.username?.message ?? "")}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
          <p className="text-xs text-warning">{String(form.formState.errors.email?.message ?? "")}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
          <p className="text-xs text-warning">{String(form.formState.errors.password?.message ?? "")}</p>
        </div>

        <motion.div layout>
          <Button className="w-full" type="submit" size="lg" disabled={loading}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </motion.div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={mode === "signup" ? "/auth/signin" : "/auth/signup"}
          className="text-foreground underline decoration-accent/60 underline-offset-4"
        >
          {mode === "signup" ? "Sign in" : "Start free"}
        </Link>
      </p>
    </Card>
  );
}
