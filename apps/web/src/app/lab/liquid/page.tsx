import { LabProject, labMetadata } from "@/components/lab-project";
import LiquidPlayground from "./runtime";

export const metadata = labMetadata("liquid");
export default function Page() {
  return (
    <LabProject slug="liquid">
      <LiquidPlayground />
    </LabProject>
  );
}
