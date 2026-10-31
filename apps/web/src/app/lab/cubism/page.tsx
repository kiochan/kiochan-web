import { LabProject, labMetadata } from "@/components/lab-project";
import CubismWorkbench from "./runtime";

export const metadata = labMetadata("cubism");
export default function Page() {
  return (
    <LabProject slug="cubism">
      <CubismWorkbench />
    </LabProject>
  );
}
