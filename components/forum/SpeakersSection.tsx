import { prisma } from "@/lib/prisma";
import { Speakers } from "./Speakers";

/**
 * Server Component — fetches visible speakers from Postgres
 * and passes them directly to the Client Component.
 * Wrap in <Suspense> in page.tsx to show a skeleton while loading.
 */
export async function SpeakersSection() {
  const speakers = await prisma.speaker.findMany({
    where:   { visible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id:          true,
      name:        true,
      position:    true,
      company:     true,
      description: true,
      imageUrl:    true,
      country:     true,
      continent:   true,
      featured:    true,
    },
  });

  return <Speakers initialSpeakers={speakers} />;
}
