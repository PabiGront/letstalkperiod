import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Copy } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useSavedDocs } from "@/hooks/useSavedDocs";
import { deleteDoc, TYPE_LABEL } from "@/lib/storage";
import { copyText } from "@/components/OutputBlock";
import { toast } from "sonner";

export const Route = createFileRoute("/saved-work")({
  component: SavedWork,
  head: () => ({
    meta: [
      { title: "Saved Work | Work Assistant" },
      {
        name: "description",
        content: "Every summary, email draft and research brief you've saved, in one place.",
      },
      { property: "og:title", content: "Saved Work | Work Assistant" },
      {
        property: "og:description",
        content: "Browse, copy and manage your saved AI-assisted documents.",
      },
    ],
  }),
});

function SavedWork() {
  const docs = useSavedDocs();

  return (
    <AppLayout>
      <PageHeader
        title="Saved Work"
        description="Documents you've saved from the AI tools. Stored privately in this browser."
      />
      {docs.length === 0 ? (
        <div className="shadow-card rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Generate a summary, email or research brief and hit Save.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <article
              key={doc.id}
              className="shadow-card space-y-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                    {TYPE_LABEL[doc.type]}
                  </span>
                  <h2 className="mt-2 text-base font-semibold">{doc.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      copyText(doc.content);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteDoc(doc.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <pre className="max-h-64 overflow-auto rounded-xl bg-muted/60 p-4 text-xs leading-relaxed whitespace-pre-wrap">
                {doc.content}
              </pre>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  );
}