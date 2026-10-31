import { TypePlayground } from "@kiochan/lab-type-playground";
import { LabProject, labMetadata } from "@/components/lab-project";

export const metadata = labMetadata("type-playground");
export default function Page() {
  return (
    <LabProject slug="type-playground">
      <TypePlayground />
    </LabProject>
  );
}
