"use client";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () =>
    import("@kiochan/lab-texture-array").then((module) => module.TextureArray),
  {
    loading: () => <LoadingState label="Loading texture editor" />,
  },
);
export default Experiment;
