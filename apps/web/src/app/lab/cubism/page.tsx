import { CubismWorkbench } from "@kiochan/lab-cubism";
import { LabProject, labMetadata } from "@/components/lab-project";

export const metadata = labMetadata("cubism");
export default function Page() {
  return (
    <LabProject slug="cubism">
      <CubismWorkbench />
    </LabProject>
  );
}
