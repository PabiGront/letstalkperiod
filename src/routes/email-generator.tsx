import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { AiBadge, ErrorState, OutputField, copyText, toLines } from "@/components/OutputBlock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateWithAI } from "@/lib/ai.functions";
import { saveDoc } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/email-generator")({
  component: EmailGenerator,
  head: () => ({
    meta: [
      { title: "Smart Email Generator | Work Assistant" },
      {
        name: "description",
        content: "Draft polished, on-tone professional emails in seconds — always editable.",
      },
      { property: "og:title", content: "Smart Email Generator | Work Assistant" },
      {
        property: "og:description",
        content: "Describe the message, pick a tone and length, and get an editable email draft.",
      },
    ],
  }),
});

const TONES = ["Professional", "Friendly", "Concise", "Formal", "Persuasive", "Apologetic"];
const LENGTHS = ["Short", "Medium", "Detailed"];

function EmailGenerator() {
  const run = useServerFn(generateWithAI);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [has, setHas] = useState(false);

  async function generate() {
    if (!message.trim()) {
      setError("Tell the assistant what you want to communicate.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: {
          tool: "email",
          payload: {
            "What to communicate": message,
            "Recipient and context": recipient,
            "Key points that must be included": keyPoints,
            Tone: tone,
            Length: length,
          },
        },
      });
      const p = JSON.parse(res.json) as Record<string, unknown>;
      setSubject(toLines(p["subject"]));
      setBody(toLines(p["body"]));
      setHas(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Smart Email Generator"
        description="Describe the message, choose a tone and length, and get a polished draft you can edit. Nothing is ever sent for you."
      />

      <section className="shadow-card space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-2">
          <label htmlFor="msg" className="text-sm font-semibold">
            What do you want to communicate?
          </label>
          <Textarea
            id="msg"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Ask the school principal to confirm a date for the September workshop and share the venue requirements."
            className="text-sm leading-relaxed"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="rec" className="text-sm font-semibold">
              Recipient / context
            </label>
            <Input
              id="rec"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Principal Dlamini, external partner"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Length</label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="kp" className="text-sm font-semibold">
            Key points to include (optional)
          </label>
          <Textarea
            id="kp"
            rows={3}
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="One point per line"
            className="text-sm"
          />
        </div>
        {error ? <ErrorState message={error} /> : null}
        <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Writing draft…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate email
            </>
          )}
        </Button>
      </section>

      {has ? (
        <section className="shadow-card space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your draft</h2>
            <AiBadge />
          </div>
          <OutputField label="Subject" value={subject} onChange={setSubject} rows={1} />
          <OutputField label="Email body" value={body} onChange={setBody} rows={14} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                copyText(`Subject: ${subject}\n\n${body}`);
                toast.success("Draft copied to clipboard");
              }}
            >
              Copy email
            </Button>
            <Button variant="outline" onClick={generate} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
            <Button
              onClick={() => {
                saveDoc({
                  type: "email",
                  title: subject || "Email draft",
                  content: `Subject: ${subject}\n\n${body}`,
                });
                toast.success("Saved to Saved Work");
              }}
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This assistant only drafts emails — it never sends them.
          </p>
        </section>
      ) : null}
    </AppLayout>
  );
}