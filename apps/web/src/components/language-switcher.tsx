"use client";

import { useEffect, useId, useRef, useState } from "react";
import { languages, useLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLFieldSetElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected =
    languages.find(({ code }) => code === language) ?? languages[0];
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <fieldset
      aria-label={t("Language")}
      ref={container}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`${t("Language")}: ${selected.name}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 min-w-11 items-center justify-center rounded-[var(--kio-radius-control)] border border-edge bg-canvas px-3 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kio-color-focus)]"
      >
        <span lang={language}>{selected.short}</span>
      </button>
      <fieldset
        id={id}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-xl border border-edge bg-canvas p-1.5 shadow-lg"
        aria-label={t("Language")}
      >
        {languages.map(({ code, name }) => (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={code === language}
            onClick={() => {
              setLanguage(code);
              setOpen(false);
              trigger.current?.focus();
            }}
            className={`block min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-[var(--kio-color-focus)] ${code === language ? "bg-surface-muted font-medium text-brand" : "text-ink"}`}
          >
            {name}
          </button>
        ))}
      </fieldset>
    </fieldset>
  );
}
