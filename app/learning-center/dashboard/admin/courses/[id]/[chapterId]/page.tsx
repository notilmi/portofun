import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getChapterById } from "@/server/actions/learning-center/chapter.actions";
import { getMaterialsByChapter } from "@/server/actions/learning-center/material.actions";
import ClientPage from "./_components/client.page";

type PageProps = {
  params: Promise<{ id: string; chapterId: string }>;
};

async function ChapterManagementContent({ params }: PageProps) {
  const { id, chapterId } = await params;

  const [chapter, materials] = await Promise.all([
    getChapterById({ id: chapterId }),
    getMaterialsByChapter({ chapterId }),
  ]);

  if (!chapter) {
    notFound();
  }

  return (
    <ClientPage
      courseId={id}
      initialChapter={{
        id: chapter.id,
        courseId: chapter.courseId,
        title: chapter.title,
        sequenceOrder: chapter.sequenceOrder,
      }}
      initialMaterials={materials.map((material) => ({
        id: material.id,
        chapterId: material.chapterId,
        title: material.title,
        type: material.type as "markdown" | "video" | "quiz",
        sequenceOrder: material.sequenceOrder,
        isArchived: material.isArchived,
      }))}
    />
  );
}

export default function ChapterManagementPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading chapter...</div>
      }
    >
      <ChapterManagementContent params={params} />
    </Suspense>
  );
}
