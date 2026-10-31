import { LiquidPlayground } from "@kiochan/lab-liquid";
import { LabProject, labMetadata } from "@/components/lab-project";

export const metadata = labMetadata("liquid");
export default function Page() {
  return (
    <LabProject slug="liquid">
      <LiquidPlayground />
    </LabProject>
  );
}
