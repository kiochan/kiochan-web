import { LabProject, labMetadata } from "@/components/lab-project";
import TextureArray from "../runtime";

const base = labMetadata("texture-array");
export const metadata = {
  ...base,
  title: "Texture Array Workspace · Lab",
  alternates: { canonical: "/lab/texture-array/app" },
  openGraph: { ...base.openGraph, url: "/lab/texture-array/app" },
};
export default function Page() {
  return (
    <LabProject slug="texture-array" compact>
      <TextureArray workspace />
    </LabProject>
  );
}
