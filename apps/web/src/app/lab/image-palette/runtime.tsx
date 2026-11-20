"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Editor = dynamic(
  () =>
    import("@kiochan/lab-image-palette").then((module) => module.ImagePalette),
  { loading: () => <LoadingState label="Loading image palette tool" /> },
);

export default function ImagePalette() {
  const { t } = useLanguage();
  return <Editor t={t} />;
}
