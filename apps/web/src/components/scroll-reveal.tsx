"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
  const pathname = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Navigation replaces the server-rendered cards observed by this effect.
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          animations.push(
            entry.target.animate(
              [
                { opacity: 0, transform: "translateY(16px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 500, easing: "cubic-bezier(.2,.7,.2,1)" },
            ),
          );
        }
      },
      { threshold: 0.08 },
    );
    for (const element of document.querySelectorAll("[data-reveal]"))
      observer.observe(element);
    const stop = () => {
      observer.disconnect();
      for (const animation of animations) animation.cancel();
    };
    preference.addEventListener("change", stop);
    return () => {
      stop();
      preference.removeEventListener("change", stop);
    };
  }, [pathname]);
  return null;
}
