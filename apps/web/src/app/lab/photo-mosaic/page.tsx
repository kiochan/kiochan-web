import { LabProject, labMetadata } from "@/components/lab-project";
import PhotoMosaic from "./runtime";

export const metadata = labMetadata("photo-mosaic");

export default function Page() {
  return (
    <LabProject slug="photo-mosaic">
      <PhotoMosaic />
    </LabProject>
  );
}
