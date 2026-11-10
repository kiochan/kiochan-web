import { useCallback, useEffect, useRef, useState } from "react";
import { type Project, restoreStoredProject, storeProject } from "./project";

export function useProjectStorage(
  project: Project,
  onRestore: (project: Project) => void,
) {
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "pending" | "saved" | "blocked" | "error"
  >("loading");
  const canSave = useRef(false);
  const latest = useRef(project);
  const lastSaved = useRef<Project | null>(null);
  latest.current = project;

  useEffect(() => {
    try {
      const restored = restoreStoredProject(window.localStorage);
      if (restored) {
        latest.current = restored;
        onRestore(restored);
        lastSaved.current = restored;
      }
      canSave.current = true;
      setStatus(restored ? "saved" : "pending");
    } catch {
      // Preserve an unreadable saved copy until an explicit New/Open/Replace action.
      canSave.current = false;
      setStatus("blocked");
    }
    setHydrated(true);
  }, [onRestore]);

  const saveNow = useCallback((next = latest.current, replace = false) => {
    if (!canSave.current && !replace) return false;
    try {
      if (lastSaved.current !== next) storeProject(window.localStorage, next);
      lastSaved.current = next;
      canSave.current = true;
      setStatus("saved");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !canSave.current || lastSaved.current === project) return;
    setStatus("pending");
    const timer = setTimeout(() => saveNow(project), 700);
    return () => clearTimeout(timer);
  }, [project, hydrated, saveNow]);

  useEffect(() => {
    const flush = () => {
      if (!canSave.current || lastSaved.current === latest.current) return;
      try {
        storeProject(window.localStorage, latest.current);
        lastSaved.current = latest.current;
      } catch {
        /* Explicit navigation uses saveNow so failures remain visible. */
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
  return { hydrated, status, saveNow };
}
