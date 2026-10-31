import { Breakout } from "@kiochan/lab-breakout";
import { LabProject, labMetadata } from "@/components/lab-project";
import { readLabSource } from "@/lib/lab-source";
export const metadata = labMetadata("breakout");
export default async function Page() {
  return (
    <LabProject slug="breakout" source={await readLabSource("breakout")}>
      <Breakout />
    </LabProject>
  );
}
