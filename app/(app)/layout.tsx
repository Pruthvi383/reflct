import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { user, supabase } = await getSession();

  if (!user) {
    return <div className="min-h-screen px-4 py-6 md:px-8">{children}</div>;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    return <div className="min-h-screen px-4 py-6 md:px-8">{children}</div>;
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
