import { WrappedGrid } from "@/components/wrapped/wrapped-grid";
import { requireCompletedProfile } from "@/lib/auth";

export default async function WrappedPage() {
  const { supabase, profile } = await requireCompletedProfile();
  const { data: wrappeds } = await supabase
    .from("wrapped")
    .select("*")
    .eq("user_id", profile.id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  return <WrappedGrid wrappeds={wrappeds ?? []} />;
}
