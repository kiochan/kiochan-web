"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Localized } from "@/components/language-provider";
import { ArrowIcon } from "@/components/site-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
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
  const [manual, setManual] = useState<"auto" | "play" | "pause">("auto");
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
    visible &&
    foreground &&
    !reducedMotion &&
    (manual === "play" || (manual === "auto" && (hovered || keyboardFocus)));
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
      onFocusCapture={(event) =>
        setKeyboardFocus(event.target.matches(":focus-visible"))
      }
      onBlurCapture={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        )
          return;
        setKeyboardFocus(false);
        setManual("auto");
      }}
    >
      <Link
        href={`/lab/${experiment.slug}`}
        className={styles.link}
        aria-labelledby={title}
      >
        <div className={styles.preview}>
          {children}
          <span className={styles.badge}>
            <Localized
              text={
                experiment.slug === "cubism"
                  ? "Manifest inspection"
                  : "Illustrated preview"
              }
            />
          </span>
        </div>
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
          <span className={styles.open}>
            <Localized text="Open experiment" /> <ArrowIcon diagonal />
          </span>
        </div>
      </Link>
      <div className={styles.controls}>
        <span className={styles.hint}>
          <Localized
            text={
              reducedMotion
                ? "Reduced motion enabled"
                : "Hover or focus to preview"
            }
          />
        </span>
        <span className={styles.touchHint}>
          <Localized
            text={
              reducedMotion
                ? "Reduced motion enabled"
                : "Preview before you open"
            }
          />
        </span>
        <button
          type="button"
          disabled={reducedMotion}
          aria-pressed={playing}
          aria-label={`${playing ? "Pause" : "Play"} ${experiment.name} preview`}
          className={styles.button}
          onClick={() => setManual(playing ? "pause" : "play")}
        >
          <MaterialIcon
            name={playing ? "pause" : "play_arrow"}
            className="size-4"
          />
          <Localized
            text={
              reducedMotion
                ? "Motion off"
                : playing
                  ? "Pause preview"
                  : "Play preview"
            }
          />
        </button>
      </div>
    </article>
  );
}
