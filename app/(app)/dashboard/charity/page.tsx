import { createIndependentDonationAction, updateCharitySelectionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { getCharityDirectory, getSubscriberSnapshot } from "@/lib/data";
import type { Charity } from "@/types/app";

export default async function DashboardCharityPage() {
  const { authUser } = await requireUser();
  const [snapshot, charities] = await Promise.all([
    getSubscriberSnapshot(authUser.id),
    getCharityDirectory()
  ]);
  const charityOptions = charities as Charity[];

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Charity settings</p>
        <h1 className="serif mt-3 text-4xl">Decide where your membership should land and give extra whenever you want.</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[30px] p-6">
          <h2 className="text-xl font-semibold">Selected charity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A minimum of 10% of every subscription is directed to your chosen charity.
          </p>
          <form action={updateCharitySelectionAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Charity</label>
              <select
                name="charityId"
                className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
                defaultValue={snapshot.selectedCharity?.charity_id}
                required
              >
                <option value="">Select charity</option>
                {charityOptions.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Contribution percentage</label>
              <Input
                name="contributionPercentage"
                type="number"
                min={10}
                max={100}
                defaultValue={snapshot.selectedCharity?.contribution_percentage ?? 10}
                required
              />
            </div>
            <Button type="submit">Update charity settings</Button>
          </form>
        </Card>

        <Card className="rounded-[30px] p-6">
          <h2 className="text-xl font-semibold">Independent donation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Make a one-off donation separate from draw participation.
          </p>
          <form action={createIndependentDonationAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Charity</label>
              <select
                name="charityId"
                className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm"
                defaultValue={snapshot.selectedCharity?.charity_id}
                required
              >
                {charityOptions.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Amount</label>
              <Input name="amount" type="number" min={1} step="1" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Note</label>
              <Input name="note" placeholder="Optional note" />
            </div>
            <Button type="submit" variant="secondary">
              Record donation
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
