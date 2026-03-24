"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import type { Wrapped } from "@/types/database";

export function WrappedDetail({
  wrapped,
  username,
  isOwner
}: {
  wrapped: Wrapped;
  username?: string;
  isOwner?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPublic, setIsPublic] = useState(wrapped.is_public ?? true);

  async function downloadPng() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `reflct-${wrapped.year}-${wrapped.month}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function copyLink() {
    const url = username
      ? `${window.location.origin}/wrapped/${wrapped.year}-${String(wrapped.month).padStart(2, "0")}?user=${username}`
      : window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied.");
  }

  async function togglePublic() {
    const response = await fetch("/api/wrapped", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: wrapped.id, is_public: !isPublic })
    });

    if (!response.ok) {
      toast.error("Visibility didn't update.");
      return;
    }

    setIsPublic((current) => !current);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Wrapped</p>
            <h1 className="serif mt-3 text-5xl">
              {new Date(wrapped.year, wrapped.month - 1, 1).toLocaleString("en-US", {
                month: "long",
                year: "numeric"
              })}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void downloadPng()}>
              Download PNG
            </Button>
            <Button variant="secondary" onClick={() => void copyLink()}>
              Copy share link
            </Button>
            {isOwner ? (
              <Button variant="secondary" onClick={() => void togglePublic()}>
                {isPublic ? "Make private" : "Make public"}
              </Button>
            ) : null}
          </div>
        </div>

        <Card ref={cardRef} className="rounded-[36px] p-8 md:p-10">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              {wrapped.summary.themes.map((theme) => (
                <span key={theme} className="rounded-full bg-accent/14 px-4 py-2 text-sm text-accent">
                  {theme}
                </span>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[28px] bg-white/5 p-5">
                <p className="text-sm text-muted-foreground">Focus trend</p>
                <p className="serif mt-4 text-4xl capitalize">{wrapped.summary.focusTrend}</p>
              </div>
              <div className="rounded-[28px] bg-white/5 p-5">
                <p className="text-sm text-muted-foreground">Goals</p>
                <p className="serif mt-4 text-4xl">
                  {wrapped.summary.goalsHit} of {wrapped.summary.totalGoals}
                </p>
              </div>
              <div className="rounded-[28px] bg-white/5 p-5">
                <p className="text-sm text-muted-foreground">Best week</p>
                <p className="serif mt-4 text-4xl">{wrapped.summary.bestWeek}</p>
              </div>
            </div>
            <div className="rounded-[32px] bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">AI insight</p>
              <p className="serif mt-4 text-3xl italic leading-relaxed">{wrapped.summary.insight}</p>
            </div>
            <div className="rounded-[32px] bg-white/5 p-6">
              <p className="mb-4 text-sm text-muted-foreground">Focus trend sparkline</p>
              <div className="flex h-20 items-end gap-3">
                {[48, 62, 58, 74].map((height, index) => (
                  <div
                    key={height + index}
                    className="flex-1 rounded-t-full bg-gradient-to-t from-accent to-accent/30"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
