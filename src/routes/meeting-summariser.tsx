import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { AiBadge, ErrorState, OutputField, copyText, toLines } from "@/components/OutputBlock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateWithAI } from "@/lib/ai.functions";
import { saveDoc } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/meeting-summariser")({
  component: MeetingSummariser,
  head: () => ({
    meta: [
      { title: "Meeting Notes Summariser | Work Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a structured summary with decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summariser | Work Assistant" },
      {
        property: "og:description",
        content: "Summaries, decisions, action items and deadlines from your meeting notes.",
      },
    ],
  }),
});

type Sections = {
  summary: string;
  keyPoints: string;
  keyDecisions: string;
  actionItems: string;
  deadlines: string;
  followUps: string;
};

function MeetingSummariser() {
  const run = useServerFn(generateWithAI);
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState<Sections | null>(null);

  async function generate() {
    if (!notes.trim()) {
      setError("Paste your meeting notes or transcript first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: { tool: "meeting", payload: { "Meeting notes": notes, "Extra context": context } },
      });
      const p = JSON.parse(res.json) as Record<string, unknown>;
      setOut({
        summary: toLines(p["summary"]),
        keyPoints: toLines(p["keyPoints"]),
        keyDecisions: toLines(p["keyDecisions"]),
        actionItems: toLines(p["actionItems"]),
        deadlines: toLines(p["deadlines"]),
        followUps: toLines(p["followUps"]),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fullText = out
    ? `SUMMARY\n${out.summary}\n\nKEY DISCUSSION POINTS\n${out.keyPoints}\n\nKEY DECISIONS\n${out.keyDecisions}\n\nACTION ITEMS\n${out.actionItems}\n\nDEADLINES\n${out.deadlines}\n\nFOLLOW-UPS\n${out.followUps}`
    : "";

  const set = (k: keyof Sections) => (v: string) => setOut((o) => (o ? { ...o, [k]: v } : o));

  return (
    <AppLayout>
      <PageHeader
        title="Meeting Notes Summariser"
        description="Paste notes, a transcript or bullet points. Get a structured summary with decisions, owners and deadlines."
      />

      <section className="shadow-card space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-semibold">
            Your meeting notes
          </label>
          <Textarea
            id="notes"
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              "Paste your notes or transcript here...\n\nExample:\nThandi to finalise the school outreach budget by 28 Aug. Team agreed to move the workshop to Friday. Open question: who signs off on the printed materials?"
            }
            className="text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="ctx" className="text-sm font-semibold">
            Optional context
          </label>
          <Textarea
            id="ctx"
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Meeting title, attendees, project name..."
            className="text-sm"
          />
        </div>
        {error ? <ErrorState message={error} /> : null}
        <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Summarising…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate summary
            </>
          )}
        </Button>
      </section>

      {out ? (
        <section className="shadow-card space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Structured output</h2>
            <AiBadge />
          </div>
          <OutputField label="Summary" value={out.summary} onChange={set("summary")} rows={5} />
          <OutputField
            label="Key discussion points"
            value={out.keyPoints}
            onChange={set("keyPoints")}
          />
          <OutputField
            label="Key decisions"
            value={out.keyDecisions}
            onChange={set("keyDecisions")}
          />
          <OutputField
            label="Action items"
            value={out.actionItems}
            onChange={set("actionItems")}
            hint="Owners are only assigned where names appeared in your notes."
          />
          <OutputField label="Deadlines" value={out.deadlines} onChange={set("deadlines")} rows={3} />
          <OutputField
            label="Follow-ups & unresolved questions"
            value={out.followUps}
            onChange={set("followUps")}
            rows={3}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="secondary"
              onClick={() => {
                copyText(fullText);
                toast.success("Summary copied to clipboard");
              }}
            >
              Copy all
            </Button>
            <Button variant="outline" onClick={generate} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button
              onClick={() => {
                saveDoc({
                  type: "meeting",
                  title: context.trim() || out.summary.slice(0, 60) || "Meeting summary",
                  content: fullText,
                });
                toast.success("Saved to Saved Work");
              }}
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </section>
      ) : null}
    </AppLayout>
  );
}