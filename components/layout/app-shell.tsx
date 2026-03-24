"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { MobileNav, Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";
import type { Profile } from "@/types/database";

export function AppShell({ children, profile }: PropsWithChildren<{ profile: Profile }>) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen">
      <Sidebar profile={profile} />
      <main
        className={cn(
          "px-3 pb-28 pt-20 transition-[padding] duration-300 sm:px-4 lg:px-0 lg:pb-6 lg:pt-4 lg:pr-6",
          sidebarCollapsed ? "lg:pl-[124px]" : "lg:pl-[284px]"
        )}
      >
        <motion.div
          layout
          className="min-h-[calc(100vh-7rem)] rounded-[30px] bg-black/8 p-4 sm:p-5 lg:min-h-[calc(100vh-2rem)] lg:rounded-[36px] lg:p-6"
        >
          {children}
        </motion.div>
      </main>
      <MobileNav profile={profile} />
    </div>
  );
}
