import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Charity } from "@/types/app";

export default async function CharityProfilePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: charity } = await supabase.from("charities").select("*").eq("slug", slug).maybeSingle();
  const resolvedCharity = charity as Charity | null;

  if (!resolvedCharity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="mesh-panel rounded-[36px] p-8">
        <p className="eyebrow">{resolvedCharity.location ?? "Charity partner"}</p>
        <h1 className="serif mt-4 text-5xl">{resolvedCharity.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{resolvedCharity.description}</p>
        {resolvedCharity.impact_blurb ? (
          <div className="mt-8 rounded-[28px] bg-white/80 p-6">
            <p className="eyebrow">Why members choose it</p>
            <p className="mt-3 text-lg leading-8">{resolvedCharity.impact_blurb}</p>
          </div>
        ) : null}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="rounded-[28px] p-6">
            <p className="eyebrow">Upcoming event</p>
            <p className="mt-3 text-lg">{resolvedCharity.event_blurb ?? "Fresh partner events will appear here."}</p>
          </Card>
          <Card className="rounded-[28px] p-6">
            <p className="eyebrow">Website</p>
            <a
              href={resolvedCharity.website_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-lg underline underline-offset-4"
            >
              {resolvedCharity.website_url ?? "Coming soon"}
            </a>
          </Card>
        </div>
      </Card>
    </div>
  );
}
