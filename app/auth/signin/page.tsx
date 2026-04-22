import Link from "next/link";

import { signInAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <p className="eyebrow">Member login</p>
          <h1 className="serif text-5xl">Pick up where your scores and giving left off.</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Subscribers get access to score history, draw results, charity settings, and winner verification.
          </p>
        </div>
        <Card className="rounded-[32px] p-8">
          <form action={signInAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <Input name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/auth/signup" className="text-foreground underline underline-offset-4">
              Create your account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
