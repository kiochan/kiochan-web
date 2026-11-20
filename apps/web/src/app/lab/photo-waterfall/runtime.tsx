"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Editor = dynamic(
  () =>
    import("@kiochan/lab-photo-waterfall").then(
      (module) => module.PhotoWaterfall,
    ),
  { loading: () => <LoadingState label="Loading photo waterfall editor" /> },
);

export default function PhotoWaterfall() {
  const { language, t } = useLanguage();
  return <Editor locale={language} t={t} />;
}
