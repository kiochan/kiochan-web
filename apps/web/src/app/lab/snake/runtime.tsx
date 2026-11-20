"use client";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () => import("@kiochan/lab-snake").then((module) => module.QuickSnake),
  { loading: () => <LoadingState label="Loading experiment" /> },
);

export default function SnakeRuntime() {
  const { t } = useLanguage();
  return <Experiment t={t} />;
}
