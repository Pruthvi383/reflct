import { redirect } from "next/navigation";

import { requireCompletedProfile } from "@/lib/auth";

export default async function MeProfileRedirectPage() {
  const { profile } = await requireCompletedProfile();
  redirect(`/profile/${profile.username}`);
}
