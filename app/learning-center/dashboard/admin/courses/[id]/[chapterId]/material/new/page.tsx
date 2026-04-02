import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getChapterById } from "@/server/actions/learning-center/chapter.actions";
import ClientPage from "./_components/client.page";

type PageProps = {
  params: Promise<{ id: string; chapterId: string }>;
};

async function NewMaterialContent({ params }: PageProps) {
  const { id, chapterId } = await params;

  // Fetch chapter to validate it exists and get details
  const chapter = await getChapterById({ id: chapterId });

  if (!chapter) {
    notFound();
  }

  return (
    <ClientPage
      courseId={id}
      chapter={{
        id: chapter.id,
        courseId: chapter.courseId,
        title: chapter.title,
        sequenceOrder: chapter.sequenceOrder,
      }}
    />
  );
}

export default function NewMaterialPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading material form...
        </div>
      }
    >
      <NewMaterialContent params={params} />
    </Suspense>
  );
}
