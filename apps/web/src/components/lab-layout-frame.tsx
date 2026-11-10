"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LabNavigation } from "./lab-navigation";

export function LabLayoutFrame({ children }: { children: ReactNode }) {
  const workspace = usePathname() === "/lab/texture-array/app";
  return (
    <div
      className={
        workspace
          ? "mx-auto grid w-full max-w-[1800px] gap-4 px-4 py-5 lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-6"
          : "mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10 lg:py-12"
      }
    >
      <LabNavigation />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
