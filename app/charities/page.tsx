import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCharityDirectory } from "@/lib/data";

export default async function CharitiesPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const charities = await getCharityDirectory(search);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="eyebrow">Charity directory</p>
        <h1 className="serif mt-4 text-5xl">Find the cause that should benefit from your subscription.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Search active charity partners, read their mission, and see upcoming community events.
        </p>
      </div>

      <form className="mt-8 max-w-xl">
        <Input name="search" defaultValue={search} placeholder="Search by name, focus, or location" />
      </form>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {charities.map((charity) => (
          <Card key={charity.id} className="rounded-[30px] p-6">
            <p className="eyebrow">{charity.location ?? "Partner charity"}</p>
            <h2 className="mt-3 text-2xl font-semibold">{charity.name}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{charity.description}</p>
            <p className="mt-4 text-sm font-medium text-accent">{charity.event_blurb ?? "New events announced monthly."}</p>
            <Link href={`/charities/${charity.slug}`} className="mt-6 inline-flex text-sm font-medium text-foreground underline underline-offset-4">
              View full profile
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
