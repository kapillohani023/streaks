import { getStreaks } from "@/lib/data";
import { StreaksContent } from "@/components/StreaksContent";

export default async function StreaksPage() {
    const streaks = await getStreaks();
    return <StreaksContent streaks={streaks} />;
}
