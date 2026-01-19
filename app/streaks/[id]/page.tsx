import { getStreakById } from "@/lib/data";
import { StreakProfileContent } from "@/components/StreakProfileContent";
import { notFound } from "next/navigation";

interface StreakPageProps {
  params: Promise<{ id: string }>;
}

export default async function StreakPage({ params }: StreakPageProps) {
  const { id } = await params;
  const streak = await getStreakById(id);

  if (!streak) {
    notFound();
  }

  return <StreakProfileContent streak={streak} />;
}
