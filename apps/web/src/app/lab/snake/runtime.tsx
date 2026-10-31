"use client";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () => import("@kiochan/lab-snake").then((module) => module.QuickSnake),
  { loading: () => <LoadingState label="Loading experiment" /> },
);
export default Experiment;
