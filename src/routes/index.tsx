import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Mail, Search, ArrowRight, Clock, FolderOpen, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useSavedDocs } from "@/hooks/useSavedDocs";
import { TYPE_LABEL } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Work Assistant Dashboard | Let's Talk. Period!" },
      {
        name: "description",
        content:
          "An AI workplace productivity dashboard for meeting summaries, email drafting and research briefs.",
      },
      { property: "og:title", content: "Work Assistant Dashboard | Let's Talk. Period!" },
      {
        property: "og:description",
        content: "Summarise meetings, draft emails and build research briefs in one workspace.",
      },
    ],
  }),
});

const TOOLS = [
  {
    to: "/meeting-summariser",
    icon: FileText,
    title: "Meeting Notes Summariser",
    copy: "Turn raw notes into decisions, owners and deadlines.",
  },
  {
    to: "/email-generator",
    icon: Mail,
    title: "Smart Email Generator",
    copy: "Draft on-tone professional emails in seconds.",
  },
  {
    to: "/research-assistant",
    icon: Search,
    title: "AI Research Assistant",
    copy: "Structure questions, themes and insights into a brief.",
  },
] as const;

function Dashboard() {
  const docs = useSavedDocs();
  const [name, setName] = useState("");

  useEffect(() => {
    const sync = () => setName(localStorage.getItem("ltp-name") ?? "");
    sync();
    window.addEventListener("ltp-docs-changed", sync);
    return () => window.removeEventListener("ltp-docs-changed", sync);
  }, []);

  const thisWeek = docs.filter(
    (d) => Date.now() - new Date(d.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const actionItems = docs
    .filter((d) => d.type === "meeting")
    .reduce((n, d) => n + (d.content.match(/•/g)?.length ?? 0), 0);

  const stats = [
    { label: "Documents created", value: docs.length },
    { label: "Created this week", value: thisWeek },
    { label: "Action items captured", value: actionItems },
    { label: "Est. hours saved", value: Math.round(docs.length * 0.4 * 10) / 10 },
  ];

  return (
    <AppLayout>
      <section className="bg-gradient-soft shadow-card relative overflow-hidden rounded-3xl border border-border p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" /> AI workplace productivity
        </span>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Welcome back{name ? `, ${name}` : ""}.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Spend less time on meeting admin, email writing and research. Draft it here, review it,
          then make it yours.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, copy }) => (
          <Link
            key={to}
            to={to}
            className="shadow-card group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-elevated"
          >
            <span className="bg-primary-soft flex h-10 w-10 items-center justify-center rounded-xl text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="shadow-card rounded-2xl border border-border bg-card p-5">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="shadow-card rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <FolderOpen className="h-4 w-4 text-primary" /> Recent documents
          </h2>
          <ul className="mt-4 space-y-3">
            {docs.slice(0, 5).map((d) => (
              <li key={d.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="truncate text-sm font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABEL[d.type]} · {new Date(d.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
            {docs.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No documents yet — start with a tool above.
              </li>
            ) : null}
          </ul>
        </div>

        <div className="shadow-card rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-4 w-4 text-primary" /> Recent activity
          </h2>
          <ul className="mt-4 space-y-3">
            {docs.slice(0, 5).map((d) => (
              <li key={d.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  Saved a {TYPE_LABEL[d.type].toLowerCase()}{" "}
                  <span className="text-muted-foreground">
                    · {new Date(d.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </li>
            ))}
            {docs.length === 0 ? (
              <li className="text-sm text-muted-foreground">Your activity will appear here.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </AppLayout>
  );
}
