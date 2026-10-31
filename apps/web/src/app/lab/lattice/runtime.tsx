"use client";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const Experiment = dynamic(
  () =>
    import("@kiochan/lab-lattice").then((module) => module.LatticeGenerator),
  { loading: () => <LoadingState label="Loading experiment" /> },
);
export default Experiment;
