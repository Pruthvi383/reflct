"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeftClose, PanelLeftOpen, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { LogoMark } from "@/components/layout/logo-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SIDEBAR_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/use-ui-store";
import type { Profile } from "@/types/database";

type NavItem = (typeof SIDEBAR_ITEMS)[number] & { href: string };

function useNavItems(profile: Profile) {
  return useMemo<NavItem[]>(
    () =>
      SIDEBAR_ITEMS.map((item) =>
        item.href === "/profile/me" ? { ...item, href: `/profile/${profile.username}` } : item
      ),
    [profile.username]
  );
}

function isItemActive(pathname: string, item: NavItem) {
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.label === "Profile" && pathname.startsWith("/profile/"))
  );
}

function ProfileFooter({
  profile,
  compact
}: {
  profile: Profile;
  compact?: boolean;
}) {
  return (
    <div className="mt-auto space-y-3 px-1">
      <div className={cn("rounded-2xl bg-white/5 p-3", compact && "flex justify-center px-0")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-white/8">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={profile.name ?? profile.username}
                className="size-10 rounded-2xl object-cover"
              />
            ) : (
              <UserRound className="size-5 text-muted-foreground" />
            )}
          </div>
          {!compact ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile.name ?? profile.username}</p>
              <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className={cn("flex items-center", compact ? "justify-center" : "justify-between")}>
        {!compact ? <span className="text-xs text-muted-foreground">Theme</span> : null}
        <ThemeToggle />
      </div>
    </div>
  );
}

function DesktopSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = useNavItems(profile);
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <motion.div
      className="fixed inset-y-4 left-4 z-30 hidden lg:block"
      animate={{ width: sidebarCollapsed ? 96 : 252 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <motion.aside
        className="glass relative flex h-full overflow-visible rounded-[32px] px-3 py-4"
        animate={{ width: sidebarCollapsed ? 96 : 252 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-6 z-10 size-9 rounded-full px-0"
        >
          {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>

        <div className="flex w-full flex-col">
          <div
            className={cn(
              "mb-8 px-1",
              sidebarCollapsed ? "flex justify-center" : "flex items-center justify-between gap-2"
            )}
          >
            <LogoMark compact={sidebarCollapsed} />
          </div>

          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-2xl py-3 text-sm transition",
                    sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3",
                    active
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/6 hover:text-foreground"
                  )}
                  aria-label={item.label}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  <AnimatePresence initial={false}>
                    {!sidebarCollapsed ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          <ProfileFooter profile={profile} compact={sidebarCollapsed} />
        </div>
      </motion.aside>
    </motion.div>
  );
}

function MobileHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = useNavItems(profile);
  const { mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu } = useUiStore();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  return (
    <>
      <div className="fixed inset-x-3 top-3 z-40 lg:hidden">
        <div className="glass flex items-center justify-between rounded-[24px] px-3 py-3">
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <LogoMark compact />
          <ThemeToggle />
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            />
            <motion.aside
              className="glass fixed inset-y-3 left-3 z-50 flex w-[min(86vw,320px)] flex-col rounded-[32px] px-4 py-4 lg:hidden"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="mb-8 flex items-center justify-between gap-3">
                <LogoMark />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <nav className="space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                        active
                          ? "bg-white/10 text-foreground"
                          : "text-muted-foreground hover:bg-white/6 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <ProfileFooter profile={profile} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function Sidebar({ profile }: { profile: Profile }) {
  return (
    <>
      <DesktopSidebar profile={profile} />
      <MobileHeader profile={profile} />
    </>
  );
}

export function MobileNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Home", icon: SIDEBAR_ITEMS[0].icon },
    { href: "/timer", label: "Timer", icon: SIDEBAR_ITEMS[1].icon },
    { href: "/history", label: "History", icon: SIDEBAR_ITEMS[2].icon },
    { href: "/wrapped", label: "Wrapped", icon: SIDEBAR_ITEMS[3].icon },
    { href: `/profile/${profile.username}`, label: "Profile", icon: SIDEBAR_ITEMS[5].icon }
  ];

  return (
    <div className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-[28px] px-2 py-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.label === "Profile" && pathname.startsWith("/profile/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] sm:text-xs",
              active ? "bg-white/10 text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
