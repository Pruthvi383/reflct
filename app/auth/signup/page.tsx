import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getRedirectPathForSession } from "@/lib/auth";

export default async function SignUpPage() {
  const redirectPath = await getRedirectPathForSession();

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.18),transparent_30%)]" />
      <AuthCard mode="signup" />
    </div>
  );
}
