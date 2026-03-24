import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const { profile } = await requireUser();

  if (profile?.learning_goal && profile.username) {
    redirect("/dashboard");
  }

  if (!profile) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <OnboardingWizard profile={profile} />
    </div>
  );
}
