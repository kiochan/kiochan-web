import { LabProject, labMetadata } from "@/components/lab-project";
import PhotoWaterfall from "./runtime";

export const metadata = labMetadata("photo-waterfall");

export default function Page() {
  return (
    <LabProject slug="photo-waterfall">
      <PhotoWaterfall />
    </LabProject>
  );
}
