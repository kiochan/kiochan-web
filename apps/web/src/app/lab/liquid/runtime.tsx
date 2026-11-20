"use client";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () => import("@kiochan/lab-liquid").then((module) => module.LiquidPlayground),
  { loading: () => <LoadingState label="Loading experiment" /> },
);

export default function LiquidRuntime() {
  const { t } = useLanguage();
  return <Experiment t={t} />;
}
