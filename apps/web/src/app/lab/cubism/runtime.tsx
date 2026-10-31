"use client";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () => import("@kiochan/lab-cubism").then((module) => module.CubismWorkbench),
  { loading: () => <LoadingState label="Loading experiment" /> },
);
export default Experiment;
