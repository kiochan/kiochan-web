"use client";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () => import("@kiochan/lab-breakout").then((module) => module.Breakout),
  { loading: () => <LoadingState label="Loading experiment" /> },
);
export default Experiment;
