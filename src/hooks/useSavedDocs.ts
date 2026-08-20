import { useEffect, useState } from "react";
import { loadDocs, type SavedDoc } from "@/lib/storage";

export function useSavedDocs() {
  const [docs, setDocs] = useState<SavedDoc[]>([]);

  useEffect(() => {
    const sync = () => setDocs(loadDocs());
    sync();
    window.addEventListener("ltp-docs-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ltp-docs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return docs;
}