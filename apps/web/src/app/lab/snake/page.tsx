import { LabProject, labMetadata } from "@/components/lab-project";
import { readLabSource } from "@/lib/lab-source";
import QuickSnake from "./runtime";
export const metadata = labMetadata("snake");
export default async function Page() {
  return (
    <LabProject slug="snake" source={await readLabSource("snake")}>
      <QuickSnake />
    </LabProject>
  );
}
