import {
  CalendarRange,
  Clock3,
  Home,
  Settings,
  Sparkles,
  UserRound
} from "lucide-react";

export const APP_NAME = "Reflct";

export const SIDEBAR_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home
  },
  {
    href: "/timer",
    label: "Timer",
    icon: Clock3
  },
  {
    href: "/history",
    label: "History",
    icon: CalendarRange
  },
  {
    href: "/wrapped",
    label: "Wrapped",
    icon: Sparkles
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings
  },
  {
    href: "/profile/me",
    label: "Profile",
    icon: UserRound
  }
] as const;

export const TIMER_PRESETS = [25, 45, 60] as const;

export const ENTRY_AUTOSAVE_INTERVAL_MS = 30_000;
