import type { Database } from "@/types/database";

export type AppUser = Database["public"]["Tables"]["users"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type Charity = Database["public"]["Tables"]["charities"]["Row"];
export type UserCharity = Database["public"]["Tables"]["user_charity"]["Row"];
export type Draw = Database["public"]["Tables"]["draws"]["Row"];
export type DrawResult = Database["public"]["Tables"]["draw_results"]["Row"];
export type Winner = Database["public"]["Tables"]["winners"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];

export type MatchType = Database["public"]["Enums"]["match_type"];
export type DrawLogicType = Database["public"]["Enums"]["draw_logic_type"];
export type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type WinnerStatus = Database["public"]["Enums"]["winner_status"];

export type SubscriberSnapshot = {
  user: AppUser;
  subscription: Subscription | null;
  scores: Score[];
  selectedCharity: (UserCharity & { charity: Charity | null }) | null;
  recentDraws: Draw[];
  winnings: Winner[];
};

export type AdminSnapshot = {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityCommitted: number;
  publishedDraws: number;
  pendingWinnerReviews: number;
};
