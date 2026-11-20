"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const PhotoWaterfall = dynamic(
  () =>
    import("@kiochan/lab-photo-waterfall").then(
      (module) => module.PhotoWaterfall,
    ),
  { loading: () => <LoadingState label="Loading photo waterfall editor" /> },
);

export default PhotoWaterfall;
