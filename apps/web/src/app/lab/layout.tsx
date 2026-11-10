import type { ReactNode } from "react";
import { LabLayoutFrame } from "@/components/lab-layout-frame";
export default function LabLayout({ children }: { children: ReactNode }) {
  return <LabLayoutFrame>{children}</LabLayoutFrame>;
}
