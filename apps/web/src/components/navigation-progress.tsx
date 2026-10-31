"use client";
import { ProgressProvider } from "@bprogress/next/app";
import { type ReactNode, useEffect, useState } from "react";

export function NavigationProgress({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <ProgressProvider
      height="3px"
      color="var(--kio-color-brand)"
      shallowRouting
      options={{
        showSpinner: false,
        speed: reducedMotion ? 0 : 240,
        trickle: !reducedMotion,
      }}
      shouldCompareComplexProps
      disableSameURL
    >
      {children}
    </ProgressProvider>
  );
}
