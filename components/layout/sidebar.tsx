"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS, SUBSCRIBER_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";

type ShellUser = {
  fullName: string | null;
  email: string;
  role: "admin" | "subscriber";
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItems({ role, pathname }: { role: ShellUser["role"]; pathname: string }) {
  const items = role === "admin" ? ADMIN_NAV_ITEMS : SUBSCRIBER_NAV_ITEMS;

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
              active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({ user, pathname }: { user: ShellUser; pathname: string }) {
  return (
    <div className="flex h-full flex-col gap-8">
      <LogoMark />
      <NavItems role={user.role} pathname={pathname} />
      <div className="mt-auto rounded-[28px] border border-foreground/10 bg-white/80 p-4">
        <p className="text-sm font-semibold">{user.fullName ?? user.email}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {user.role}
          </span>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="gap-2">
              <LogOut className="size-4" />
              Exit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: ShellUser }) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useUiStore();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-foreground/8 bg-white/65 px-5 py-6 backdrop-blur-xl lg:block">
        <SidebarInner user={user} pathname={pathname} />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-foreground/8 bg-background/85 px-4 py-4 backdrop-blur-xl lg:hidden">
        <LogoMark compact />
        <Button variant="ghost" size="sm" onClick={toggleMobileMenu} aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-[#11212d]/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-3 left-3 z-50 w-[min(86vw,320px)] rounded-[30px] border border-white/60 bg-background px-5 py-6 shadow-soft lg:hidden"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <LogoMark />
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation">
                  <X className="size-5" />
                </Button>
              </div>
              <SidebarInner user={user} pathname={pathname} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
