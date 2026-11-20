"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () =>
    import("@kiochan/lab-texture-array").then((module) => module.TextureArray),
  {
    loading: () => <LoadingState label="Loading texture editor" />,
  },
);
export default function TextureArrayRuntime({
  workspace = false,
}: {
  workspace?: boolean;
} = {}) {
  const { t } = useLanguage();
  return <Experiment workspace={workspace} translate={t} />;
}
