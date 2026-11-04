"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLanguage } from "./language-provider";

const modes = [
  { value: "light", symbol: "light_mode", label: "Light" },
  { value: "dark", symbol: "dark_mode", label: "Dark" },
  { value: "system", symbol: "A", label: "Auto" },
] as const;
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <fieldset
      aria-label={t("Theme")}
      className="inline-flex items-center rounded-[var(--kio-radius-control)] border border-edge bg-canvas p-0.5"
    >
      {modes.map(({ value, symbol, label }) => (
        <button
          key={value}
          type="button"
          disabled={!mounted}
          aria-label={t(label)}
          title={t(label)}
          aria-pressed={mounted && theme === value}
          onClick={() => setTheme(value)}
          className={`flex size-9 items-center justify-center rounded-[var(--kio-radius-control)] text-sm transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kio-color-focus)] disabled:opacity-50 ${mounted && theme === value ? "bg-surface-muted font-medium text-brand" : "text-ink-muted"}`}
        >
          {symbol === "A" ? (
            <span aria-hidden="true">A</span>
          ) : (
            <MaterialIcon name={symbol} className="size-[18px]" />
          )}
        </button>
      ))}
    </fieldset>
  );
}
