import { getStreaks } from "@/lib/data";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
  const streaks = await getStreaks();
  return <DashboardContent streaks={streaks} />;
}
