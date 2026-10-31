import { LatticeGenerator } from "@kiochan/lab-lattice";
import { LabProject, labMetadata } from "@/components/lab-project";

export const metadata = labMetadata("lattice");
export default function Page() {
  return (
    <LabProject slug="lattice">
      <LatticeGenerator />
    </LabProject>
  );
}
