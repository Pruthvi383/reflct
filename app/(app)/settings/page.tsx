import { SettingsForm } from "@/components/settings/settings-form";
import { requireCompletedProfile } from "@/lib/auth";

export default async function SettingsPage() {
  const { profile } = await requireCompletedProfile();
  return <SettingsForm profile={profile} />;
}
