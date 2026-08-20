export type SavedDoc = {
  id: string;
  type: "meeting" | "email" | "research";
  title: string;
  content: string;
  createdAt: string;
};

const KEY = "ltp-work-assistant-docs";

export function loadDocs(): SavedDoc[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as SavedDoc[];
  } catch {
    return [];
  }
}

export function saveDoc(doc: Omit<SavedDoc, "id" | "createdAt">): SavedDoc {
  const full: SavedDoc = {
    ...doc,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const docs = [full, ...loadDocs()];
  window.localStorage.setItem(KEY, JSON.stringify(docs));
  window.dispatchEvent(new Event("ltp-docs-changed"));
  return full;
}

export function deleteDoc(id: string) {
  window.localStorage.setItem(KEY, JSON.stringify(loadDocs().filter((d) => d.id !== id)));
  window.dispatchEvent(new Event("ltp-docs-changed"));
}

export const TYPE_LABEL: Record<SavedDoc["type"], string> = {
  meeting: "Meeting summary",
  email: "Email draft",
  research: "Research brief",
};