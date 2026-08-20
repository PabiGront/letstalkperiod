import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout, PageHeader, AiDisclaimer } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings | Work Assistant" },
      {
        name: "description",
        content: "Personalise your workspace name, default email tone and AI safeguards.",
      },
      { property: "og:title", content: "Settings | Work Assistant" },
      {
        property: "og:description",
        content: "Workspace preferences and responsible AI settings.",
      },
    ],
  }),
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [reminders, setReminders] = useState(true);

  useEffect(() => {
    setName(localStorage.getItem("ltp-name") ?? "");
    setOrg(localStorage.getItem("ltp-org") ?? "Let's Talk. Period!");
    setReminders(localStorage.getItem("ltp-reminders") !== "off");
  }, []);

  function save() {
    localStorage.setItem("ltp-name", name);
    localStorage.setItem("ltp-org", org);
    localStorage.setItem("ltp-reminders", reminders ? "on" : "off");
    window.dispatchEvent(new Event("ltp-docs-changed"));
    toast.success("Settings saved");
  }

  return (
    <AppLayout>
      <PageHeader title="Settings" description="Personalise your workspace and AI safeguards." />

      <section className="shadow-card space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold">
              Your name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paballo"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="org" className="text-sm font-semibold">
              Organisation
            </label>
            <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <div>
            <p className="text-sm font-semibold">Show responsible AI reminders</p>
            <p className="text-xs text-muted-foreground">
              Keep review-before-sharing prompts visible across the app.
            </p>
          </div>
          <Switch checked={reminders} onCheckedChange={setReminders} />
        </div>
        <Button onClick={save}>Save settings</Button>
      </section>

      <AiDisclaimer extra="Saved documents and settings are stored locally in this browser only." />
    </AppLayout>
  );
}