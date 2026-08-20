import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function OutputField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold">{label}</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
          onClick={() => {
            copyText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <Textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="resize-y bg-background text-sm leading-relaxed"
      />
    </div>
  );
}

export function AiBadge() {
  return (
    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
      AI generated · editable
    </span>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

export function toLines(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          const o = item as Record<string, string>;
          const owner = o["owner"] ? ` — ${o["owner"]}` : "";
          const due = o["due"] ? ` (due: ${o["due"]})` : "";
          return `• ${o["task"] ?? Object.values(o).join(" ")}${owner}${due}`;
        }
        return `• ${String(item)}`;
      })
      .join("\n");
  }
  if (typeof value === "string") return value;
  return "";
}