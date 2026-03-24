"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageTransition } from "@/components/ui/page-transition";
import type { Profile } from "@/types/database";

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [reminderTime, setReminderTime] = useState(profile.reminder_time ?? "18:00");
  const [isPublic, setIsPublic] = useState(profile.is_public ?? true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function saveSettings() {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reminder_time: reminderTime, is_public: isPublic })
    });

    if (!response.ok) {
      toast.error("Settings didn't save yet.");
      return;
    }

    toast.success("Settings updated.");
    router.refresh();
  }

  async function exportData() {
    const [entriesResponse, sessionsResponse] = await Promise.all([
      fetch("/api/entries"),
      fetch("/api/sessions/week?scope=all")
    ]);

    if (!entriesResponse.ok || !sessionsResponse.ok) {
      toast.error("Export not ready yet.");
      return;
    }

    const data = {
      entries: await entriesResponse.json(),
      sessions: await sessionsResponse.json()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reflct-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) {
      toast.error("We couldn't delete the account.");
      return;
    }

    toast.success("Account deleted.");
    router.push("/");
    router.refresh();
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Settings</p>
          <h1 className="serif mt-3 text-5xl">Shape the ritual around you.</h1>
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Reminder time</p>
            <Input type="time" className="mt-3 max-w-xs" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-[24px] bg-white/5 p-4">
            <div>
              <p className="font-medium">Public profile</p>
              <p className="text-sm text-muted-foreground">Let others see your profile and shared Wrapped cards.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic((current) => !current)}
              className={`relative h-8 w-14 rounded-full transition ${isPublic ? "bg-accent" : "bg-white/10"}`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full bg-white transition ${isPublic ? "left-7" : "left-1"}`}
              />
            </button>
          </div>
          <div className="rounded-[24px] bg-white/5 p-4">
            <p className="text-sm text-muted-foreground">Streak freezes</p>
            <p className="serif mt-3 text-4xl">{profile.streak_freezes ?? 0}</p>
          </div>
          <Button onClick={() => void saveSettings()}>Save settings</Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="serif text-3xl">Data</h2>
          <Button variant="secondary" onClick={() => void exportData()}>
            Export data as JSON
          </Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="serif text-3xl">Delete account</h2>
          <p className="text-sm text-muted-foreground">
            This permanently removes your account, entries, sessions, and wrapped cards.
          </p>
          <Button variant="secondary" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </Card>

        <Modal
          open={deleteOpen}
          title="Delete account?"
          description="Type DELETE to confirm this permanent action."
          cancelLabel="Keep account"
          confirmLabel="Delete forever"
          onConfirm={() => void deleteAccount()}
          onClose={() => setDeleteOpen(false)}
        >
          <Input value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} placeholder="DELETE" />
        </Modal>
      </div>
    </PageTransition>
  );
}
