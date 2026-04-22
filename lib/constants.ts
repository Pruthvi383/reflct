import {
  Gift,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  Target,
  Trophy
} from "lucide-react";

export const APP_NAME = "Birdie for Good";
export const APP_TAGLINE = "Golf scores that turn monthly giving into real-world impact.";

export const SUBSCRIBER_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    href: "/dashboard/scores",
    label: "Scores",
    icon: Target
  },
  {
    href: "/dashboard/charity",
    label: "Charity",
    icon: HeartHandshake
  },
  {
    href: "/dashboard/draws",
    label: "Draws",
    icon: Gift
  },
  {
    href: "/dashboard/winnings",
    label: "Winnings",
    icon: Trophy
  }
] as const;

export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: ShieldCheck
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: LayoutDashboard
  },
  {
    href: "/admin/charities",
    label: "Charities",
    icon: HeartHandshake
  },
  {
    href: "/admin/draws",
    label: "Draws",
    icon: Gift
  },
  {
    href: "/admin/winners",
    label: "Winners",
    icon: Trophy
  }
] as const;

export const PLAN_CONFIG = {
  monthly: {
    label: "Monthly",
    amount: 24,
    cadence: "month"
  },
  yearly: {
    label: "Yearly",
    amount: 240,
    cadence: "year"
  }
} as const;

export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const SCORE_LIMIT = 5;
export const DEFAULT_CHARITY_PERCENTAGE = 10;
export const MATCH_TYPES = ["match_5", "match_4", "match_3"] as const;
