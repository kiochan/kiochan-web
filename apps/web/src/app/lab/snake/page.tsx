import { QuickSnake } from "@kiochan/lab-snake";
import { LabProject, labMetadata } from "@/components/lab-project";
import { readLabSource } from "@/lib/lab-source";
export const metadata = labMetadata("snake");
export default async function Page() {
  return (
    <LabProject slug="snake" source={await readLabSource("snake")}>
      <QuickSnake />
    </LabProject>
  );
}
