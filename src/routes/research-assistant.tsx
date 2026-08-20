import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { AppLayout, PageHeader, AiDisclaimer } from "@/components/AppLayout";
import { AiBadge, ErrorState, OutputField, copyText, toLines } from "@/components/OutputBlock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateWithAI } from "@/lib/ai.functions";
import { saveDoc } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/research-assistant")({
  component: ResearchAssistant,
  head: () => ({
    meta: [
      { title: "AI Research Assistant | Work Assistant" },
      {
        name: "description",
        content:
          "Break a broad question into sub-questions, surface themes and build an organised research brief.",
      },
      { property: "og:title", content: "AI Research Assistant | Work Assistant" },
      {
        property: "og:description",
        content: "Structure research questions, themes, insights and gaps into a clear brief.",
      },
    ],
  }),
});

type Sections = {
  researchQuestion: string;
  subQuestions: string;
  keyFindings: string;
  mainThemes: string;
  insights: string;
  questionsToExplore: string;
  verificationNotes: string;
};

function ResearchAssistant() {
  const run = useServerFn(generateWithAI);
  const [question, setQuestion] = useState("");
  const [material, setMaterial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState<Sections | null>(null);

  async function generate() {
    if (!question.trim()) {
      setError("Enter a research question or topic to get started.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: {
          tool: "research",
          payload: {
            "Research question or topic": question,
            "Research material provided by the user": material,
          },
        },
      });
      const p = JSON.parse(res.json) as Record<string, unknown>;
      setOut({
        researchQuestion: toLines(p["researchQuestion"]),
        subQuestions: toLines(p["subQuestions"]),
        keyFindings: toLines(p["keyFindings"]),
        mainThemes: toLines(p["mainThemes"]),
        insights: toLines(p["insights"]),
        questionsToExplore: toLines(p["questionsToExplore"]),
        verificationNotes: toLines(p["verificationNotes"]),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const set = (k: keyof Sections) => (v: string) => setOut((o) => (o ? { ...o, [k]: v } : o));
  const fullText = out
    ? `RESEARCH QUESTION\n${out.researchQuestion}\n\nSUB-QUESTIONS\n${out.subQuestions}\n\nKEY FINDINGS\n${out.keyFindings}\n\nMAIN THEMES\n${out.mainThemes}\n\nINSIGHTS\n${out.insights}\n\nQUESTIONS TO EXPLORE FURTHER\n${out.questionsToExplore}\n\nNEEDS VERIFICATION\n${out.verificationNotes}`
    : "";

  return (
    <AppLayout>
      <PageHeader
        title="AI Research Assistant"
        description="Shape a broad question into a structured brief. Findings drawn from material you paste are grounded; everything else is a suggestion to verify."
      />

      <section className="shadow-card space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="q" className="text-sm font-semibold">
            Research question or topic
          </label>
          <Textarea
            id="q"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What makes workplace wellbeing programmes effective in small organisations?"
            className="text-sm leading-relaxed"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="mat" className="text-sm font-semibold">
            Material you&apos;ve gathered (optional)
          </label>
          <p className="text-xs text-muted-foreground">
            Paste articles, notes or data. Anything you provide is treated as your source material.
          </p>
          <Textarea
            id="mat"
            rows={8}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Paste reports, notes, interview transcripts or excerpts here..."
            className="text-sm leading-relaxed"
          />
        </div>
        {error ? <ErrorState message={error} /> : null}
        <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Building brief…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate research brief
            </>
          )}
        </Button>
      </section>

      {out ? (
        <section className="shadow-card space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Research brief</h2>
            <AiBadge />
          </div>
          <div className="bg-gradient-soft rounded-xl border border-border p-4">
            <p className="text-xs font-semibold tracking-wide text-accent-foreground uppercase">
              Provided by you
            </p>
            <p className="mt-2 text-sm whitespace-pre-wrap">{question}</p>
            {material.trim() ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Plus {material.trim().split(/\s+/).length} words of your own source material.
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                No source material supplied — the sections below are AI suggestions only.
              </p>
            )}
          </div>
          <OutputField
            label="Research question"
            value={out.researchQuestion}
            onChange={set("researchQuestion")}
            rows={2}
          />
          <OutputField
            label="Smaller research questions"
            value={out.subQuestions}
            onChange={set("subQuestions")}
          />
          <OutputField
            label="Key findings"
            value={out.keyFindings}
            onChange={set("keyFindings")}
            hint="Findings are summarised from your material where provided, otherwise they are unverified suggestions."
          />
          <OutputField label="Main themes" value={out.mainThemes} onChange={set("mainThemes")} />
          <OutputField label="Insights" value={out.insights} onChange={set("insights")} />
          <OutputField
            label="Questions to explore further"
            value={out.questionsToExplore}
            onChange={set("questionsToExplore")}
          />
          <OutputField
            label="Needs independent verification"
            value={out.verificationNotes}
            onChange={set("verificationNotes")}
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                copyText(fullText);
                toast.success("Brief copied to clipboard");
              }}
            >
              Copy brief
            </Button>
            <Button variant="outline" onClick={generate} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button
              onClick={() => {
                saveDoc({
                  type: "research",
                  title: out.researchQuestion.slice(0, 70) || "Research brief",
                  content: fullText,
                });
                toast.success("Saved to Saved Work");
              }}
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
          <AiDisclaimer extra="Research output is not fact-checked — verify important facts, figures and sources independently before relying on them." />
        </section>
      ) : null}
    </AppLayout>
  );
}