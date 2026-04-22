import Link from "next/link";

import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_CHARITY_PERCENTAGE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Charity } from "@/types/app";

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name")
    .order("featured", { ascending: false })
    .order("name");
  const charityOptions = ((charities as Pick<Charity, "id" | "name">[] | null) ?? []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <p className="eyebrow">Create account</p>
          <h1 className="serif text-5xl">Join with a cause first. The golf comes after that.</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Choose a charity during signup, set your contribution percentage, then activate your membership and enter the draw.
          </p>
        </div>
        <Card className="rounded-[32px] p-8">
          <form action={signUpAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Full name</label>
              <Input name="fullName" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <Input name="password" type="password" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Choose charity</label>
              <select
                name="charityId"
                className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
                required
              >
                <option value="">Select a charity</option>
                {charityOptions.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Contribution percentage</label>
              <Input
                name="contributionPercentage"
                type="number"
                min={DEFAULT_CHARITY_PERCENTAGE}
                max={100}
                defaultValue={DEFAULT_CHARITY_PERCENTAGE}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already subscribed?{" "}
            <Link href="/auth/signin" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
