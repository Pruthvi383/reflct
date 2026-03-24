import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireCompletedProfile } from "@/lib/auth";
import { applyDashboardStreakGuard, ensureMonthlyFreezeReset, getDashboardSnapshot } from "@/lib/data";

export default async function DashboardPage() {
  const { supabase, profile } = await requireCompletedProfile();
  const refreshedProfile = await ensureMonthlyFreezeReset(supabase, profile);
  const safeProfile = await applyDashboardStreakGuard(supabase, refreshedProfile);
  const snapshot = await getDashboardSnapshot(supabase, safeProfile);

  return <DashboardView snapshot={snapshot} />;
}
