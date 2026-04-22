import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  children,
  user
}: PropsWithChildren<{
  user: {
    fullName: string | null;
    email: string;
    role: "admin" | "subscriber";
  };
}>) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar user={user} />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
