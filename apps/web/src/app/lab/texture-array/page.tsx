import { LabProject, labMetadata } from "@/components/lab-project";
import TextureArray from "./runtime";

export const metadata = labMetadata("texture-array");
export default function Page() {
  return (
    <LabProject slug="texture-array">
      <TextureArray />
    </LabProject>
  );
}
