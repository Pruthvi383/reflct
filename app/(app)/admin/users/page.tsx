import { updateUserAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { AppUser, Charity, Subscription, UserCharity } from "@/types/app";

export default async function AdminUsersPage() {
  await requireAdmin();
  let userRows: AppUser[] = [];
  let subscriptionMap = new Map<string, Subscription>();
  let selectionMap = new Map<string, UserCharity & { charity: Pick<Charity, "name"> | null }>();
  let charityOptions: Pick<Charity, "id" | "name">[] = [];
  let dataUnavailable = false;

  try {
    const admin = createAdminClient();
    const [{ data: users }, { data: subscriptions }, { data: selections }, { data: charities }] = await Promise.all([
      admin.from("users").select("*").order("created_at", { ascending: false }),
      admin.from("subscriptions").select("*"),
      admin.from("user_charity").select("*, charity:charities(name)"),
      admin.from("charities").select("id, name").order("name")
    ]);
    userRows = ((users as AppUser[] | null) ?? []);
    subscriptionMap = new Map((((subscriptions as Subscription[] | null) ?? [])).map((item) => [item.user_id, item]));
    selectionMap = new Map(
      ((((selections as Array<UserCharity & { charity: Pick<Charity, "name"> | null }> | null) ?? [])).map((item) => [
        item.user_id,
        item
      ]))
    );
    charityOptions = ((charities as Pick<Charity, "id" | "name">[] | null) ?? []);
  } catch {
    dataUnavailable = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">User management</p>
        <h1 className="serif mt-3 text-4xl">Update subscriber roles, charity settings, and billing state.</h1>
      </div>

      {dataUnavailable ? (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">User records are unavailable until the Supabase connection is restored.</p>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {userRows.map((user) => {
          const subscription = subscriptionMap.get(user.id);
          const selection = selectionMap.get(user.id);

          return (
            <Card key={user.id} className="rounded-[30px] p-6">
              <form action={updateUserAction} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Full name</label>
                    <Input name="fullName" defaultValue={user.full_name ?? ""} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Role</label>
                    <select name="role" defaultValue={user.role} className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                      <option value="subscriber">subscriber</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Plan</label>
                    <select name="plan" defaultValue={subscription?.plan ?? "monthly"} className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                      <option value="monthly">monthly</option>
                      <option value="yearly">yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Status</label>
                    <select name="status" defaultValue={subscription?.status ?? "incomplete"} className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                      {["trialing", "active", "past_due", "canceled", "incomplete", "incomplete_expired", "unpaid", "paused"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Amount</label>
                    <Input name="amount" type="number" defaultValue={subscription?.amount ?? ""} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Renewal date</label>
                    <Input
                      name="currentPeriodEnd"
                      type="date"
                      defaultValue={subscription?.current_period_end?.slice(0, 10) ?? ""}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Charity</label>
                    <select name="charityId" defaultValue={selection?.charity_id ?? ""} className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm">
                      <option value="">None</option>
                      {charityOptions.map((charity) => (
                        <option key={charity.id} value={charity.id}>
                          {charity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Contribution %</label>
                    <Input
                      name="contributionPercentage"
                      type="number"
                      min={10}
                      max={100}
                      defaultValue={selection?.contribution_percentage ?? 10}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Button type="submit">Save user</Button>
                </div>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
