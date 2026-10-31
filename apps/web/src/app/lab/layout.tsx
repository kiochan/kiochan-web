import type { ReactNode } from "react";
import { LabNavigation } from "@/components/lab-navigation";
export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10 lg:py-12">
      <LabNavigation />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
