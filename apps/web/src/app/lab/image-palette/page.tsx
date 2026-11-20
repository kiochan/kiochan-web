import { LabProject, labMetadata } from "@/components/lab-project";
import ImagePalette from "./runtime";

export const metadata = labMetadata("image-palette");

export default function Page() {
  return (
    <LabProject slug="image-palette">
      <ImagePalette />
    </LabProject>
  );
}
