import { getStreaks } from "@/lib/data";
import AIChat from "@/components/AIChat";

export default async function AIPage() {
    const streaks = await getStreaks();
    return <AIChat initialStreaks={streaks} />;
}