"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const id = useId();

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="text-ink-muted">
        Theme
      </label>
      <select
        id={id}
        value={mounted ? theme : "system"}
        disabled={!mounted}
        onChange={(event) => setTheme(event.target.value)}
        className="h-9 w-28 rounded-[var(--kio-radius-control)] border border-[var(--kio-color-border)] bg-canvas px-3 text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--kio-color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
