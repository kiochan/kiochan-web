import { LabProject, labMetadata } from "@/components/lab-project";
import { readLabSource } from "@/lib/lab-source";
import Breakout from "./runtime";
export const metadata = labMetadata("breakout");
export default async function Page() {
  return (
    <LabProject slug="breakout" source={await readLabSource("breakout")}>
      <Breakout />
    </LabProject>
  );
}
