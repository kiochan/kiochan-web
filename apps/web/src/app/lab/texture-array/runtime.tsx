"use client";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";
import { textureArrayChinese } from "@/content/site";

const translateChinese = (message: string) =>
  textureArrayChinese[message] ?? message;
function TextureLoading() {
  const { language } = useLanguage();
  return (
    <LoadingState
      label={
        language === "zh"
          ? translateChinese("Loading texture editor")
          : "Loading texture editor"
      }
    />
  );
}

const Experiment = dynamic(
  () =>
    import("@kiochan/lab-texture-array").then((module) => module.TextureArray),
  {
    loading: TextureLoading,
  },
);
export default function TextureArrayRuntime() {
  const { language } = useLanguage();
  return (
    <Experiment translate={language === "zh" ? translateChinese : undefined} />
  );
}
