import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";

export default async function AuthenticatedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { appUser } = await requireUser();

  return (
    <AppShell
      user={{
        fullName: appUser.full_name,
        email: appUser.email,
        role: appUser.role
      }}
    >
      {children}
    </AppShell>
  );
}
