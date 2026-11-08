import { BreakoutPreview } from "@kiochan/lab-breakout/preview";
import { CubismPreview } from "@kiochan/lab-cubism/preview";
import { LatticePreview } from "@kiochan/lab-lattice/preview";
import { LiquidPreview } from "@kiochan/lab-liquid/preview";
import { SnakePreview } from "@kiochan/lab-snake/preview";
import { TextureArrayPreview } from "@kiochan/lab-texture-array/preview";
import type { Metadata } from "next";
import { LabCard } from "@/components/lab-card";
import { Localized } from "@/components/language-provider";
import { experiments } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Small tools, playful experiments, and ideas you can try in your browser.",
  alternates: { canonical: "/lab" },
};
const previews = {
  "texture-array": TextureArrayPreview,
  liquid: LiquidPreview,
  lattice: LatticePreview,
  cubism: CubismPreview,
  breakout: BreakoutPreview,
  snake: SnakePreview,
};

export default function LabPage() {
  return (
    <section className="py-2">
      <p className="eyebrow">
        <Localized text="The lab" />
      </p>
      <h1 className="mt-5 text-5xl font-medium tracking-tight sm:text-6xl">
        <Localized text="Small ideas. Open tabs" />
        <span className="text-brand">.</span>
      </h1>
      <p className="mt-6 max-w-xl leading-8 text-ink-muted">
        <Localized text="A home for the useful, the curious, and the just-for-fun. These are little projects to open and play with, all in one place." />{" "}
      </p>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {experiments.map((experiment) => {
          const Preview = previews[experiment.slug];
          return (
            <LabCard key={experiment.slug} experiment={experiment}>
              <Preview />
            </LabCard>
          );
        })}
      </div>
      <p className="mt-10 text-sm text-ink-muted">
        <Localized text="An evolving collection. More experiments will find their way here." />{" "}
      </p>
    </section>
  );
}
