import { LabProject, labMetadata } from "@/components/lab-project";
import LatticeGenerator from "./runtime";

export const metadata = labMetadata("lattice");
export default function Page() {
  return (
    <LabProject slug="lattice">
      <LatticeGenerator />
    </LabProject>
  );
}
