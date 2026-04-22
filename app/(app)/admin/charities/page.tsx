import { deleteCharityAction, upsertCharityAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { Charity } from "@/types/app";

export default async function AdminCharitiesPage() {
  await requireAdmin();
  let charityRows: Charity[] = [];
  let dataUnavailable = false;

  try {
    const admin = createAdminClient();
    const { data: charities } = await admin
      .from("charities")
      .select("*")
      .order("featured", { ascending: false })
      .order("name");
    charityRows = ((charities as Charity[] | null) ?? []);
  } catch {
    dataUnavailable = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Charity management</p>
        <h1 className="serif mt-3 text-4xl">Add partners, update profiles, and control homepage spotlighting.</h1>
      </div>

      {dataUnavailable ? (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">Charity data is unavailable right now, so management actions are in fallback mode.</p>
        </Card>
      ) : null}

      <Card className="rounded-[30px] p-6">
        <h2 className="text-xl font-semibold">Add new charity</h2>
        <form action={upsertCharityAction} className="mt-6 grid gap-4">
          <Input name="name" placeholder="Charity name" required />
          <Textarea name="description" placeholder="Describe the charity's mission" className="min-h-[140px]" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="impactBlurb" placeholder="Impact blurb" />
            <Input name="eventBlurb" placeholder="Upcoming event" />
            <Input name="location" placeholder="Location" />
            <Input name="websiteUrl" placeholder="Website URL" />
            <Input name="imageUrl" placeholder="Image URL" />
            <Input name="tags" placeholder="Comma-separated tags" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" />
            Mark as featured
          </label>
          <Button type="submit">Create charity</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {charityRows.map((charity) => (
          <Card key={charity.id} className="rounded-[30px] p-6">
            <form action={upsertCharityAction} className="space-y-4">
              <input type="hidden" name="charityId" value={charity.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="name" defaultValue={charity.name} required />
                <Input name="location" defaultValue={charity.location ?? ""} />
                <Input name="impactBlurb" defaultValue={charity.impact_blurb ?? ""} />
                <Input name="eventBlurb" defaultValue={charity.event_blurb ?? ""} />
                <Input name="websiteUrl" defaultValue={charity.website_url ?? ""} />
                <Input name="imageUrl" defaultValue={charity.image_url ?? ""} />
                <Input name="tags" defaultValue={charity.tags?.join(", ") ?? ""} className="md:col-span-2" />
              </div>
              <Textarea name="description" defaultValue={charity.description} className="min-h-[140px]" />
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" name="featured" defaultChecked={charity.featured ?? false} />
                  Featured on homepage
                </label>
                <div className="flex gap-3">
                  <Button type="submit" variant="secondary">
                    Save
                  </Button>
                </div>
              </div>
            </form>
            <form action={deleteCharityAction} className="mt-4">
              <input type="hidden" name="charityId" value={charity.id} />
              <Button type="submit" variant="ghost">
                Delete charity
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
