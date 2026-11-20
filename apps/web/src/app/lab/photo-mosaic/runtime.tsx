"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Editor = dynamic(
  () =>
    import("@kiochan/lab-photo-mosaic").then((module) => module.PhotoMosaic),
  { loading: () => <LoadingState label="Loading photo mosaic editor" /> },
);

export default function PhotoMosaic() {
  const { language, t } = useLanguage();
  return <Editor locale={language} t={t} />;
}
