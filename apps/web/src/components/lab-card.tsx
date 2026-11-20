"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Localized } from "@/components/language-provider";
import { ArrowIcon } from "@/components/site-shell";
import type { experiments } from "@/content/lab";
import styles from "./lab-card.module.css";

type Experiment = (typeof experiments)[number];
export function LabCard({
  experiment,
  children,
}: {
  experiment: Experiment;
  children: ReactNode;
}) {
  const card = useRef<HTMLElement>(null);
  const title = useId();
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  useEffect(() => {
    const element = card.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setForeground(!document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) =>
              setVisible(entries.some((entry) => entry.isIntersecting)),
            { threshold: 0.1 },
          )
        : null;
    if (observer) observer.observe(element);
    else setVisible(true);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  const playing =
    visible && foreground && !reducedMotion && (hovered || keyboardFocus);
  return (
    <article
      ref={card}
      data-lab-card={experiment.slug}
      data-preview-playing={playing}
      data-reveal
      aria-labelledby={title}
      className={`lab-card ${styles.card}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false);
      }}
    >
      <Link
        href={`/lab/${experiment.slug}`}
        className={styles.link}
        aria-labelledby={title}
        onFocus={(event) =>
          setKeyboardFocus(event.currentTarget.matches(":focus-visible"))
        }
        onBlur={() => setKeyboardFocus(false)}
      >
        <div className={styles.preview}>{children}</div>
        <div className={styles.copy}>
          <p className="eyebrow">
            <Localized text={experiment.category} /> / {experiment.stack}
          </p>
          <h2 id={title} className="mt-4 text-2xl font-medium tracking-tight">
            {experiment.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            <Localized text={experiment.description} />
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {experiment.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink-muted"
              >
                <Localized text={tag} />
              </li>
            ))}
          </ul>
          <span className={styles.open}>
            <Localized text="Open experiment" /> <ArrowIcon diagonal />
          </span>
        </div>
      </Link>
    </article>
  );
}
