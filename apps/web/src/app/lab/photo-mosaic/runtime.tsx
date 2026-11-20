"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

const PhotoMosaic = dynamic(
  () =>
    import("@kiochan/lab-photo-mosaic").then((module) => module.PhotoMosaic),
  { loading: () => <LoadingState label="Loading photo mosaic editor" /> },
);

export default PhotoMosaic;
